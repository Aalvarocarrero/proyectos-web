"""Disconnected local-assistant contracts. This module performs no I/O by itself."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Mapping, Protocol

MAX_TURN_CHARS = 6_000
VOICE_LOCALE = "es-ES"
VOICE_INPUT_METHOD = "push_to_talk"


class AssistantError(ValueError):
    """Short Spanish error safe for UI display; never includes request contents."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class LocalModelConfig:
    provider: str = "local"
    model: str = ""
    enabled: bool = False
    endpoint: str | None = None
    credential_env: str | None = None
    voice_runtime_enabled: bool = False


def default_local_model_config() -> LocalModelConfig:
    """Return disconnected configuration: no endpoint, key, model, or enablement."""
    return LocalModelConfig()


@dataclass(frozen=True)
class ProjectPermissions:
    project_id: str
    local_model: bool = False
    voice_input: bool = False
    voice_output: bool = False
    external_provider: bool = False
    audio_transmission: bool = False


_PERMISSION_FIELDS = {
    "local_model", "voice_input", "voice_output", "external_provider", "audio_transmission"
}


def resolve_project_permissions(
    project_id: str,
    grants: Mapping[str, Mapping[str, bool]] | None = None,
) -> ProjectPermissions:
    """Resolve exact-project grants; absent projects and absent fields are denied."""
    if not isinstance(project_id, str) or not project_id or len(project_id) > 100:
        raise AssistantError("invalid_project", "Selecciona un proyecto válido.")
    grants = {} if grants is None else grants
    if not isinstance(grants, Mapping):
        raise AssistantError("invalid_permissions", "Los permisos por proyecto no son válidos.")
    raw = grants.get(project_id, {})
    if not isinstance(raw, Mapping) or set(raw) - _PERMISSION_FIELDS:
        raise AssistantError("invalid_permissions", "Los permisos por proyecto contienen campos no admitidos.")
    if any(type(value) is not bool for value in raw.values()):
        raise AssistantError("invalid_permissions", "Cada permiso debe ser verdadero o falso.")
    return ProjectPermissions(project_id=project_id, **raw)


@dataclass(frozen=True)
class VoiceTurn:
    """Future transcript contract; it carries text, never audio bytes."""

    project_id: str
    locale: str
    input_method: str
    transcript: str
    capture_consent: bool
    device_permission_granted: bool
    transcript_confirmed: bool


_VOICE_TURN_FIELDS = {
    "project_id", "locale", "input_method", "transcript", "capture_consent",
    "device_permission_granted", "transcript_confirmed",
}


def voice_turn_from_mapping(payload: object) -> VoiceTurn:
    """Parse the text-only request contract; audio blobs and extra fields are rejected."""
    if not isinstance(payload, dict) or set(payload) != _VOICE_TURN_FIELDS:
        raise AssistantError("invalid_voice_turn", "La solicitud debe cumplir el contrato de texto es-ES; no admite audio.")
    if any(not isinstance(payload[key], str) for key in ("project_id", "locale", "input_method", "transcript")):
        raise AssistantError("invalid_voice_turn", "Los campos textuales de la solicitud deben ser cadenas.")
    if any(type(payload[key]) is not bool for key in ("capture_consent", "device_permission_granted", "transcript_confirmed")):
        raise AssistantError("invalid_voice_turn", "Los permisos de voz deben ser valores booleanos explícitos.")
    return VoiceTurn(**payload)


def validate_voice_turn(
    turn: VoiceTurn,
    *,
    active_project_id: str,
    permissions: ProjectPermissions,
) -> VoiceTurn:
    """Validate a proposed one-turn Spanish transcript; does not capture or persist it."""
    if not isinstance(turn, VoiceTurn):
        raise AssistantError("invalid_voice_turn", "La solicitud de voz no coincide con el contrato de texto.")
    if turn.project_id != active_project_id or permissions.project_id != active_project_id:
        raise AssistantError("project_scope", "La solicitud no coincide con el proyecto activo.")
    if any(type(value) is not bool for value in (permissions.voice_input, turn.capture_consent,
                                                  turn.device_permission_granted, turn.transcript_confirmed)):
        raise AssistantError("invalid_voice_turn", "Los permisos de voz deben ser valores booleanos explícitos.")
    if not permissions.voice_input or permissions.audio_transmission:
        raise AssistantError("voice_forbidden", "La entrada de voz no está autorizada en este proyecto.")
    if turn.locale != VOICE_LOCALE or turn.input_method != VOICE_INPUT_METHOD:
        raise AssistantError("voice_contract", "La entrada requiere una pulsación explícita y el idioma es-ES.")
    if not turn.capture_consent:
        raise AssistantError("capture_consent_required", "Hace falta consentimiento explícito para una captura puntual.")
    if not turn.device_permission_granted:
        raise AssistantError("device_permission_required", "El dispositivo no ha concedido permiso de micrófono.")
    if not turn.transcript_confirmed:
        raise AssistantError("transcript_confirmation_required", "Confirma la transcripción antes de procesarla.")
    if not isinstance(turn.transcript, str) or not turn.transcript.strip() or len(turn.transcript) > MAX_TURN_CHARS:
        raise AssistantError("invalid_transcript", "La transcripción debe contener texto de hasta 6.000 caracteres.")
    return turn


