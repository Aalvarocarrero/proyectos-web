"""Opt-in local Codex App Server client. No process or account is touched on import.

This module deliberately keeps App Server threads separate from Cerebro's journal.
It sends only the text supplied for the active project; it never loads project memory.
"""
from __future__ import annotations

from dataclasses import dataclass
import json
import os
from pathlib import Path
import queue
import subprocess
import threading
import time
from typing import Any, Callable, Mapping, Protocol

DENY_ESCALATIONS = {"granular": {"mcp_elicitations": False, "request_permissions": False,
    "rules": False, "sandbox_approval": False, "skill_approval": False}}
PERMISSION_PROFILE = "jarvis_read_fixture"

def restricted_thread_params(cwd):
    return {"cwd": cwd, "approvalPolicy": DENY_ESCALATIONS,
            "permissions": PERMISSION_PROFILE, "runtimeWorkspaceRoots": [cwd],
            "selectedCapabilityRoots": [], "environments": [],
            "config": {"permissions": {PERMISSION_PROFILE: {
                "filesystem": {":minimal": "read", cwd: "read"},
                "network": {"enabled": False}}}}}

MAX_PROMPT_CHARS = 6_000
MAX_EVENT_CHARS = 20_000
PROCESS_OVERRIDES = (
    ("features.shell_tool", "false"),
    ("approval_policy", '{granular={mcp_elicitations=false,request_permissions=false,rules=false,sandbox_approval=false,skill_approval=false}}'),
    ("features.hooks", "false"),
    ("notify", "[]"),
    ("features.plugins", "false"),
    ("features.skill_mcp_dependency_install", "false"),
    ("apps._default.enabled", "false"),
    ("mcp_servers", "{}"),
    ("plugins", "{}"),
    ("tools.web_search", "false"),
    ("web_search", '"disabled"'),
    ("history.persistence", '"none"'),
)


