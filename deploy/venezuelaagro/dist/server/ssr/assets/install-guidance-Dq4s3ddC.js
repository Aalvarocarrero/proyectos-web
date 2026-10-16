var INSTALL_EXPANDED_MS = 5e3;
var INSTALL_DISMISS_KEY = "morochos-install-dismissed";
var INSTALL_SESSION_SHOWN_KEY = "venezuela-agro-install-shown:v1";
var INSTALL_LAST_SHOWN_KEY = "venezuela-agro-install-last-shown:v1";
/** User-agent hints select instructions, never establish install capability. */
function detectInstallEnvironment(hints) {
	const ua = hints.userAgent ?? "";
	const ipad = /iPad/i.test(ua) || hints.platform === "MacIntel" && (hints.maxTouchPoints ?? 0) > 1;
	const ios = ipad || /iPhone|iPod/i.test(ua);
	const android = /Android/i.test(ua);
	return {
		device: ipad || android && !/Mobile/i.test(ua) ? "tablet" : ios || android && /Mobile/i.test(ua) || hints.mobile === true ? "phone" : "computer",
		os: ios ? "ios" : android ? "android" : /Mac/i.test(hints.platform ?? ua) ? "mac" : /Win/i.test(hints.platform ?? ua) ? "windows" : "other",
		browser: /Edg(?:e|A|iOS)?\//i.test(ua) ? "edge" : /Chrome|Chromium|CriOS/i.test(ua) ? "chrome" : /Safari/i.test(ua) && !/FxiOS|Firefox|OPiOS|OPR|SamsungBrowser|DuckDuckGo/i.test(ua) ? "safari" : "other"
	};
}
function isInstalledDisplayMode(state) {
	return Boolean(state.navigatorStandalone || state.standalone || state.minimalUi || state.windowControlsOverlay || state.appInstalled);
}
function isInstallPromptEvent(event) {
	const candidate = event;
	return typeof candidate.prompt === "function" && typeof candidate.userChoice?.then === "function";
}
function read(storage, key) {
	try {
		return storage?.getItem(key) ?? null;
	} catch {
		return null;
	}
}
function write(storage, key, value) {
	try {
		storage?.setItem(key, value);
	} catch {}
}
function isInstallOfferSuppressed(session, persistent, now, installed = false) {
	if (installed || !Number.isFinite(now) || now <= 0) return true;
	if (read(session, "morochos-install-dismissed") === "true" || read(session, "venezuela-agro-install-shown:v1") === "true") return true;
	return false;
}
function claimInstallOffer(session, persistent, now) {
	if (isInstallOfferSuppressed(session, persistent, now)) return false;
	write(session, INSTALL_SESSION_SHOWN_KEY, "true");
	write(persistent, INSTALL_LAST_SHOWN_KEY, String(now));
	return true;
}
function dismissInstallOffer(session, persistent, now) {
	write(session, INSTALL_DISMISS_KEY, "true");
	write(persistent, INSTALL_LAST_SHOWN_KEY, String(now));
}
function getInstallGuidance(environment, nativePromptAvailable) {
	const { device, os, browser } = environment;
	const title = device === "computer" ? "Un acceso directo en tu computadora" : device === "tablet" ? "Venezuela Agro a mano en tu tableta" : "Venezuela Agro a mano en tu teléfono";
	let steps;
	if (os === "ios") steps = [
		browser === "safari" ? "En Safari, abre el menú de página junto a la dirección y elige Compartir; en otras barras puedes tocar Compartir directamente." : "Abre esta misma dirección en Safari. En el menú de página, elige Compartir; según la barra, Compartir puede aparecer directamente.",
		"Busca «Añadir a pantalla de inicio»; en iPad puede estar dentro de «Más». Si aparece «Abrir como app», puedes activarlo.",
		"Revisa el nombre y confirma «Añadir» en tu dispositivo."
	];
	else if (device === "computer" && os === "mac" && browser === "safari") steps = [
		"En Safari, abre Archivo → Añadir al Dock, si esa opción aparece en tu versión de macOS.",
		"Revisa el nombre y confirma «Añadir».",
		"Si no aparece, guarda esta página en Favoritos para volver a ella desde Safari."
	];
	else if (device === "computer" && browser === "edge") steps = [
		"En Edge, abre ⋯ → Más herramientas → Aplicaciones, según tu versión.",
		"Si está disponible, elige la opción para instalar este sitio como una aplicación y confirma en Edge.",
		"Si no aparece, guarda esta página en Favoritos o usa las opciones de acceso directo del navegador o del sistema."
	];
	else if (device === "computer" && browser === "chrome") steps = [
		"En Chrome, abre ⋮ → Enviar, guardar y compartir → Instalar página como aplicación, si está disponible; también puede aparecer un icono de instalación junto a la dirección.",
		"Si aparece una opción para instalar la página o crear un acceso directo, selecciónala y revisa el diálogo.",
		"Si no aparece, guarda esta página en los marcadores. Para una aplicación ya instalada, puedes crear un acceso desde chrome://apps."
	];
	else if (device !== "computer") steps = [
		"Abre el menú de tu navegador.",
		"Si aparece «Instalar aplicación» o «Añadir a pantalla de inicio», elige la opción y confirma en tu dispositivo.",
		"Si tu navegador no ofrece esa opción, guarda esta página en sus marcadores para encontrarla fácilmente."
	];
	else steps = [
		"Revisa el menú de tu navegador: puede ofrecer instalar este sitio o crear un acceso directo.",
		"Si no ofrece esas opciones, guarda esta página en los marcadores o Favoritos.",
		"También puedes usar las opciones de acceso directo que ofrezca tu navegador o sistema, si están disponibles."
	];
	return {
		title,
		action: nativePromptAvailable ? device === "computer" ? "Instalar en esta computadora" : "Instalar en este dispositivo" : device === "computer" ? "Cómo crear el acceso directo" : "Cómo añadir a inicio",
		nativePromptAvailable,
		steps
	};
}
/** The fallback does not depend on beforeinstallprompt. Temporary dialogs can delay it. */
function scheduleInstallOffer(options) {
	let stopped = false;
	let timer;
	const attempt = () => {
		if (stopped) return;
		if (options.isSuppressed()) {
			stopped = true;
			options.skip?.();
			return;
		}
		if (options.isBlocked()) {
			timer = options.setTimer(attempt, 2e3);
			return;
		}
		stopped = true;
		options.offer();
	};
	timer = options.setTimer(attempt, 800);
	return () => {
		stopped = true;
		if (timer !== void 0) options.clearTimer(timer);
	};
}
/** Count only quiet, visible time; pointer/focus/help interruptions preserve the remainder. */
function createInstallCountdown(options) {
	let remaining = INSTALL_EXPANDED_MS, startedAt = 0;
	let timer;
	let cancelled = false;
	return {
		resume() {
			if (cancelled || timer !== void 0) return;
			startedAt = options.now();
			timer = options.setTimer(() => {
				timer = void 0;
				remaining = 0;
				cancelled = true;
				options.finish();
			}, remaining);
		},
		pause() {
			if (timer === void 0) return;
			options.clearTimer(timer);
			timer = void 0;
			remaining = Math.max(0, remaining - Math.max(0, options.now() - startedAt));
		},
		cancel() {
			cancelled = true;
			if (timer !== void 0) options.clearTimer(timer);
			timer = void 0;
		},
		remaining() {
			return timer === void 0 ? remaining : Math.max(0, remaining - Math.max(0, options.now() - startedAt));
		}
	};
}
//#endregion
export { getInstallGuidance as a, isInstalledDisplayMode as c, dismissInstallOffer as i, scheduleInstallOffer as l, createInstallCountdown as n, isInstallOfferSuppressed as o, detectInstallEnvironment as r, isInstallPromptEvent as s, claimInstallOffer as t };
