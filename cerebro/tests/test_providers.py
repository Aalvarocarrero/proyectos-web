import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))
from providers import Capability, HttpReply, ProviderConfig, ProviderError, chat_completion, status


class ProviderAdapterTests(unittest.TestCase):
    def setUp(self):
        self.capabilities = (
            Capability("ollama", "fixture-local-chat", frozenset({"chat"}), True, "synthetic test"),
            Capability("cloudflare", "fixture-cloud-chat", frozenset({"chat"}), True, "synthetic test"),
            Capability("groq", "fixture-groq-chat", frozenset({"chat"}), True, "synthetic test"),
        )
        self.messages = [{"role": "user", "content": "Pregunta ficticia"}]

    def test_off_by_default_and_unverified_selection_never_calls_transport(self):
        self.assertEqual(status()["state"], "desactivado")
        calls = []
        with self.assertRaisesRegex(ProviderError, "desactivada"):
            chat_completion(ProviderConfig("ollama", "fixture-local-chat"), self.capabilities,
                            self.messages, transport=lambda *args: calls.append(args))
        with self.assertRaises(ProviderError) as ctx:
            chat_completion(ProviderConfig("ollama", "unknown-model", enabled=True), self.capabilities,
                            self.messages, transport=lambda *args: calls.append(args))
        self.assertEqual(ctx.exception.code, "capability_unverified")
        self.assertEqual(calls, [])

    def test_ollama_chat_uses_loopback_and_explicit_bounded_payload(self):
        seen = []
        def fake(request, timeout, limit):
            seen.append((request, timeout, limit))
            return HttpReply(200, b'{"message":{"content":"Respuesta ficticia"}}')
        config = ProviderConfig("ollama", "fixture-local-chat", enabled=True,
                                timeout_seconds=5, max_output_tokens=120)
        result = chat_completion(config, self.capabilities, self.messages, transport=fake)
        request, timeout, limit = seen[0]
        payload = json.loads(request.data)
        self.assertEqual(request.full_url, "http://127.0.0.1:11434/api/chat")
        self.assertEqual((timeout, limit), (5, config.max_response_bytes))
        self.assertEqual(payload["options"]["num_predict"], 120)
        self.assertEqual(payload["stream"], False)
        self.assertEqual(result["content"], "Respuesta ficticia")

    def test_cloud_provider_requests_are_explicit_and_do_not_persist_keys(self):
        fixtures = [
            (ProviderConfig("cloudflare", "fixture-cloud-chat", True,
                            account_id="a" * 32, credential_env="CF_FIXTURE_TOKEN"),
             "CF_FIXTURE_TOKEN", "https://api.cloudflare.com/client/v4/accounts/" + "a" * 32 + "/ai/v1/chat/completions"),
            (ProviderConfig("groq", "fixture-groq-chat", True, credential_env="GROQ_FIXTURE_TOKEN"),
             "GROQ_FIXTURE_TOKEN", "https://api.groq.com/openai/v1/chat/completions"),
        ]
        for config, env_name, url in fixtures:
            with self.subTest(provider=config.provider):
                seen = []
                def fake(request, timeout, limit):
                    seen.append(request)
                    return HttpReply(200, b'{"choices":[{"message":{"content":"Texto ficticio"}}]}')
                secret = "synthetic-never-persist-this"
                result = chat_completion(config, self.capabilities, self.messages,
                                         environ={env_name: secret}, transport=fake)
                self.assertEqual(seen[0].full_url, url)
                self.assertEqual(seen[0].get_header("Authorization"), "Bearer " + secret)
                self.assertEqual(result["content"], "Texto ficticio")
                self.assertNotIn(secret, repr(config))

    def test_missing_credentials_and_limits_fail_before_transport(self):
        called = []
        cloud = ProviderConfig("groq", "fixture-groq-chat", enabled=True,
                               credential_env="GROQ_FIXTURE_TOKEN")
        with self.assertRaises(ProviderError) as ctx:
            chat_completion(cloud, self.capabilities, self.messages, environ={},
                            transport=lambda *args: called.append(args))
        self.assertEqual(ctx.exception.code, "configuration_pending")
        long_input = [{"role": "user", "content": "x" * 12_001}]
        with self.assertRaises(ProviderError) as ctx:
            chat_completion(ProviderConfig("ollama", "fixture-local-chat", enabled=True),
                            self.capabilities, long_input, transport=lambda *args: called.append(args))
        self.assertEqual(ctx.exception.code, "input_too_large")
        self.assertEqual(called, [])

    def test_429_is_reported_without_retry_or_rotation_and_error_is_secret_safe(self):
        calls = []
        secret = "fixture-token-must-not-appear"
        config = ProviderConfig("groq", "fixture-groq-chat", enabled=True,
                               credential_env="GROQ_FIXTURE_TOKEN")
        def limited(request, timeout, limit):
            calls.append(request)
            return HttpReply(429, secret.encode())
        with self.assertRaises(ProviderError) as ctx:
            chat_completion(config, self.capabilities, self.messages,
                            environ={"GROQ_FIXTURE_TOKEN": secret}, transport=limited)
        self.assertEqual(ctx.exception.code, "rate_limited")
        self.assertEqual(len(calls), 1)
        self.assertNotIn(secret, str(ctx.exception))
        self.assertNotIn(self.messages[0]["content"], str(ctx.exception))

    def test_oversized_or_malformed_responses_are_discarded_safely(self):
        config = ProviderConfig("ollama", "fixture-local-chat", enabled=True,
                                max_response_bytes=32)
        with self.assertRaises(ProviderError) as ctx:
            chat_completion(config, self.capabilities, self.messages,
                            transport=lambda *_: HttpReply(200, b"x" * 33))
        self.assertEqual(ctx.exception.code, "response_too_large")
        with self.assertRaises(ProviderError) as ctx:
            chat_completion(ProviderConfig("ollama", "fixture-local-chat", enabled=True),
                            self.capabilities, self.messages,
                            transport=lambda *_: HttpReply(200, b"private malformed response"))
        self.assertEqual(ctx.exception.code, "invalid_response")
        self.assertNotIn("private malformed", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