class AppServerError(ValueError):
    """Safe user-facing error; never includes prompts, tokens, or process output."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class AppServerConfig:
    enabled: bool = False
    turns_enabled: bool = False
    executable: str = ""
    data_dir: str = ""
    project_roots: Mapping[str, str] | None = None


@dataclass(frozen=True)
class AssistantEvent:
    kind: str
    text: str = ""
    turn_id: str = ""
    simulation: bool = False
    real_connection_verified: bool = False


class RpcTransport(Protocol):
    def request(self, method: str, params: Mapping[str, Any], timeout: float = 30) -> Any: ...
    def notify(self, method: str, params: Mapping[str, Any]) -> None: ...
    def notifications(self, timeout: float = 0.2) -> list[dict[str, Any]]: ...
    def respond(self, request_id: int | str, result: Mapping[str, Any]) -> None: ...
    def respond_error(self, request_id: int | str, code: int, message: str) -> None: ...
    def close(self) -> None: ...


class JsonlProcessTransport:
    """JSONL stdio transport. Construction itself is inert; start is explicit."""

    def __init__(self, process: subprocess.Popen[str]):
        self._process = process
        self._next_id = 0
        self._write_lock = threading.Lock()
        self._condition = threading.Condition()
        self._responses: dict[int, tuple[threading.Event, dict[str, Any]]] = {}
        self._notifications: queue.Queue[dict[str, Any]] = queue.Queue()
        self._reader = threading.Thread(target=self._read_loop, name="app-server-jsonl", daemon=True)
        self._reader.start()

    @classmethod
    def start(cls, config: AppServerConfig, *, user_confirmed: bool) -> "JsonlProcessTransport":
        if not user_confirmed:
            raise AppServerError("confirmation_required", "Confirma explícitamente el inicio del proceso local.")
        if not config.enabled:
            raise AppServerError("disabled", "La integración App Server está desactivada.")
        executable = Path(config.executable)
        data_dir = Path(config.data_dir)
        if not executable.is_absolute() or not executable.is_file() or not os.access(executable, os.X_OK):
            raise AppServerError("executable_unavailable", "Configura la ruta absoluta de un ejecutable App Server válido.")
        if not data_dir.is_absolute() or not data_dir.is_dir():
            raise AppServerError("profile_unavailable", "Configura un directorio local existente para el perfil de App Server.")
        # No shell, no dynamic arguments, and no CODEX_HOME/token injection. The user
        # must separately authenticate through the official App Server flow.
        env = {key: value for key, value in os.environ.items()
               if key in {"PATH", "TMPDIR", "LANG", "LC_ALL"}}
        # Isolate global Codex settings/MCP/credentials. Signing in, if later
        # approved, must happen explicitly in this dedicated profile.
        env["HOME"] = str(data_dir)
        env["CODEX_HOME"] = str(data_dir / ".codex")
        args = [str(executable)]
        for key, value in PROCESS_OVERRIDES:
            args.extend(["--config", f"{key}={value}"])
        args.extend(["app-server", "--listen", "stdio://"])
        try:
            proc = subprocess.Popen(
                args,
                cwd=str(data_dir), stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL, text=True, encoding="utf-8", bufsize=1,
                shell=False, env=env,
            )
        except OSError:
            raise AppServerError("process_start_failed", "No se pudo iniciar el proceso App Server local.") from None
        return cls(proc)

    def _read_loop(self) -> None:
        assert self._process.stdout is not None
        try:
            for line in self._process.stdout:
                try:
                    packet = json.loads(line)
                except (json.JSONDecodeError, UnicodeError):
                    continue
                if not isinstance(packet, dict):
                    continue
                with self._condition:
                    response_id = packet.get("id")
                    if type(response_id) is int and response_id in self._responses and "method" not in packet:
                        event, box = self._responses[response_id]
                        box.update(packet)
                        event.set()
                    elif isinstance(packet.get("method"), str):
                        self._notifications.put(packet)
            with self._condition:
                for event, box in self._responses.values():
                    box["_closed"] = True
                    event.set()
        finally:
            self._notifications.put({"method": "_transport/closed", "params": {}})

    def request(self, method: str, params: Mapping[str, Any], timeout: float = 30) -> Any:
        if not isinstance(method, str) or not method or not isinstance(params, Mapping):
            raise AppServerError("invalid_request", "La solicitud App Server no es válida.")
        if self._process.poll() is not None:
            raise AppServerError("process_stopped", "El proceso App Server se detuvo.")
        with self._condition:
            self._next_id += 1
            request_id = self._next_id
            event, box = threading.Event(), {}
            self._responses[request_id] = (event, box)
        packet = json.dumps({"jsonrpc": "2.0", "id": request_id, "method": method, "params": dict(params)}, separators=(",", ":"))
        try:
            with self._write_lock:
                assert self._process.stdin is not None
                self._process.stdin.write(packet + "\n")
                self._process.stdin.flush()
            if not event.wait(max(0.1, min(timeout, 120))):
                raise AppServerError("request_timeout", "App Server no respondió dentro del plazo.")
            if box.get("_closed"):
                raise AppServerError("process_stopped", "El proceso App Server se detuvo.")
            if "error" in box:
                raise AppServerError("server_error", "App Server rechazó la solicitud; revisa su estado y permisos.")
            return box.get("result")
        except (BrokenPipeError, OSError):
            raise AppServerError("transport_error", "Se interrumpió la conexión local con App Server.") from None
        finally:
            with self._condition:
                self._responses.pop(request_id, None)

    def notify(self, method: str, params: Mapping[str, Any]) -> None:
        if not isinstance(method, str) or not method or not isinstance(params, Mapping):
            raise AppServerError("invalid_request", "La notificación App Server no es válida.")
        packet = json.dumps({"jsonrpc": "2.0", "method": method, "params": dict(params)}, separators=(",", ":"))
        try:
            with self._write_lock:
                assert self._process.stdin is not None
                self._process.stdin.write(packet + "\n")
                self._process.stdin.flush()
        except (BrokenPipeError, OSError):
            raise AppServerError("transport_error", "Se interrumpió la conexión local con App Server.") from None

    def notifications(self, timeout: float = 0.2) -> list[dict[str, Any]]:
        packets: list[dict[str, Any]] = []
        try:
            packets.append(self._notifications.get(timeout=max(0.0, min(timeout, 1.0))))
        except queue.Empty:
            return packets
        while len(packets) < 100:
            try:
                packets.append(self._notifications.get_nowait())
            except queue.Empty:
                break
        return packets

    def respond(self, request_id: int | str, result: Mapping[str, Any]) -> None:
        if type(request_id) not in {int, str} or not isinstance(result, Mapping):
            raise AppServerError("invalid_request", "La respuesta App Server no es válida.")
        packet = json.dumps({"jsonrpc": "2.0", "id": request_id, "result": dict(result)}, separators=(",", ":"))
        try:
            with self._write_lock:
                assert self._process.stdin is not None
                self._process.stdin.write(packet + "\n")
                self._process.stdin.flush()
        except (BrokenPipeError, OSError):
            raise AppServerError("transport_error", "Se interrumpió la conexión local con App Server.") from None

    def respond_error(self, request_id: int | str, code: int, message: str) -> None:
        if type(request_id) not in {int, str} or type(code) is not int:
            raise AppServerError("invalid_request", "La respuesta de error App Server no es válida.")
        packet = json.dumps({"jsonrpc": "2.0", "id": request_id,
                             "error": {"code": code, "message": message}}, separators=(",", ":"))
        try:
            with self._write_lock:
                assert self._process.stdin is not None
                self._process.stdin.write(packet + "\n")
                self._process.stdin.flush()
        except (BrokenPipeError, OSError):
            raise AppServerError("transport_error", "Se interrumpió la conexión local con App Server.") from None

    def close(self) -> None:
        if self._process.poll() is None:
            self._process.terminate()
            try:
                self._process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                self._process.kill()
                self._process.wait(timeout=2)


class ProjectSessionMap:
    """Separate private project->thread index; never stores prompts or memory."""

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self._lock = threading.Lock()
        self._data: dict[str, dict[str, str]] = {}
        if self.path.exists():
            try:
                raw = json.loads(self.path.read_text(encoding="utf-8"))
                if not isinstance(raw, dict) or raw.get("version") != 2 or not isinstance(raw.get("sessions"), dict):
                    raise ValueError
                sessions = raw["sessions"]
                if any(not isinstance(k, str) or not k or not isinstance(v, dict) or
                       set(v) != {"threadId", "cwd"} or not isinstance(v["threadId"], str) or not v["threadId"] or
                       not isinstance(v["cwd"], str) or not Path(v["cwd"]).is_absolute() for k, v in sessions.items()):
                    raise ValueError
                self._data = dict(sessions)
            except (OSError, UnicodeError, json.JSONDecodeError, ValueError):
                raise AppServerError("session_store_invalid", "El índice local de sesiones no es válido; no se modificó.") from None

    def get(self, project_id: str) -> str | None:
        with self._lock:
            entry = self._data.get(project_id)
            return entry["threadId"] if entry else None

    def get_for_project(self, project_id: str, cwd: str) -> str | None:
        with self._lock:
            entry = self._data.get(project_id)
            if not entry:
                return None
            if entry["cwd"] != cwd:
                raise AppServerError("project_scope", "La carpeta configurada cambió; esta conversación pertenece a otra ruta.")
            return entry["threadId"]

    def put(self, project_id: str, thread_id: str, cwd: str) -> None:
        if not project_id or not thread_id or not isinstance(cwd, str) or not Path(cwd).is_absolute():
            raise AppServerError("invalid_session", "El proyecto o hilo no es válido.")
        with self._lock:
            prior = self._data.get(project_id)
            if prior and prior["cwd"] != cwd:
                raise AppServerError("project_scope", "La carpeta configurada cambió; esta conversación pertenece a otra ruta.")
            updated = {**self._data, project_id: {"threadId": thread_id, "cwd": cwd}}
            self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            temp = self.path.with_name(self.path.name + ".tmp")
            try:
                with temp.open("x", encoding="utf-8") as stream:
                    os.chmod(temp, 0o600)
                    json.dump({"version": 2, "sessions": updated}, stream, separators=(",", ":"))
                    stream.flush()
                    os.fsync(stream.fileno())
                os.replace(temp, self.path)
                os.chmod(self.path, 0o600)
            except OSError:
                try:
                    temp.unlink(missing_ok=True)
                except OSError:
                    pass
                raise AppServerError("session_store_write_failed", "No se pudo guardar el vínculo local de sesión.") from None
            self._data = updated


class OperationLedger:
    """Durable intent ledger for App Server turns; uncertain turns are never replayed."""

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self._lock = threading.Lock()
        self._operations: dict[str, dict[str, Any]] = {}
        if self.path.exists():
            try:
                raw = json.loads(self.path.read_text(encoding="utf-8"))
                if not isinstance(raw, dict) or raw.get("version") != 1 or not isinstance(raw.get("operations"), dict):
                    raise ValueError
                operations = raw["operations"]
                if any(not isinstance(key, str) or not key or not isinstance(row, dict) or
                       set(row) != {"projectId", "requestHash", "state", "threadId", "turnId"} or
                       not all(isinstance(row[field], str) for field in row) for key, row in operations.items()):
                    raise ValueError
                self._operations = dict(operations)
            except (OSError, UnicodeError, json.JSONDecodeError, ValueError):
                raise AppServerError("operation_store_invalid", "El registro local de intentos no es válido; no se modificó.") from None

    def _persist(self, updated: dict[str, dict[str, Any]]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        temp = self.path.with_name(self.path.name + ".tmp")
        try:
            with temp.open("x", encoding="utf-8") as stream:
                os.chmod(temp, 0o600)
                json.dump({"version": 1, "operations": updated}, stream, separators=(",", ":"))
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temp, self.path)
            os.chmod(self.path, 0o600)
        except OSError:
            try:
                temp.unlink(missing_ok=True)
            except OSError:
                pass
            raise AppServerError("operation_store_write_failed", "No se pudo guardar el registro local del intento.") from None

    def begin(self, project_id: str, operation_id: str, text: str, thread_id: str) -> None:
        if not isinstance(operation_id, str) or not operation_id or len(operation_id) > 120:
            raise AppServerError("invalid_operation_id", "El identificador durable del intento no es válido.")
        import hashlib
        digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
        with self._lock:
            existing = self._operations.get(operation_id)
            if existing:
                if existing["projectId"] != project_id or existing["requestHash"] != digest:
                    raise AppServerError("operation_conflict", "El identificador del intento ya existe con otro proyecto o contenido.")
                raise AppServerError("operation_exists", "Este intento ya se registró; consulta su historial antes de continuar.")
            unresolved = next((row for row in self._operations.values()
                               if row["projectId"] == project_id and row["state"] in {"intent", "in_progress", "uncertain"}), None)
            if unresolved:
                raise AppServerError("operation_uncertain", "Hay un intento previo sin resultado confirmado; consulta el historial antes de enviar otro.")
            updated = {**self._operations, operation_id: {"projectId": project_id, "requestHash": digest,
                "state": "intent", "threadId": thread_id, "turnId": ""}}
            self._persist(updated)
            self._operations = updated

    def mark(self, operation_id: str, state: str, turn_id: str = "") -> None:
        with self._lock:
            old = self._operations.get(operation_id)
            if not old:
                raise AppServerError("operation_missing", "No se encontró la intención local del turno.")
            updated = {**self._operations, operation_id: {**old, "state": state, "turnId": turn_id or old["turnId"]}}
            self._persist(updated)
            self._operations = updated

    def get(self, operation_id: str) -> dict[str, Any] | None:
        with self._lock:
            return dict(self._operations[operation_id]) if operation_id in self._operations else None


class CodexAppServerAdapter:
    """Explicit local read-only chat adapter; no automatic memory or tool execution."""

    def __init__(self, config: AppServerConfig, sessions: ProjectSessionMap,
                 transport_factory: Callable[[AppServerConfig, bool], RpcTransport] | None = None,
                 ledger: OperationLedger | None = None):
        self.config = config
        self.sessions = sessions
        self._transport_factory = transport_factory or (lambda config, confirmed: JsonlProcessTransport.start(config, user_confirmed=confirmed))
        self.ledger = ledger or OperationLedger(self.sessions.path.with_name("codex-app-server-operations.json"))
        self._transport: RpcTransport | None = None
        self._initialized = False
        self._lock = threading.RLock()
        self._active_turn: dict[str, str] = {}

    @property
    def capability(self) -> dict[str, Any]:
        return {"provider": "codex_app_server", "state": "desactivado" if not self.config.enabled else "preparado",
                "simulation": False, "realConnectionVerified": False,
                "hostedAllowed": False, "execution": False}

    def connect(self, *, user_confirmed: bool) -> None:
        if not self.config.enabled:
            raise AppServerError("disabled", "La integración App Server está desactivada.")
        if not user_confirmed:
            raise AppServerError("confirmation_required", "Confirma explícitamente esta conexión local.")
        with self._lock:
            if self._transport is None:
                self._transport = self._transport_factory(self.config, True)
            if not self._initialized:
                try:
                    self._transport.request("initialize", {"clientInfo": {"name": "cerebro-local", "title": "Cerebro local", "version": "0.1.0"}, "capabilities": {}})
                    self._transport.notify("initialized", {})
                except AppServerError:
                    self._transport.close()
                    self._transport = None
                    raise
                self._initialized = True

    def _require_project(self, project_id: str) -> str:
        if not self.config.enabled:
            raise AppServerError("disabled", "La integración App Server está desactivada.")
        if not isinstance(project_id, str) or not project_id or self.config.project_roots is None:
            raise AppServerError("project_unconfigured", "Configura una carpeta explícita para este proyecto.")
        root = self.config.project_roots.get(project_id)
        if not isinstance(root, str) or not Path(root).is_absolute() or not Path(root).is_dir():
            raise AppServerError("project_unconfigured", "No hay una carpeta local válida configurada para este proyecto.")
        return str(Path(root).resolve())

    def _rpc(self) -> RpcTransport:
        if self._transport is None or not self._initialized:
            raise AppServerError("not_connected", "Confirma e inicia primero la conexión local App Server.")
        return self._transport

    def history(self, project_id: str) -> Any:
        self._require_project(project_id)
        cwd = self._require_project(project_id)
        thread_id = self.sessions.get_for_project(project_id, cwd)
        if not thread_id:
            return {"threadId": None, "turns": [], "source": "codex_app_server", "simulation": False, "realConnectionVerified": False}
        return self._rpc().request("thread/turns/list", {"threadId": thread_id})

    def turn(self, project_id: str, text: str, *, operation_id: str,
             user_confirmed: bool, timeout: float = 120):
        """Yield streamed events for only the explicit text; never pulls Cerebro memory."""
        if not user_confirmed:
            raise AppServerError("confirmation_required", "Confirma el envío de este texto a App Server.")
        if not self.config.turns_enabled:
            raise AppServerError("turns_disabled", "Los turnos reales siguen bloqueados hasta autorizar conexión y activar controles de aprobación.")
        cwd = self._require_project(project_id)
        if not isinstance(text, str) or not text.strip() or len(text) > MAX_PROMPT_CHARS:
            raise AppServerError("invalid_prompt", "El mensaje debe contener entre 1 y 6.000 caracteres.")
        rpc = self._rpc()
        thread_id = self.sessions.get_for_project(project_id, cwd)
        terminal = False
        begun = False
        try:
            if thread_id:
                rpc.request("thread/resume", {"threadId": thread_id, "excludeTurns": True})
            else:
                created = rpc.request("thread/start", restricted_thread_params(cwd))
                if not isinstance(created, dict) or not isinstance(created.get("thread"), dict) or not isinstance(created["thread"].get("id"), str):
                    raise AppServerError("invalid_response", "App Server no devolvió un hilo válido.")
                thread_id = created["thread"]["id"]
                self.sessions.put(project_id, thread_id, cwd)
            self.ledger.begin(project_id, operation_id, text, thread_id)
            begun = True
            started = rpc.request("turn/start", {"threadId": thread_id,
                "input": [{"type": "text", "text": text}], "cwd": cwd,
                "approvalPolicy": DENY_ESCALATIONS,
                "permissions": PERMISSION_PROFILE}, timeout=30)
            if not isinstance(started, dict) or not isinstance(started.get("turn"), dict) or not isinstance(started["turn"].get("id"), str):
                raise AppServerError("invalid_response", "App Server no devolvió un turno válido.")
            turn_id = started["turn"]["id"]
            self.ledger.mark(operation_id, "in_progress", turn_id)
            simulated = getattr(rpc, "simulation", False) is True
            with self._lock:
                self._active_turn[project_id] = turn_id
            yield AssistantEvent("started", turn_id=turn_id, simulation=simulated)
            deadline = time.monotonic() + max(1, min(timeout, 600))
            while time.monotonic() < deadline:
                for packet in rpc.notifications(min(0.2, deadline - time.monotonic())):
                    method, params = packet.get("method"), packet.get("params") or {}
                    if not isinstance(params, dict):
                        continue
                    # There is no approval/tool UI in this increment. Always deny
                    # side effects and unknown server requests; never execute them.
                    server_request_id = packet.get("id")
                    if type(server_request_id) in {int, str}:
                        if method in {"item/commandExecution/requestApproval", "item/fileChange/requestApproval"}:
                            rpc.respond(server_request_id, {"decision": "decline"})
                            continue
                        if method == "item/permissions/requestApproval":
                            rpc.respond(server_request_id, {"permissions": []})
                            continue
                        if method == "mcpServer/elicitation/request":
                            rpc.respond(server_request_id, {"action": "decline", "content": None})
                            continue
                        rpc.respond_error(server_request_id, -32601, "Cerebro no admite esta capacidad.")
                        raise AppServerError("unsupported_server_request", "App Server solicitó una capacidad que Cerebro no admite.")
                    if method == "item/agentMessage/delta" and params.get("turnId") == turn_id:
                        delta = params.get("delta")
                        if isinstance(delta, str) and delta and len(delta) <= MAX_EVENT_CHARS:
                            yield AssistantEvent("delta", delta, turn_id, simulated)
                    elif method == "turn/completed" and (params.get("turn", {}).get("id") == turn_id):
                        status = params.get("turn", {}).get("status")
                        self.ledger.mark(operation_id, "completed" if status == "completed" else
                                         "interrupted" if status == "interrupted" else "failed", turn_id)
                        terminal = True
                        yield AssistantEvent("completed" if status == "completed" else "failed", turn_id=turn_id, simulation=simulated)
                        return
                    elif method == "_transport/closed":
                        raise AppServerError("process_stopped", "El proceso App Server se detuvo durante el turno.")
            raise AppServerError("turn_timeout", "El turno superó el límite de espera; comprueba su estado antes de reintentarlo.")
        except AppServerError:
            if begun and not terminal and self.ledger.get(operation_id):
                try:
                    self.ledger.mark(operation_id, "uncertain")
                except AppServerError:
                    pass
            raise
        except Exception:
            if begun and not terminal and self.ledger.get(operation_id):
                try:
                    self.ledger.mark(operation_id, "uncertain")
                except AppServerError:
                    pass
            raise AppServerError("turn_error", "App Server no pudo completar el turno; revisa su estado antes de reintentar.") from None
        finally:
            with self._lock:
                if self._active_turn.get(project_id):
                    self._active_turn.pop(project_id, None)

    def cancel(self, project_id: str) -> None:
        with self._lock:
            turn_id = self._active_turn.get(project_id)
        if not turn_id:
            raise AppServerError("no_active_turn", "No hay un turno activo para este proyecto.")
        cwd = self._require_project(project_id)
        thread_id = self.sessions.get_for_project(project_id, cwd)
        if not thread_id:
            raise AppServerError("no_active_turn", "No hay un hilo activo para este proyecto.")
        self._rpc().request("turn/interrupt", {"threadId": thread_id, "turnId": turn_id})

    def close(self) -> None:
        with self._lock:
            transport, self._transport = self._transport, None
            self._initialized = False
            self._active_turn.clear()
        if transport is not None:
            transport.close()