@dataclass(frozen=True)
class ModelRequest:
    project_id: str
    locale: str
    text: str
    source: str = "typed_text"


@dataclass(frozen=True)
class ModelReply:
    text: str
    simulation: bool
    real_connection_verified: bool = False


class LocalProvider(Protocol):
    provider_id: str

    def complete(self, request: ModelRequest) -> ModelReply: ...


LocalBackend = Callable[[ModelRequest], ModelReply]


class LocalModelAdapter:
    """Local-only adapter port. It has no default backend and never opens a socket."""

    provider_id = "local"

    def __init__(self, backend: LocalBackend | None = None):
        self._backend = backend

    def complete(self, request: ModelRequest) -> ModelReply:
        if self._backend is None:
            raise AssistantError("model_disconnected", "El modelo local no está instalado ni conectado.")
        try:
            reply = self._backend(request)
        except Exception:
            raise AssistantError("model_error", "El modelo local no pudo completar la solicitud.") from None
        if not isinstance(reply, ModelReply) or not isinstance(reply.text, str) or not reply.text.strip():
            raise AssistantError("invalid_model_reply", "El proveedor local devolvió una respuesta no válida.")
        if reply.real_connection_verified and reply.simulation:
            raise AssistantError("invalid_model_reply", "Una simulación no puede marcar una conexión verificada.")
        return reply


class AssistantGateway:
    """Single-call, project-scoped gateway. No memory lookup, retries, logging, or persistence."""

    def __init__(
        self,
        *,
        config: LocalModelConfig | None = None,
        provider: LocalProvider | None = None,
        grants: Mapping[str, Mapping[str, bool]] | None = None,
    ):
        self.config = config or default_local_model_config()
        self.provider = provider
        self.grants = grants or {}

    def complete(
        self,
        *,
        project_id: str,
        text: str,
        locale: str = VOICE_LOCALE,
        source: str = "typed_text",
        transcript_confirmed: bool = False,
    ) -> ModelReply:
        if not self.config.enabled:
            raise AssistantError("model_disconnected", "El modelo local está desactivado.")
        if self.config.provider != "local" or self.config.endpoint is not None or self.config.credential_env is not None:
            raise AssistantError("local_only", "Esta fase solo admite un modelo local sin endpoint ni credenciales.")
        if self.provider is None or self.provider.provider_id != "local":
            raise AssistantError("model_disconnected", "El proveedor local no está instalado ni conectado.")
        permission = resolve_project_permissions(project_id, self.grants)
        if not permission.local_model or permission.external_provider:
            raise AssistantError("model_forbidden", "El uso del modelo no está autorizado en este proyecto.")
        voice_ready = (source == "confirmed_transcript" and self.config.voice_runtime_enabled and permission.voice_input and transcript_confirmed is True)
        if (source != "typed_text" and not voice_ready) or locale != VOICE_LOCALE:
            if source == "confirmed_transcript":
                raise AssistantError("voice_not_integrated", "La entrada de voz aún no está conectada al modelo.")
            raise AssistantError("invalid_request", "La solicitud debe ser texto del proyecto en español es-ES.")
        if not isinstance(text, str) or not text.strip() or len(text) > MAX_TURN_CHARS:
            raise AssistantError("invalid_request", "El texto debe contener entre 1 y 6.000 caracteres.")
        request = ModelRequest(project_id=project_id, locale=locale, text=text, source=source)
        return self.provider.complete(request)
