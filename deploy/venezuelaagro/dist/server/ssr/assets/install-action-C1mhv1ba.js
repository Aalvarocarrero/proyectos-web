//#region lib/install-action.ts
var initial = {
	ready: false,
	nativePrompt: false,
	installed: false,
	environment: {
		device: "computer",
		os: "other",
		browser: "other"
	}
};
var snapshot = initial, request = null;
var listeners = /* @__PURE__ */ new Set();
function installActionSnapshot() {
	return snapshot;
}
function installActionServerSnapshot() {
	return initial;
}
function subscribeInstallAction(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function registerInstallAction(state, handler) {
	request = handler;
	snapshot = state;
	listeners.forEach((listener) => listener());
	return () => {
		if (request === handler) {
			request = null;
			snapshot = initial;
			listeners.forEach((listener) => listener());
		}
	};
}
/** Direct synchronous forwarding keeps native prompting within the user's click. */
function requestInstallAction() {
	if (!request || snapshot.installed) return false;
	request();
	return true;
}
//#endregion
export { subscribeInstallAction as a, requestInstallAction as i, installActionSnapshot as n, registerInstallAction as r, installActionServerSnapshot as t };
