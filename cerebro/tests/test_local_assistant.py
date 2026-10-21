import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))
from local_assistant import (
    AssistantError,
    AssistantGateway,
    LocalModelAdapter,
    LocalModelConfig,
    ModelReply,
    ProjectPermissions,
    default_local_model_config,
    resolve_project_permissions,
    validate_voice_turn,
    voice_turn_from_mapping,
)


class SyntheticLocalProvider:
    """Test-only injected backend: no model, socket, or persistent reply."""

    def __init__(self):
        self.calls = []

    def __call__(self, request):
        self.calls.append(request)
        return ModelReply(
            "RESPUESTA SINTÉTICA DE PRUEBA; NO ES UNA RESPUESTA DE IA.",
            simulation=True,
            real_connection_verified=False,
        )


class LocalAssistantContractTests(unittest.TestCase):
    def test_local_configuration_is_disconnected_and_contains_no_endpoint_or_secret(self):
        config = default_local_model_config()
        self.assertEqual(config, LocalModelConfig())
        self.assertEqual(config.provider, "local")
        self.assertFalse(config.enabled)
        self.assertEqual(config.model, "")
        self.assertIsNone(config.endpoint)
        self.assertIsNone(config.credential_env)

    def test_project_permissions_are_exact_and_deny_by_default(self):
        denied = resolve_project_permissions("project-a")
        self.assertEqual(denied, ProjectPermissions("project-a"))
        grants = {"project-a": {"local_model": True, "voice_input": True}}
        self.assertTrue(resolve_project_permissions("project-a", grants).local_model)
        self.assertFalse(resolve_project_permissions("project-b", grants).local_model)
        with self.assertRaises(AssistantError):
            resolve_project_permissions("project-a", {"project-a": {"local_model": "yes"}})
        with self.assertRaises(AssistantError):
            resolve_project_permissions("project-a", {"project-a": {"all_projects": True}})

    def test_disconnected_gateway_and_unconfigured_adapter_never_call_backend(self):
        calls = []
        adapter = LocalModelAdapter()
        with self.assertRaises(AssistantError) as ctx:
            adapter.complete(None)
        self.assertEqual(ctx.exception.code, "model_disconnected")

        gateway = AssistantGateway(provider=adapter, grants={"project-a": {"local_model": True}})
        with self.assertRaises(AssistantError) as ctx:
            gateway.complete(project_id="project-a", text="Pregunta ficticia")
        self.assertEqual(ctx.exception.code, "model_disconnected")
        self.assertEqual(calls, [])

    def test_fake_provider_runs_once_only_for_the_explicitly_granted_project(self):
        backend = SyntheticLocalProvider()
        provider = LocalModelAdapter(backend=backend)
        gateway = AssistantGateway(
            config=LocalModelConfig(model="fixture-local", enabled=True),
            provider=provider,
            grants={"project-a": {"local_model": True}},
        )
        with self.assertRaises(AssistantError) as ctx:
            gateway.complete(project_id="project-b", text="Pregunta ficticia")
        self.assertEqual(ctx.exception.code, "model_forbidden")
        self.assertEqual(backend.calls, [])

        reply = gateway.complete(project_id="project-a", text="Pregunta sintética")
        self.assertEqual(len(backend.calls), 1)
        self.assertEqual(backend.calls[0].project_id, "project-a")
        self.assertEqual(backend.calls[0].locale, "es-ES")
        self.assertEqual(backend.calls[0].source, "typed_text")
        self.assertTrue(reply.simulation)
        self.assertFalse(reply.real_connection_verified)
        self.assertIn("SINTÉTICA", reply.text)

    def test_gateway_rejects_remote_endpoint_credentials_and_provider(self):
        backend = SyntheticLocalProvider()
        provider = LocalModelAdapter(backend=backend)
        grants = {"project-a": {"local_model": True}}
        unsafe_configs = [
            LocalModelConfig(provider="groq", model="fixture", enabled=True),
            LocalModelConfig(model="fixture", enabled=True, endpoint="http://127.0.0.1:11434"),
            LocalModelConfig(model="fixture", enabled=True, credential_env="MODEL_KEY"),
        ]
        for config in unsafe_configs:
            with self.subTest(config=config):
                gateway = AssistantGateway(config=config, provider=provider, grants=grants)
                with self.assertRaises(AssistantError):
                    gateway.complete(project_id="project-a", text="Pregunta sintética")
        self.assertEqual(backend.calls, [])

    def test_voice_contract_requires_spanish_push_to_talk_consent_and_confirmation(self):
        permissions = resolve_project_permissions(
            "project-a", {"project-a": {"voice_input": True}}
        )
        valid = {
            "project_id": "project-a",
            "locale": "es-ES",
            "input_method": "push_to_talk",
            "transcript": "Texto sintético confirmado.",
            "capture_consent": True,
            "device_permission_granted": True,
            "transcript_confirmed": True,
        }
        turn = voice_turn_from_mapping(valid)
        self.assertEqual(validate_voice_turn(turn, active_project_id="project-a", permissions=permissions), turn)
        for field, value in (("locale", "en-GB"), ("input_method", "always_on"),
                             ("capture_consent", False), ("device_permission_granted", False),
                             ("transcript_confirmed", False)):
            candidate = dict(valid, **{field: value})
            with self.subTest(field=field), self.assertRaises(AssistantError):
                validate_voice_turn(voice_turn_from_mapping(candidate), active_project_id="project-a", permissions=permissions)

    def test_voice_contract_rejects_audio_blobs_cross_project_and_ungranted_project(self):
        payload = {
            "project_id": "project-a", "locale": "es-ES", "input_method": "push_to_talk",
            "transcript": "Texto sintético.", "capture_consent": True,
            "device_permission_granted": True, "transcript_confirmed": True,
        }
        permissions = resolve_project_permissions("project-a", {"project-a": {"voice_input": True}})
        with self.assertRaises(AssistantError):
            voice_turn_from_mapping({**payload, "audio": b"must never be accepted"})
        with self.assertRaises(AssistantError) as ctx:
            validate_voice_turn(voice_turn_from_mapping(payload), active_project_id="project-b", permissions=permissions)
        self.assertEqual(ctx.exception.code, "project_scope")
        with self.assertRaises(AssistantError) as ctx:
            validate_voice_turn(voice_turn_from_mapping(payload), active_project_id="project-a",
                                permissions=resolve_project_permissions("project-a"))
        self.assertEqual(ctx.exception.code, "voice_forbidden")

    def test_voice_transcript_cannot_reach_gateway_before_voice_runtime_exists(self):
        backend = SyntheticLocalProvider()
        provider = LocalModelAdapter(backend=backend)
        gateway = AssistantGateway(
            config=LocalModelConfig(model="fixture-local", enabled=True), provider=provider,
            grants={"project-a": {"local_model": True, "voice_input": True}},
        )
        with self.assertRaises(AssistantError) as ctx:
            gateway.complete(project_id="project-a", text="Texto sintético", source="confirmed_transcript")
        self.assertEqual(ctx.exception.code, "voice_not_integrated")
        self.assertEqual(backend.calls, [])

    def test_gateway_does_not_mutate_the_existing_local_journal(self):
        from server import Store

        with tempfile.TemporaryDirectory() as directory:
            store = Store(directory)
            before = store.path.joinpath("journal.jsonl").read_bytes() if store.path.joinpath("journal.jsonl").exists() else b""
            backend = SyntheticLocalProvider()
            provider = LocalModelAdapter(backend=backend)
            gateway = AssistantGateway(
                config=LocalModelConfig(model="fixture-local", enabled=True), provider=provider,
                grants={"project-a": {"local_model": True}},
            )
            reply = gateway.complete(project_id="project-a", text="Pregunta sintética")
            after = store.path.joinpath("journal.jsonl").read_bytes() if store.path.joinpath("journal.jsonl").exists() else b""
            self.assertTrue(reply.simulation)
            self.assertEqual(before, after)
            self.assertEqual(Store(directory).doc, store.doc)


if __name__ == "__main__":
    unittest.main()
