import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))
from codex_app_server import (  # noqa: E402
    AppServerConfig,
    DENY_ESCALATIONS,
    PERMISSION_PROFILE,
    AppServerError,
    CodexAppServerAdapter,
    JsonlProcessTransport,
    OperationLedger,
    ProjectSessionMap,
)


class FakeRpc:
    simulation = True

    def __init__(self):
        self.calls = []
        self.events = []
        self.responses = []
        self.closed = False
        self.started = threading.Event()

    def request(self, method, params, timeout=30):
        self.calls.append((method, dict(params)))
        if method == "thread/start":
            return {"thread": {"id": "thread-a"}}
        if method == "turn/start":
            self.started.set()
            return {"turn": {"id": "turn-a", "status": "inProgress"}}
        if method == "thread/turns/list":
            return {"turns": [{"id": "turn-a"}], "source": "synthetic-fixture"}
        return {}

    def notify(self, method, params):
        self.calls.append((method, dict(params)))

    def notifications(self, timeout=0.2):
        if self.events:
            return [self.events.pop(0)]
        self.started.wait(timeout)
        return []

    def respond(self, request_id, result):
        self.responses.append((request_id, dict(result)))

    def close(self):
        self.closed = True


class CodexAppServerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name).resolve() / "project-a"
        self.root.mkdir()
        self.profile = Path(self.tmp.name) / "isolated-profile"
        self.profile.mkdir()
        self.fake = FakeRpc()
        self.config = AppServerConfig(
            enabled=True,
            turns_enabled=True,
            executable="/not-used-in-tests",
            data_dir=str(self.profile),
            project_roots={"project-a": str(self.root), "project-b": str(self.root)},
        )
        self.sessions = ProjectSessionMap(Path(self.tmp.name) / "private" / "sessions.json")
        self.adapter = CodexAppServerAdapter(self.config, self.sessions,
                                             lambda config, confirmed: self.fake)

    def tearDown(self):
        self.tmp.cleanup()

    def test_disabled_and_explicit_connection_gate(self):
        disabled = CodexAppServerAdapter(AppServerConfig(), self.sessions,
                                         lambda *_: self.fail("must not create transport"))
        with self.assertRaisesRegex(AppServerError, "desactivada"):
            disabled.connect(user_confirmed=True)
        with self.assertRaisesRegex(AppServerError, "Confirma"):
            self.adapter.connect(user_confirmed=False)
        self.assertEqual(self.fake.calls, [])

    def test_process_start_requires_explicit_confirmation_and_dedicated_profile(self):
        fake_binary = Path(self.tmp.name) / "codex-fake"
        fake_binary.write_text("synthetic fixture; never executed")
        fake_binary.chmod(0o700)
        config = AppServerConfig(enabled=True, executable=str(fake_binary), data_dir=str(self.profile))
        with patch("codex_app_server.subprocess.Popen") as popen:
            with self.assertRaisesRegex(AppServerError, "Confirma explícitamente"):
                JsonlProcessTransport.start(config, user_confirmed=False)
            popen.assert_not_called()
        class FakeProcess:
            stdin = None
            stdout = []
            def poll(self): return 0
        with patch("codex_app_server.subprocess.Popen", return_value=FakeProcess()) as popen:
            transport = JsonlProcessTransport.start(config, user_confirmed=True)
            args, kwargs = popen.call_args
            self.assertEqual(args[0][0], str(fake_binary))
            self.assertIn(("--config", "features.shell_tool=false"), list(zip(args[0][1::2], args[0][2::2])))
            self.assertIn(("--config", "mcp_servers={}"), list(zip(args[0][1::2], args[0][2::2])))
            self.assertEqual(args[0][-3:], ["app-server", "--listen", "stdio://"])
            self.assertFalse(kwargs["shell"])
            self.assertEqual(kwargs["env"]["HOME"], str(self.profile))
            self.assertEqual(kwargs["env"]["CODEX_HOME"], str(self.profile / ".codex"))
            self.assertNotIn("OPENAI_API_KEY", kwargs["env"])
            transport.close()
        self.assertEqual(self.adapter.capability["realConnectionVerified"], False)
        self.assertEqual(self.adapter.capability["hostedAllowed"], False)

        turns_off = CodexAppServerAdapter(AppServerConfig(enabled=True, project_roots={"project-a": str(self.root)}),
                                          self.sessions, lambda *_: self.fake)
        with self.assertRaisesRegex(AppServerError, "turnos reales siguen bloqueados"):
            list(turns_off.turn("project-a", "pregunta", operation_id="disabled", user_confirmed=True))
        self.assertEqual(self.fake.calls, [])

    def test_handshake_and_turn_stream_are_per_project_and_memory_not_injected(self):
        self.adapter.connect(user_confirmed=True)
        # Synthetic responses are labelled all the way to consumers.
        self.fake.events = [
            {"method": "item/agentMessage/delta", "params": {"turnId": "turn-a", "delta": "Respuesta ficticia"}},
            {"jsonrpc": "2.0", "id": "server-approval", "method": "item/commandExecution/requestApproval",
             "params": {"threadId": "thread-a", "turnId": "turn-a"}},
            {"method": "turn/completed", "params": {"turn": {"id": "turn-a", "status": "completed"}}},
        ]
        output = list(self.adapter.turn("project-a", "Texto sintético; sin memoria", operation_id="op-1", user_confirmed=True))
        self.assertEqual([e.kind for e in output], ["started", "delta", "completed"])
        self.assertTrue(all(e.simulation for e in output))
        self.assertTrue(all(not e.real_connection_verified for e in output))
        methods = [method for method, _ in self.fake.calls]
        self.assertEqual(methods[:2], ["initialize", "initialized"])
        self.assertIn("thread/start", methods)
        params = next(p for method, p in self.fake.calls if method == "turn/start")
        self.assertEqual(params["input"], [{"type": "text", "text": "Texto sintético; sin memoria"}])
        self.assertNotIn("memory", params)
        self.assertEqual(params["cwd"], str(self.root))
        self.assertEqual(params["permissions"], PERMISSION_PROFILE)
        self.assertEqual(params["approvalPolicy"], DENY_ESCALATIONS)
        self.assertNotIn("sandboxPolicy",params)
        thread_params=next(p for method,p in self.fake.calls if method=="thread/start")
        self.assertEqual(thread_params["config"]["permissions"][PERMISSION_PROFILE]["filesystem"],{":minimal":"read",str(self.root):"read"})
        self.assertFalse(thread_params["config"]["permissions"][PERMISSION_PROFILE]["network"]["enabled"])
        self.assertEqual(self.sessions.get("project-a"), "thread-a")
        self.assertEqual(self.fake.responses, [("server-approval", {"decision": "decline"})])

    def test_session_map_persists_without_transcripts_or_cross_project_reuse(self):
        self.adapter.connect(user_confirmed=True)
        self.sessions.put("project-a", "thread-a", str(self.root))
        reloaded = ProjectSessionMap(self.sessions.path)
        self.assertEqual(reloaded.get("project-a"), "thread-a")
        self.assertIsNone(reloaded.get("project-b"))
        saved = self.sessions.path.read_text(encoding="utf-8")
        self.assertNotIn("prompt", saved)
        self.assertNotIn("memory", saved)
        self.assertNotIn("Texto sintético", saved)
        self.assertEqual(self.sessions.path.stat().st_mode & 0o777, 0o600)
        with self.assertRaisesRegex(AppServerError, "carpeta local"):
            self.adapter.history("not-configured")

    def test_existing_thread_resumes_by_exact_project_and_history_is_server_side(self):
        self.adapter.connect(user_confirmed=True)
        self.sessions.put("project-a", "thread-a", str(self.root))
        self.assertEqual(self.adapter.history("project-a")["source"], "synthetic-fixture")
        methods = [method for method, _ in self.fake.calls]
        self.assertEqual(methods, ["initialize", "initialized", "thread/turns/list"])
        self.assertEqual(self.fake.calls[-1][1], {"threadId": "thread-a"})

    def test_cancel_requires_current_project_and_active_turn(self):
        self.adapter.connect(user_confirmed=True)
        self.sessions.put("project-a", "thread-a", str(self.root))
        with self.assertRaisesRegex(AppServerError, "No hay un turno"):
            self.adapter.cancel("project-a")
        self.adapter._active_turn["project-a"] = "turn-a"
        self.adapter.cancel("project-a")
        self.assertEqual(self.fake.calls[-1], ("turn/interrupt", {"threadId": "thread-a", "turnId": "turn-a"}))

    def test_invalid_or_unconfirmed_prompt_never_reaches_transport(self):
        self.adapter.connect(user_confirmed=True)
        for args in [("project-a", "hola", False), ("project-a", "", True),
                     ("missing", "hola", True), ("project-a", "x" * 12001, True)]:
            with self.subTest(args=args), self.assertRaises(AppServerError):
                list(self.adapter.turn(args[0], args[1], operation_id="op-bad", user_confirmed=args[2]))
        self.assertNotIn("turn/start", [method for method, _ in self.fake.calls])

    def test_uncertain_turn_never_retries_after_lost_response_or_restart(self):
        self.adapter.connect(user_confirmed=True)
        self.fake.events = []
        # Stream ends without a turn/completed notification: outcome is unknown.
        self.fake.notifications = lambda timeout=0.2: []
        with self.assertRaisesRegex(AppServerError, "superó el límite"):
            list(self.adapter.turn("project-a", "Texto único", operation_id="op-uncertain",
                                   user_confirmed=True, timeout=1))
        persisted = OperationLedger(self.adapter.ledger.path)
        self.assertEqual(persisted.get("op-uncertain")["state"], "uncertain")
        before = len([method for method, _ in self.fake.calls if method == "turn/start"])
        replacement = CodexAppServerAdapter(self.config, ProjectSessionMap(self.sessions.path),
                                            lambda *_: self.fake)
        replacement.connect(user_confirmed=True)
        replacement.ledger = persisted
        with self.assertRaisesRegex(AppServerError, "intento previo sin resultado"):
            list(replacement.turn("project-a", "Segundo texto", operation_id="op-next", user_confirmed=True))
        with self.assertRaisesRegex(AppServerError, "ya se registró"):
            persisted.begin("project-a", "op-uncertain", "Texto único", "thread-a")
        after = len([method for method, _ in self.fake.calls if method == "turn/start"])
        self.assertEqual(before, after)

    def test_project_root_change_cannot_resume_old_conversation(self):
        other = Path(self.tmp.name) / "project-new"
        other.mkdir()
        self.sessions.put("project-a", "thread-a", str(self.root))
        changed = AppServerConfig(enabled=True, data_dir=str(self.profile), project_roots={"project-a": str(other)})
        adapter = CodexAppServerAdapter(changed, self.sessions, lambda *_: self.fake)
        adapter.connect(user_confirmed=True)
        with self.assertRaisesRegex(AppServerError, "carpeta configurada cambió"):
            adapter.history("project-a")
        self.assertNotIn("thread/resume", [method for method, _ in self.fake.calls])

    def test_corrupt_session_index_fails_closed(self):
        path = Path(self.tmp.name) / "corrupt.json"
        path.write_text('{"version":2,"sessions":{"project-a":{"threadId":"thread-a","cwd":"/tmp"},"project-b":42}}')
        with self.assertRaisesRegex(AppServerError, "no es válido"):
            ProjectSessionMap(path)
        self.assertIn('42', path.read_text())


if __name__ == "__main__":
    unittest.main()

