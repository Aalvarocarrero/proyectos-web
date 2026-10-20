"""Optional, explicitly enabled chat provider adapters. Nothing calls this from the app UI."""
from __future__ import annotations

from dataclasses import dataclass
import json
import os
import re
from typing import Callable, Mapping
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

PROVIDERS = {"ollama", "cloudflare", "groq"}
MAX_INPUT_CHARS = 12_000
MAX_OUTPUT_TOKENS = 1_024
MAX_RESPONSE_BYTES = 256_000


class ProviderError(RuntimeError):
    """An error safe for UI display. Never carries a prompt, response, URL, or credential."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class Capability:
    provider: str
    model: str
    capabilities: frozenset[str]
    verified: bool
    source: str


@dataclass(frozen=True)
class ProviderConfig:
    provider: str
    model: str
    enabled: bool = False
    account_id: str = ""
    credential_env: str = ""
    timeout_seconds: float = 12.0
    max_output_tokens: int = 512
    max_response_bytes: int = MAX_RESPONSE_BYTES


@dataclass(frozen=True)
class HttpReply:
    status: int
    body: bytes


Transport = Callable[[Request, float, int], HttpReply]


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _urllib_transport(request: Request, timeout: float, response_limit: int) -> HttpReply:
    opener = build_opener(_NoRedirect())
    try:
        with opener.open(request, timeout=timeout) as response:
            body = response.read(response_limit + 1)
            return HttpReply(response.status, body)
    except HTTPError as error:
        # Discard provider response bodies; they may echo private prompts or request metadata.
        return HttpReply(error.code, b"")
    except (URLError, TimeoutError, OSError):
        raise ProviderError("connection_failed", "No se pudo completar la conexión con el proveedor.") from None


def status(config: ProviderConfig | None = None) -> dict[str, str]:
    if config is None or not config.enabled:
        return {"state": "desactivado", "detail": "Sin conexión activa; requiere selección y configuración explícitas."}
    return {"state": "pendiente", "detail": "Configurado, pero no se ha comprobado una capacidad ni una conexión real."}


def _validate(config: ProviderConfig, capabilities: tuple[Capability, ...], environ: Mapping[str, str]) -> str | None:
    if not config.enabled:
        raise ProviderError("disabled", "La conexión con proveedores está desactivada.")
    if config.provider not in PROVIDERS or not config.model or len(config.model) > 200:
        raise ProviderError("invalid_selection", "Selecciona un proveedor y un modelo explícitos válidos.")
    if not 0.1 <= config.timeout_seconds <= 60:
        raise ProviderError("invalid_limits", "El tiempo máximo debe estar entre 0,1 y 60 segundos.")
    if not 1 <= config.max_output_tokens <= MAX_OUTPUT_TOKENS:
        raise ProviderError("invalid_limits", "El límite de salida debe estar entre 1 y 1024 tokens.")
    if not 1 <= config.max_response_bytes <= MAX_RESPONSE_BYTES:
        raise ProviderError("invalid_limits", "El límite de respuesta excede el máximo local permitido.")
    match = next((c for c in capabilities if c.provider == config.provider and c.model == config.model), None)
    if not match or not match.verified or "chat" not in match.capabilities:
        raise ProviderError("capability_unverified", "No hay comprobación verificada de capacidad de chat para ese modelo.")
    if config.provider == "cloudflare":
        if not re.fullmatch(r"[a-fA-F0-9]{32}", config.account_id):
            raise ProviderError("configuration_pending", "Falta una configuración válida de cuenta de Workers AI.")
    if config.provider in {"cloudflare", "groq"}:
        if not re.fullmatch(r"[A-Z][A-Z0-9_]{0,63}", config.credential_env):
            raise ProviderError("configuration_pending", "La credencial debe indicarse por nombre de variable de entorno.")
        if not environ.get(config.credential_env):
            raise ProviderError("configuration_pending", "Falta la variable de credencial del proveedor.")
    return environ.get(config.credential_env) if config.credential_env else None


def _validate_messages(messages: list[dict], max_chars: int = MAX_INPUT_CHARS) -> list[dict[str, str]]:
    if not isinstance(messages, list) or not 1 <= len(messages) <= 16:
        raise ProviderError("invalid_input", "La solicitud debe contener de 1 a 16 mensajes seleccionados explícitamente.")
    clean: list[dict[str, str]] = []
    total = 0
    for item in messages:
        if not isinstance(item, dict) or set(item) != {"role", "content"}:
            raise ProviderError("invalid_input", "Cada mensaje debe contener únicamente role y content de texto.")
        role, content = item["role"], item["content"]
        if role not in {"system", "user", "assistant"} or not isinstance(content, str):
            raise ProviderError("invalid_input", "Formato de mensaje no admitido.")
        total += len(content)
        if total > max_chars:
            raise ProviderError("input_too_large", "La selección supera el límite local de texto.")
        clean.append({"role": role, "content": content})
    return clean


def _make_request(config: ProviderConfig, token: str | None, messages: list[dict[str, str]]) -> Request:
    headers = {"Content-Type": "application/json"}
    if config.provider == "ollama":
        url = "http://127.0.0.1:11434/api/chat"
        payload = {"model": config.model, "messages": messages, "stream": False,
                   "options": {"num_predict": config.max_output_tokens}}
    elif config.provider == "cloudflare":
        url = f"https://api.cloudflare.com/client/v4/accounts/{config.account_id}/ai/v1/chat/completions"
        payload = {"model": config.model, "messages": messages, "stream": False,
                   "max_tokens": config.max_output_tokens, "options": {"rejectIfBusy": True}}
        headers["Authorization"] = f"Bearer {token}"
    else:
        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = {"model": config.model, "messages": messages, "stream": False,
                   "max_completion_tokens": config.max_output_tokens}
        headers["Authorization"] = f"Bearer {token}"
    return Request(url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"), headers=headers, method="POST")


def chat_completion(
    config: ProviderConfig,
    capabilities: tuple[Capability, ...],
    messages: list[dict],
    *,
    environ: Mapping[str, str] | None = None,
    transport: Transport | None = None,
) -> dict[str, str]:
    """Make one explicit, bounded request. No retries, provider rotation, memory lookup, or logging."""
    env = os.environ if environ is None else environ
    token = _validate(config, capabilities, env)
    selected = _validate_messages(messages)
    request = _make_request(config, token, selected)
    send = transport or _urllib_transport
    reply = send(request, config.timeout_seconds, config.max_response_bytes)
    if reply.status == 429:
        raise ProviderError("rate_limited", "El proveedor indicó límite de uso (429); no se reintenta ni se cambia de proveedor.")
    if reply.status in {301, 302, 303, 307, 308}:
        raise ProviderError("redirect_blocked", "El proveedor devolvió una redirección; se bloqueó por seguridad.")
    if reply.status < 200 or reply.status >= 300:
        raise ProviderError("provider_error", f"El proveedor devolvió HTTP {reply.status}.")
    if len(reply.body) > config.max_response_bytes:
        raise ProviderError("response_too_large", "La respuesta supera el límite local y se descartó.")
    try:
        data = json.loads(reply.body)
        if config.provider == "ollama":
            content = data["message"]["content"]
        else:
            content = data["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError):
        raise ProviderError("invalid_response", "La respuesta del proveedor no coincide con el contrato esperado.") from None
    if not isinstance(content, str) or not content:
        raise ProviderError("invalid_response", "El proveedor no devolvió texto de respuesta.")
    return {"provider": config.provider, "model": config.model, "content": content}
