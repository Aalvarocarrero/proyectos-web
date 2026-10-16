import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime, t as require_react_dom } from "../index.js";
import { M as listingPayloadSchema, l as getOperationStatus, m as queueMutation, r as createLocalId, y as syncNow } from "./offline-db-BE3xVTyb.js";
import { o as currencies, s as currencyLabels } from "./exchange-rates-Dh445WGD.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
import { i as phoneDigits, r as listingContactSchema } from "./whatsapp-contact-D2hkSaZs.js";
import { s as productAttributeFields } from "./marketplace-details-Bh_zF0oZ.js";
import { d as selectVerifiedDashboardOwner, r as useOfflineAccountBlocked } from "./offline-account-boundary-hnu6xdcm.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { a as Portal, d as useControllableState, f as useId, h as composeEventHandlers, i as Presence, l as useCallbackRef, m as createContextScope, n as ReactRemoveScroll, o as FocusScope, p as useLayoutEffect2, r as useFocusGuards, s as DismissableLayer, t as hideOthers, u as Primitive } from "./es2015-BDbqYqHm.js";
import { t as cn } from "./utils-8qBjT-XH.js";
import { t as Button } from "./button-D3WpGtsB.js";
import { t as Check } from "./check-D7kn-cfT.js";
import { t as LoaderCircle } from "./loader-circle-Be8OWdZ5.js";
import { t as Input } from "./input-Coa5XNOy.js";
import { t as PriceConversion } from "./price-conversion-RjpQe0IX.js";
import { t as Textarea } from "./textarea-C9uNbx98.js";
import { n as PublicFormGuide, t as FormFeedback } from "./form-feedback-C28cLJou.js";
import { t as publicFormError } from "./public-form-errors-C9Km7-c4.js";
import { a as createPopperScope, i as Root2, r as Content, t as Anchor } from "./dist-Daz4_HNt.js";
import { t as CloudOff } from "./cloud-off-BFgsW-OX.js";
import { t as AgroCategoryIcon } from "./agro-category-icon-BvENtu1T.js";
import { t as ChevronDown } from "./chevron-down-CVMRqVWl.js";
import { n as createCollection, t as useDirection } from "./dist-DUSHNR2F2.js";
import { t as LocationCanvas } from "./marketplace-location-N3zgKCBC.js";
import { n as marketplaceCategories } from "./marketplace-categories-DbEPTFAD.js";
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronUp = createLucideIcon("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]);
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/number/dist/index.mjs
var __defProp$5 = Object.defineProperty;
var __name$5 = (target, value) => __defProp$5(target, "name", {
	value,
	configurable: true
});
function clamp(value, [min, max]) {
	return Math.min(max, Math.max(min, value));
}
__name$5(clamp, "clamp");
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-compose-refs/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var __defProp$4 = Object.defineProperty;
var __name$4 = (target, value) => __defProp$4(target, "name", {
	value,
	configurable: true
});
function setRef(ref, value) {
	if (typeof ref === "function") return ref(value);
	else if (ref !== null && ref !== void 0) ref.current = value;
}
__name$4(setRef, "setRef");
function composeRefs(...refs) {
	return (node) => {
		let hasCleanup = false;
		const cleanups = refs.map((ref) => {
			const cleanup = setRef(ref, node);
			if (!hasCleanup && typeof cleanup == "function") hasCleanup = true;
			return cleanup;
		});
		if (hasCleanup) return () => {
			for (let i = 0; i < cleanups.length; i++) {
				const cleanup = cleanups[i];
				if (typeof cleanup == "function") cleanup();
				else setRef(refs[i], null);
			}
		};
	};
}
__name$4(composeRefs, "composeRefs");
function useComposedRefs(...refs) {
	return import_react.useCallback(composeRefs(...refs), refs);
}
__name$4(useComposedRefs, "useComposedRefs");
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
var __defProp$3 = Object.defineProperty;
var __name$3 = (target, value) => __defProp$3(target, "name", {
	value,
	configurable: true
});
/* @__NO_SIDE_EFFECTS__ */
function createSlot(ownerName) {
	const Slot2 = import_react.forwardRef((props, forwardedRef) => {
		let { children, ...slotProps } = props;
		let slottableElement = null;
		let hasSlottable = false;
		const newChildren = [];
		if (isLazyComponent(children) && typeof use === "function") children = use(children._payload);
		import_react.Children.forEach(children, (maybeSlottable) => {
			if (isSlottable(maybeSlottable)) {
				hasSlottable = true;
				const slottable = maybeSlottable;
				let child = "child" in slottable.props ? slottable.props.child : slottable.props.children;
				if (isLazyComponent(child) && typeof use === "function") child = use(child._payload);
				slottableElement = getSlottableElementFromSlottable(slottable, child);
				newChildren.push(slottableElement?.props?.children);
			} else newChildren.push(maybeSlottable);
		});
		if (slottableElement) slottableElement = import_react.cloneElement(slottableElement, void 0, newChildren);
		else if (!hasSlottable && import_react.Children.count(children) === 1 && import_react.isValidElement(children)) slottableElement = children;
		const slottableElementRef = slottableElement ? getElementRef(slottableElement) : void 0;
		const composedRef = useComposedRefs(forwardedRef, slottableElementRef);
		if (!slottableElement) {
			if (children || children === 0) throw new Error(hasSlottable ? createSlottableError(ownerName) : createSlotError(ownerName));
			return children;
		}
		const mergedProps = mergeProps(slotProps, slottableElement.props ?? {});
		if (slottableElement.type !== import_react.Fragment) mergedProps.ref = forwardedRef ? composedRef : slottableElementRef;
		return import_react.cloneElement(slottableElement, mergedProps);
	});
	Slot2.displayName = `${ownerName}.Slot`;
	return Slot2;
}
__name$3(createSlot, "createSlot");
var SLOTTABLE_IDENTIFIER = Symbol.for("radix.slottable");
/* @__NO_SIDE_EFFECTS__ */
function createSlottable(ownerName) {
	const Slottable2 = /* @__PURE__ */ __name$3((props) => "child" in props ? props.children(props.child) : props.children, "Slottable");
	Slottable2.displayName = `${ownerName}.Slottable`;
	Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
	return Slottable2;
}
__name$3(createSlottable, "createSlottable");
var getSlottableElementFromSlottable = /* @__PURE__ */ __name$3((slottable, child) => {
	if ("child" in slottable.props) {
		const child2 = slottable.props.child;
		if (!import_react.isValidElement(child2)) return null;
		return import_react.cloneElement(child2, void 0, slottable.props.children(child2.props.children));
	}
	return import_react.isValidElement(child) ? child : null;
}, "getSlottableElementFromSlottable");
function mergeProps(slotProps, childProps) {
	const overrideProps = { ...childProps };
	for (const propName in childProps) {
		const slotPropValue = slotProps[propName];
		const childPropValue = childProps[propName];
		if (/^on[A-Z]/.test(propName)) {
			if (slotPropValue && childPropValue) overrideProps[propName] = (...args) => {
				const result = childPropValue(...args);
				slotPropValue(...args);
				return result;
			};
			else if (slotPropValue) overrideProps[propName] = slotPropValue;
		} else if (propName === "style") overrideProps[propName] = {
			...slotPropValue,
			...childPropValue
		};
		else if (propName === "className") overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
	}
	return {
		...slotProps,
		...overrideProps
	};
}
__name$3(mergeProps, "mergeProps");
function getElementRef(element) {
	let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
	let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.ref;
	getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
	mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.props.ref;
	return element.props.ref || element.ref;
}
__name$3(getElementRef, "getElementRef");
function isSlottable(child) {
	return import_react.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
__name$3(isSlottable, "isSlottable");
var REACT_LAZY_TYPE = Symbol.for("react.lazy");
function isLazyComponent(element) {
	return element != null && typeof element === "object" && "$$typeof" in element && element.$$typeof === REACT_LAZY_TYPE && "_payload" in element && isPromiseLike(element._payload);
}
__name$3(isLazyComponent, "isLazyComponent");
function isPromiseLike(value) {
	return typeof value === "object" && value !== null && "then" in value;
}
__name$3(isPromiseLike, "isPromiseLike");
var createSlotError = /* @__PURE__ */ __name$3((ownerName) => {
	return `${ownerName} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`;
}, "createSlotError");
var createSlottableError = /* @__PURE__ */ __name$3((ownerName) => {
	return `${ownerName} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`;
}, "createSlottableError");
var use = import_react[" use ".trim().toString()];
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/react-use-previous/dist/index.mjs
var __defProp$2 = Object.defineProperty;
var __name$2 = (target, value) => __defProp$2(target, "name", {
	value,
	configurable: true
});
function usePrevious(value) {
	const ref = import_react.useRef({
		value,
		previous: value
	});
	return import_react.useMemo(() => {
		if (ref.current.value !== value) {
			ref.current.previous = ref.current.value;
			ref.current.value = value;
		}
		return ref.current.previous;
	}, [value]);
}
__name$2(usePrevious, "usePrevious");
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var import_jsx_runtime = require_jsx_runtime();
var __defProp$1 = Object.defineProperty;
var __name$1 = (target, value) => __defProp$1(target, "name", {
	value,
	configurable: true
});
var VISUALLY_HIDDEN_STYLES = Object.freeze({
	position: "absolute",
	border: 0,
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	wordWrap: "normal"
});
var Root = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name$1(function VisuallyHidden2(props, forwardedRef) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
		...props,
		ref: forwardedRef,
		style: {
			...VISUALLY_HIDDEN_STYLES,
			...props.style
		}
	});
}, "VisuallyHidden"));
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/react-select/dist/index.mjs
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var OPEN_KEYS = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
];
var SELECTION_KEYS = [" ", "Enter"];
var SELECT_NAME = "Select";
var [Collection, useCollection, createCollectionScope] = createCollection(SELECT_NAME);
var [createSelectContext, createSelectScope] = createContextScope(SELECT_NAME, [createCollectionScope, createPopperScope]);
var usePopperScope = createPopperScope();
var [SelectProviderImpl, useSelectContext] = createSelectContext(SELECT_NAME);
var [SelectNativeOptionsProvider, useSelectNativeOptionsContext] = createSelectContext(SELECT_NAME);
function SelectProvider(props) {
	const { __scopeSelect, children, open: openProp, defaultOpen, onOpenChange, value: valueProp, defaultValue, onValueChange, dir, name, autoComplete, disabled, required, form, internal_do_not_use_render } = props;
	const popperScope = usePopperScope(__scopeSelect);
	const [trigger, setTrigger] = import_react.useState(null);
	const [valueNode, setValueNode] = import_react.useState(null);
	const [valueNodeHasChildren, setValueNodeHasChildren] = import_react.useState(false);
	const direction = useDirection(dir);
	const [open, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen ?? false,
		onChange: onOpenChange,
		caller: SELECT_NAME
	});
	const [value, setValue] = useControllableState({
		prop: valueProp,
		defaultProp: defaultValue,
		onChange: onValueChange,
		caller: SELECT_NAME
	});
	const triggerPointerDownPosRef = import_react.useRef(null);
	const initialValueRef = import_react.useRef(value);
	import_react.useEffect(() => {
		const associatedForm = form ? trigger?.ownerDocument.getElementById(form) : trigger?.form;
		if (associatedForm instanceof HTMLFormElement) {
			const reset = /* @__PURE__ */ __name(() => setValue(initialValueRef.current), "reset");
			associatedForm.addEventListener("reset", reset);
			return () => associatedForm.removeEventListener("reset", reset);
		}
	}, [
		form,
		trigger,
		setValue
	]);
	const isFormControl = trigger ? !!form || !!trigger.closest("form") : true;
	const [nativeOptionsSet, setNativeOptionsSet] = import_react.useState(/* @__PURE__ */ new Set());
	const contentId = useId();
	const nativeSelectKey = Array.from(nativeOptionsSet).map((option) => option.props.value).join(";");
	const handleNativeOptionAdd = import_react.useCallback((option) => {
		setNativeOptionsSet((prev) => new Set(prev).add(option));
	}, []);
	const handleNativeOptionRemove = import_react.useCallback((option) => {
		setNativeOptionsSet((prev) => {
			const optionsSet = new Set(prev);
			optionsSet.delete(option);
			return optionsSet;
		});
	}, []);
	const context = {
		required,
		trigger,
		onTriggerChange: setTrigger,
		valueNode,
		onValueNodeChange: setValueNode,
		valueNodeHasChildren,
		onValueNodeHasChildrenChange: setValueNodeHasChildren,
		contentId,
		value,
		onValueChange: setValue,
		open,
		onOpenChange: setOpen,
		dir: direction,
		triggerPointerDownPosRef,
		disabled,
		name,
		autoComplete,
		form,
		nativeOptions: nativeOptionsSet,
		nativeSelectKey,
		isFormControl
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		...popperScope,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectProviderImpl, {
			scope: __scopeSelect,
			...context,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection.Provider, {
				scope: __scopeSelect,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectNativeOptionsProvider, {
					scope: __scopeSelect,
					onNativeOptionAdd: handleNativeOptionAdd,
					onNativeOptionRemove: handleNativeOptionRemove,
					children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
				})
			})
		})
	});
}
__name(SelectProvider, "SelectProvider");
var Select$1 = /* @__PURE__ */ __name((props) => {
	const { __scopeSelect, children, ...providerProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectProvider, {
		__scopeSelect,
		...providerProps,
		internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [children, isFormControl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectBubbleInput, { __scopeSelect }) : null] })
	});
}, "Select");
var TRIGGER_NAME = "SelectTrigger";
var SelectTrigger$1 = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectTrigger2(props, forwardedRef) {
	const { __scopeSelect, disabled = false, ...triggerProps } = props;
	const popperScope = usePopperScope(__scopeSelect);
	const context = useSelectContext(TRIGGER_NAME, __scopeSelect);
	const isDisabled = context.disabled || disabled;
	const composedRefs = useComposedRefs(forwardedRef, context.onTriggerChange);
	const getItems = useCollection(__scopeSelect);
	const pointerTypeRef = import_react.useRef("touch");
	const [searchRef, handleTypeaheadSearch, resetTypeahead] = useTypeaheadSearch((search) => {
		const enabledItems = getItems().filter((item) => !item.disabled);
		const nextItem = findNextItem(enabledItems, search, enabledItems.find((item) => item.value === context.value));
		if (nextItem !== void 0) context.onValueChange(nextItem.value);
	});
	const handleOpen = /* @__PURE__ */ __name((pointerEvent) => {
		if (!isDisabled) {
			context.onOpenChange(true);
			resetTypeahead();
		}
		if (pointerEvent) context.triggerPointerDownPosRef.current = {
			x: Math.round(pointerEvent.pageX),
			y: Math.round(pointerEvent.pageY)
		};
	}, "handleOpen");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anchor, {
		asChild: true,
		...popperScope,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.button, {
			type: "button",
			role: "combobox",
			"aria-controls": context.open ? context.contentId : void 0,
			"aria-expanded": context.open,
			"aria-required": context.required,
			"aria-autocomplete": "none",
			dir: context.dir,
			"data-state": context.open ? "open" : "closed",
			disabled: isDisabled,
			"data-disabled": isDisabled ? "" : void 0,
			"data-placeholder": shouldShowPlaceholder(context.value) ? "" : void 0,
			...triggerProps,
			ref: composedRefs,
			onClick: composeEventHandlers(triggerProps.onClick, (event) => {
				event.currentTarget.focus();
				if (pointerTypeRef.current !== "mouse") handleOpen(event);
			}),
			onPointerDown: composeEventHandlers(triggerProps.onPointerDown, (event) => {
				pointerTypeRef.current = event.pointerType;
				const target = event.target;
				if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
				if (event.button === 0 && event.ctrlKey === false && event.pointerType === "mouse") {
					handleOpen(event);
					event.preventDefault();
				}
			}),
			onKeyDown: composeEventHandlers(triggerProps.onKeyDown, (event) => {
				const isTypingAhead = searchRef.current !== "";
				if (!(event.ctrlKey || event.altKey || event.metaKey) && event.key.length === 1) handleTypeaheadSearch(event.key);
				if (isTypingAhead && event.key === " ") return;
				if (OPEN_KEYS.includes(event.key)) {
					handleOpen();
					event.preventDefault();
				}
			})
		})
	});
}, "SelectTrigger"));
var VALUE_NAME = "SelectValue";
var SelectValue$1 = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectValue2(props, forwardedRef) {
	const { __scopeSelect, className, style, children, placeholder = "", ...valueProps } = props;
	const context = useSelectContext(VALUE_NAME, __scopeSelect);
	const { onValueNodeHasChildrenChange } = context;
	const hasChildren = children !== void 0;
	const composedRefs = useComposedRefs(forwardedRef, context.onValueNodeChange);
	useLayoutEffect2(() => {
		onValueNodeHasChildrenChange(hasChildren);
	}, [onValueNodeHasChildrenChange, hasChildren]);
	const showPlaceholder = shouldShowPlaceholder(context.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
		...valueProps,
		asChild: showPlaceholder ? false : valueProps.asChild,
		ref: composedRefs,
		style: { pointerEvents: "none" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: showPlaceholder ? placeholder : children }, showPlaceholder ? "placeholder" : "value")
	});
}, "SelectValue"));
var SelectIcon = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectIcon2(props, forwardedRef) {
	const { __scopeSelect, children, ...iconProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
		"aria-hidden": true,
		...iconProps,
		ref: forwardedRef,
		children: children || "▼"
	});
}, "SelectIcon"));
var [PortalProvider, usePortalContext] = createSelectContext("SelectPortal", { forceMount: void 0 });
var SelectPortal = /* @__PURE__ */ __name((props) => {
	const { __scopeSelect, forceMount, ...portalProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalProvider, {
		scope: props.__scopeSelect,
		forceMount,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, {
			asChild: true,
			...portalProps
		})
	});
}, "SelectPortal");
var CONTENT_NAME = "SelectContent";
var SelectContent$1 = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectContent2(props, forwardedRef) {
	const portalContext = usePortalContext(CONTENT_NAME, props.__scopeSelect);
	const { forceMount = portalContext.forceMount, ...contentProps } = props;
	const context = useSelectContext(CONTENT_NAME, props.__scopeSelect);
	const [fragment, setFragment] = import_react.useState();
	useLayoutEffect2(() => {
		setFragment(new DocumentFragment());
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || context.open,
		children: ({ present }) => present ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContentImpl, {
			...contentProps,
			ref: forwardedRef
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContentFragment, {
			...contentProps,
			fragment
		})
	});
}, "SelectContent"));
var SelectContentFragment = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectContentFragment2(props, forwardedRef) {
	const { __scopeSelect, children, fragment } = props;
	if (!fragment) return null;
	return import_react_dom.createPortal(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContentProvider, {
		scope: __scopeSelect,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection.Slot, {
			scope: __scopeSelect,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: forwardedRef,
				children
			})
		})
	}), fragment);
}, "SelectContentFragment"));
var CONTENT_MARGIN = 10;
var [SelectContentProvider, useSelectContentContext] = createSelectContext(CONTENT_NAME);
var Slot = /* @__PURE__ */ createSlot("SelectContent.RemoveScroll");
var SelectContentImpl = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectContentImpl2(props, forwardedRef) {
	const { __scopeSelect } = props;
	const { position = "item-aligned", onCloseAutoFocus, onEscapeKeyDown, onPointerDownOutside, side, sideOffset, align, alignOffset, arrowPadding, collisionBoundary, collisionPadding, sticky, hideWhenDetached, avoidCollisions, ...contentProps } = props;
	const context = useSelectContext(CONTENT_NAME, __scopeSelect);
	const [content, setContent] = import_react.useState(null);
	const [viewport, setViewport] = import_react.useState(null);
	const composedRefs = useComposedRefs(forwardedRef, setContent);
	const [selectedItem, setSelectedItem] = import_react.useState(null);
	const [selectedItemText, setSelectedItemText] = import_react.useState(null);
	const getItems = useCollection(__scopeSelect);
	const [isPositioned, setIsPositioned] = import_react.useState(false);
	const firstValidItemFoundRef = import_react.useRef(false);
	import_react.useEffect(() => {
		if (content) return hideOthers(content);
	}, [content]);
	useFocusGuards();
	const focusFirst = import_react.useCallback((candidates) => {
		const [firstItem, ...restItems] = getItems().map((item) => item.ref.current);
		const [lastItem] = restItems.slice(-1);
		const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
		for (const candidate of candidates) {
			if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
			candidate?.scrollIntoView({ block: "nearest" });
			if (candidate === firstItem && viewport) viewport.scrollTop = 0;
			if (candidate === lastItem && viewport) viewport.scrollTop = viewport.scrollHeight;
			candidate?.focus();
			if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
		}
	}, [getItems, viewport]);
	const focusSelectedItem = import_react.useCallback(() => focusFirst([selectedItem, content]), [
		focusFirst,
		selectedItem,
		content
	]);
	import_react.useEffect(() => {
		if (isPositioned) focusSelectedItem();
	}, [isPositioned, focusSelectedItem]);
	const { onOpenChange, triggerPointerDownPosRef } = context;
	import_react.useEffect(() => {
		if (content) {
			let pointerMoveDelta = {
				x: 0,
				y: 0
			};
			const handlePointerMove = /* @__PURE__ */ __name((event) => {
				pointerMoveDelta = {
					x: Math.abs(Math.round(event.pageX) - (triggerPointerDownPosRef.current?.x ?? 0)),
					y: Math.abs(Math.round(event.pageY) - (triggerPointerDownPosRef.current?.y ?? 0))
				};
			}, "handlePointerMove");
			const handlePointerUp = /* @__PURE__ */ __name((event) => {
				if (pointerMoveDelta.x <= 10 && pointerMoveDelta.y <= 10) event.preventDefault();
				else if (!event.composedPath().includes(content)) onOpenChange(false);
				document.removeEventListener("pointermove", handlePointerMove);
				triggerPointerDownPosRef.current = null;
			}, "handlePointerUp");
			if (triggerPointerDownPosRef.current !== null) {
				document.addEventListener("pointermove", handlePointerMove);
				document.addEventListener("pointerup", handlePointerUp, {
					capture: true,
					once: true
				});
			}
			return () => {
				document.removeEventListener("pointermove", handlePointerMove);
				document.removeEventListener("pointerup", handlePointerUp, { capture: true });
			};
		}
	}, [
		content,
		onOpenChange,
		triggerPointerDownPosRef
	]);
	import_react.useEffect(() => {
		const close = /* @__PURE__ */ __name(() => onOpenChange(false), "close");
		window.addEventListener("blur", close);
		window.addEventListener("resize", close);
		return () => {
			window.removeEventListener("blur", close);
			window.removeEventListener("resize", close);
		};
	}, [onOpenChange]);
	const [searchRef, handleTypeaheadSearch] = useTypeaheadSearch((search) => {
		const enabledItems = getItems().filter((item) => !item.disabled);
		const nextItem = findNextItem(enabledItems, search, enabledItems.find((item) => item.ref.current === document.activeElement));
		if (nextItem) setTimeout(() => nextItem.ref.current?.focus());
	});
	const itemRefCallback = import_react.useCallback((node, value, disabled) => {
		const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
		if (context.value !== void 0 && context.value === value || isFirstValidItem) {
			setSelectedItem(node);
			if (isFirstValidItem) firstValidItemFoundRef.current = true;
		}
	}, [context.value]);
	const handleItemLeave = import_react.useCallback(() => content?.focus(), [content]);
	const itemTextRefCallback = import_react.useCallback((node, value, disabled) => {
		const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
		if (context.value !== void 0 && context.value === value || isFirstValidItem) setSelectedItemText(node);
	}, [context.value]);
	const SelectPosition = position === "popper" ? SelectPopperPosition : SelectItemAlignedPosition;
	const popperContentProps = SelectPosition === SelectPopperPosition ? {
		side,
		sideOffset,
		align,
		alignOffset,
		arrowPadding,
		collisionBoundary,
		collisionPadding,
		sticky,
		hideWhenDetached,
		avoidCollisions
	} : {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContentProvider, {
		scope: __scopeSelect,
		content,
		viewport,
		onViewportChange: setViewport,
		itemRefCallback,
		selectedItem,
		onItemLeave: handleItemLeave,
		itemTextRefCallback,
		focusSelectedItem,
		selectedItemText,
		position,
		isPositioned,
		searchRef,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReactRemoveScroll, {
			as: Slot,
			allowPinchZoom: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusScope, {
				asChild: true,
				trapped: context.open,
				onMountAutoFocus: (event) => {
					event.preventDefault();
				},
				onUnmountAutoFocus: composeEventHandlers(onCloseAutoFocus, (event) => {
					context.trigger?.focus({ preventScroll: true });
					event.preventDefault();
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DismissableLayer, {
					asChild: true,
					disableOutsidePointerEvents: true,
					onEscapeKeyDown,
					onPointerDownOutside,
					onFocusOutside: (event) => event.preventDefault(),
					onDismiss: () => context.onOpenChange(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPosition, {
						role: "listbox",
						id: context.contentId,
						"data-state": context.open ? "open" : "closed",
						dir: context.dir,
						onContextMenu: (event) => event.preventDefault(),
						...contentProps,
						...popperContentProps,
						onPlaced: () => setIsPositioned(true),
						ref: composedRefs,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...contentProps.style
						},
						onKeyDown: composeEventHandlers(contentProps.onKeyDown, (event) => {
							const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
							if (event.key === "Tab") event.preventDefault();
							if (!isModifierKey && event.key.length === 1) handleTypeaheadSearch(event.key);
							if ([
								"ArrowUp",
								"ArrowDown",
								"Home",
								"End"
							].includes(event.key)) {
								let candidateNodes = getItems().filter((item) => !item.disabled).map((item) => item.ref.current);
								if (["ArrowUp", "End"].includes(event.key)) candidateNodes = candidateNodes.slice().reverse();
								if (["ArrowUp", "ArrowDown"].includes(event.key)) {
									const currentElement = event.target;
									const currentIndex = candidateNodes.indexOf(currentElement);
									candidateNodes = candidateNodes.slice(currentIndex + 1);
								}
								setTimeout(() => focusFirst(candidateNodes));
								event.preventDefault();
							}
						})
					})
				})
			})
		})
	});
}, "SelectContentImpl"));
var SelectItemAlignedPosition = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectItemAlignedPosition2(props, forwardedRef) {
	const { __scopeSelect, onPlaced, ...popperProps } = props;
	const context = useSelectContext(CONTENT_NAME, __scopeSelect);
	const contentContext = useSelectContentContext(CONTENT_NAME, __scopeSelect);
	const [contentWrapper, setContentWrapper] = import_react.useState(null);
	const [content, setContent] = import_react.useState(null);
	const composedRefs = useComposedRefs(forwardedRef, setContent);
	const getItems = useCollection(__scopeSelect);
	const shouldExpandOnScrollRef = import_react.useRef(false);
	const shouldRepositionRef = import_react.useRef(true);
	const { viewport, selectedItem, selectedItemText, focusSelectedItem } = contentContext;
	const position = import_react.useCallback(() => {
		if (context.trigger && context.valueNode && contentWrapper && content && viewport && selectedItem && selectedItemText) {
			const triggerRect = context.trigger.getBoundingClientRect();
			const contentRect = content.getBoundingClientRect();
			const valueNodeRect = context.valueNode.getBoundingClientRect();
			const itemTextRect = selectedItemText.getBoundingClientRect();
			if (context.dir !== "rtl") {
				const itemTextOffset = itemTextRect.left - contentRect.left;
				const left = valueNodeRect.left - itemTextOffset;
				const leftDelta = triggerRect.left - left;
				const minContentWidth = triggerRect.width + leftDelta;
				const contentWidth = Math.max(minContentWidth, contentRect.width);
				const rightEdge = window.innerWidth - CONTENT_MARGIN;
				const clampedLeft = clamp(left, [CONTENT_MARGIN, Math.max(CONTENT_MARGIN, rightEdge - contentWidth)]);
				contentWrapper.style.minWidth = minContentWidth + "px";
				contentWrapper.style.left = clampedLeft + "px";
			} else {
				const itemTextOffset = contentRect.right - itemTextRect.right;
				const right = window.innerWidth - valueNodeRect.right - itemTextOffset;
				const rightDelta = window.innerWidth - triggerRect.right - right;
				const minContentWidth = triggerRect.width + rightDelta;
				const contentWidth = Math.max(minContentWidth, contentRect.width);
				const leftEdge = window.innerWidth - CONTENT_MARGIN;
				const clampedRight = clamp(right, [CONTENT_MARGIN, Math.max(CONTENT_MARGIN, leftEdge - contentWidth)]);
				contentWrapper.style.minWidth = minContentWidth + "px";
				contentWrapper.style.right = clampedRight + "px";
			}
			const items = getItems();
			const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
			const itemsHeight = viewport.scrollHeight;
			const contentStyles = window.getComputedStyle(content);
			const contentBorderTopWidth = parseInt(contentStyles.borderTopWidth, 10);
			const contentPaddingTop = parseInt(contentStyles.paddingTop, 10);
			const contentBorderBottomWidth = parseInt(contentStyles.borderBottomWidth, 10);
			const contentPaddingBottom = parseInt(contentStyles.paddingBottom, 10);
			const fullContentHeight = contentBorderTopWidth + contentPaddingTop + itemsHeight + contentPaddingBottom + contentBorderBottomWidth;
			const minContentHeight = Math.min(selectedItem.offsetHeight * 5, fullContentHeight);
			const viewportStyles = window.getComputedStyle(viewport);
			const viewportPaddingTop = parseInt(viewportStyles.paddingTop, 10);
			const viewportPaddingBottom = parseInt(viewportStyles.paddingBottom, 10);
			const topEdgeToTriggerMiddle = triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN;
			const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;
			const selectedItemHalfHeight = selectedItem.offsetHeight / 2;
			const itemOffsetMiddle = selectedItem.offsetTop + selectedItemHalfHeight;
			const contentTopToItemMiddle = contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
			const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle;
			if (contentTopToItemMiddle <= topEdgeToTriggerMiddle) {
				const isLastItem = items.length > 0 && selectedItem === items[items.length - 1].ref.current;
				contentWrapper.style.bottom = "0px";
				const viewportOffsetBottom = content.clientHeight - viewport.offsetTop - viewport.offsetHeight;
				const height = contentTopToItemMiddle + Math.max(triggerMiddleToBottomEdge, selectedItemHalfHeight + (isLastItem ? viewportPaddingBottom : 0) + viewportOffsetBottom + contentBorderBottomWidth);
				contentWrapper.style.height = height + "px";
			} else {
				const isFirstItem = items.length > 0 && selectedItem === items[0].ref.current;
				contentWrapper.style.top = "0px";
				const height = Math.max(topEdgeToTriggerMiddle, contentBorderTopWidth + viewport.offsetTop + (isFirstItem ? viewportPaddingTop : 0) + selectedItemHalfHeight) + itemMiddleToContentBottom;
				contentWrapper.style.height = height + "px";
				viewport.scrollTop = contentTopToItemMiddle - topEdgeToTriggerMiddle + viewport.offsetTop;
			}
			contentWrapper.style.margin = `${CONTENT_MARGIN}px 0`;
			contentWrapper.style.minHeight = minContentHeight + "px";
			contentWrapper.style.maxHeight = availableHeight + "px";
			onPlaced?.();
			requestAnimationFrame(() => shouldExpandOnScrollRef.current = true);
		}
	}, [
		getItems,
		context.trigger,
		context.valueNode,
		contentWrapper,
		content,
		viewport,
		selectedItem,
		selectedItemText,
		context.dir,
		onPlaced
	]);
	useLayoutEffect2(() => position(), [position]);
	const [contentZIndex, setContentZIndex] = import_react.useState();
	useLayoutEffect2(() => {
		if (content) setContentZIndex(window.getComputedStyle(content).zIndex);
	}, [content]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewportProvider, {
		scope: __scopeSelect,
		contentWrapper,
		shouldExpandOnScrollRef,
		onScrollButtonChange: import_react.useCallback((node) => {
			if (node && shouldRepositionRef.current === true) {
				position();
				focusSelectedItem?.();
				shouldRepositionRef.current = false;
			}
		}, [position, focusSelectedItem]),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: setContentWrapper,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: contentZIndex
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
				...popperProps,
				ref: composedRefs,
				style: {
					boxSizing: "border-box",
					maxHeight: "100%",
					...popperProps.style
				}
			})
		})
	});
}, "SelectItemAlignedPosition"));
var SelectPopperPosition = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectPopperPosition2(props, forwardedRef) {
	const { __scopeSelect, align = "start", collisionPadding = CONTENT_MARGIN, ...popperProps } = props;
	const popperScope = usePopperScope(__scopeSelect);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		...popperScope,
		...popperProps,
		ref: forwardedRef,
		align,
		collisionPadding,
		style: {
			boxSizing: "border-box",
			...popperProps.style,
			"--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-select-content-available-width": "var(--radix-popper-available-width)",
			"--radix-select-content-available-height": "var(--radix-popper-available-height)",
			"--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
}, "SelectPopperPosition"));
var [SelectViewportProvider, useSelectViewportContext] = createSelectContext(CONTENT_NAME, {});
var VIEWPORT_NAME = "SelectViewport";
var SelectViewport = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectViewport2(props, forwardedRef) {
	const { __scopeSelect, nonce, ...viewportProps } = props;
	const contentContext = useSelectContentContext(VIEWPORT_NAME, __scopeSelect);
	const viewportContext = useSelectViewportContext(VIEWPORT_NAME, __scopeSelect);
	const composedRefs = useComposedRefs(forwardedRef, contentContext.onViewportChange);
	const prevScrollTopRef = import_react.useRef(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", {
		dangerouslySetInnerHTML: { __html: `[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}` },
		nonce
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection.Slot, {
		scope: __scopeSelect,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
			"data-radix-select-viewport": "",
			role: "presentation",
			...viewportProps,
			ref: composedRefs,
			style: {
				position: "relative",
				flex: 1,
				overflow: "hidden auto",
				...viewportProps.style
			},
			onScroll: composeEventHandlers(viewportProps.onScroll, (event) => {
				const viewport = event.currentTarget;
				const { contentWrapper, shouldExpandOnScrollRef } = viewportContext;
				if (shouldExpandOnScrollRef?.current && contentWrapper) {
					const scrolledBy = Math.abs(prevScrollTopRef.current - viewport.scrollTop);
					if (scrolledBy > 0) {
						const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
						const cssMinHeight = parseFloat(contentWrapper.style.minHeight);
						const cssHeight = parseFloat(contentWrapper.style.height);
						const prevHeight = Math.max(cssMinHeight, cssHeight);
						if (prevHeight < availableHeight) {
							const nextHeight = prevHeight + scrolledBy;
							const clampedNextHeight = Math.min(availableHeight, nextHeight);
							const heightDiff = nextHeight - clampedNextHeight;
							contentWrapper.style.height = clampedNextHeight + "px";
							if (contentWrapper.style.bottom === "0px") {
								viewport.scrollTop = heightDiff > 0 ? heightDiff : 0;
								contentWrapper.style.justifyContent = "flex-end";
							}
						}
					}
				}
				prevScrollTopRef.current = viewport.scrollTop;
			})
		})
	})] });
}, "SelectViewport"));
var [SelectGroupContextProvider, useSelectGroupContext] = createSelectContext("SelectGroup");
var ITEM_NAME = "SelectItem";
var [SelectItemContextProvider, useSelectItemContext] = createSelectContext(ITEM_NAME);
var SelectItem$1 = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectItem2(props, forwardedRef) {
	const { __scopeSelect, value, disabled = false, textValue: textValueProp, ...itemProps } = props;
	const context = useSelectContext(ITEM_NAME, __scopeSelect);
	const contentContext = useSelectContentContext(ITEM_NAME, __scopeSelect);
	const isSelected = context.value === value;
	const [textValue, setTextValue] = import_react.useState(textValueProp ?? "");
	const [isFocused, setIsFocused] = import_react.useState(false);
	const composedRefs = useComposedRefs(forwardedRef, useCallbackRef((node) => contentContext.itemRefCallback?.(node, value, disabled)));
	const textId = useId();
	const pointerTypeRef = import_react.useRef("touch");
	const handleSelect = /* @__PURE__ */ __name(() => {
		if (!disabled) {
			context.onValueChange(value);
			context.onOpenChange(false);
		}
	}, "handleSelect");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemContextProvider, {
		scope: __scopeSelect,
		value,
		disabled,
		textId,
		isSelected,
		onItemTextChange: import_react.useCallback((node) => {
			setTextValue((prevTextValue) => prevTextValue || (node?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection.ItemSlot, {
			scope: __scopeSelect,
			value,
			disabled,
			textValue,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
				role: "option",
				"aria-labelledby": textId,
				"data-highlighted": isFocused ? "" : void 0,
				"aria-selected": isSelected && isFocused,
				"data-state": isSelected ? "checked" : "unchecked",
				"aria-disabled": disabled || void 0,
				"data-disabled": disabled ? "" : void 0,
				tabIndex: disabled ? void 0 : -1,
				...itemProps,
				ref: composedRefs,
				onFocus: composeEventHandlers(itemProps.onFocus, () => setIsFocused(true)),
				onBlur: composeEventHandlers(itemProps.onBlur, () => setIsFocused(false)),
				onClick: composeEventHandlers(itemProps.onClick, () => {
					if (pointerTypeRef.current !== "mouse") handleSelect();
				}),
				onPointerUp: composeEventHandlers(itemProps.onPointerUp, () => {
					if (pointerTypeRef.current === "mouse") handleSelect();
				}),
				onPointerDown: composeEventHandlers(itemProps.onPointerDown, (event) => {
					pointerTypeRef.current = event.pointerType;
				}),
				onPointerMove: composeEventHandlers(itemProps.onPointerMove, (event) => {
					pointerTypeRef.current = event.pointerType;
					if (disabled) contentContext.onItemLeave?.();
					else if (pointerTypeRef.current === "mouse") event.currentTarget.focus({ preventScroll: true });
				}),
				onPointerLeave: composeEventHandlers(itemProps.onPointerLeave, (event) => {
					if (event.currentTarget === document.activeElement) contentContext.onItemLeave?.();
				}),
				onKeyDown: composeEventHandlers(itemProps.onKeyDown, (event) => {
					if (disabled || event.target !== event.currentTarget) return;
					if (contentContext.searchRef?.current !== "" && event.key === " ") return;
					if (SELECTION_KEYS.includes(event.key)) handleSelect();
					if (event.key === " ") event.preventDefault();
				})
			})
		})
	});
}, "SelectItem"));
var ITEM_TEXT_NAME = "SelectItemText";
var SelectItemText = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectItemText2(props, forwardedRef) {
	const { __scopeSelect, className, style, ...itemTextProps } = props;
	const context = useSelectContext(ITEM_TEXT_NAME, __scopeSelect);
	const contentContext = useSelectContentContext(ITEM_TEXT_NAME, __scopeSelect);
	const itemContext = useSelectItemContext(ITEM_TEXT_NAME, __scopeSelect);
	const nativeOptionsContext = useSelectNativeOptionsContext(ITEM_TEXT_NAME, __scopeSelect);
	const [itemTextNode, setItemTextNode] = import_react.useState(null);
	const handleItemTextRefCallback = useCallbackRef((node) => contentContext.itemTextRefCallback?.(node, itemContext.value, itemContext.disabled));
	const composedRefs = useComposedRefs(forwardedRef, setItemTextNode, itemContext.onItemTextChange, handleItemTextRefCallback);
	const textContent = itemTextNode?.textContent;
	const nativeOption = import_react.useMemo(() => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
		value: itemContext.value,
		disabled: itemContext.disabled,
		children: textContent
	}, itemContext.value), [
		itemContext.disabled,
		itemContext.value,
		textContent
	]);
	const { onNativeOptionAdd, onNativeOptionRemove } = nativeOptionsContext;
	useLayoutEffect2(() => {
		onNativeOptionAdd(nativeOption);
		return () => onNativeOptionRemove(nativeOption);
	}, [
		onNativeOptionAdd,
		onNativeOptionRemove,
		nativeOption
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
		id: itemContext.textId,
		...itemTextProps,
		ref: composedRefs
	}), itemContext.isSelected && context.valueNode && !context.valueNodeHasChildren && !shouldShowPlaceholder(context.value) ? import_react_dom.createPortal(itemTextProps.children, context.valueNode) : null] });
}, "SelectItemText"));
var ITEM_INDICATOR_NAME = "SelectItemIndicator";
var SelectItemIndicator = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectItemIndicator2(props, forwardedRef) {
	const { __scopeSelect, ...itemIndicatorProps } = props;
	return useSelectItemContext(ITEM_INDICATOR_NAME, __scopeSelect).isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
		"aria-hidden": true,
		...itemIndicatorProps,
		ref: forwardedRef
	}) : null;
}, "SelectItemIndicator"));
var SCROLL_UP_BUTTON_NAME = "SelectScrollUpButton";
var SelectScrollUpButton$1 = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectScrollUpButton2(props, forwardedRef) {
	const contentContext = useSelectContentContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
	const viewportContext = useSelectViewportContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
	const [canScrollUp, setCanScrollUp] = import_react.useState(false);
	const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange);
	useLayoutEffect2(() => {
		if (contentContext.viewport && contentContext.isPositioned) {
			let handleScroll2 = function() {
				setCanScrollUp(viewport.scrollTop > 0);
			};
			__name(handleScroll2, "handleScroll");
			const viewport = contentContext.viewport;
			handleScroll2();
			viewport.addEventListener("scroll", handleScroll2);
			return () => viewport.removeEventListener("scroll", handleScroll2);
		}
	}, [contentContext.viewport, contentContext.isPositioned]);
	return canScrollUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollButtonImpl, {
		...props,
		ref: composedRefs,
		onAutoScroll: () => {
			const { viewport, selectedItem } = contentContext;
			if (viewport && selectedItem) viewport.scrollTop = viewport.scrollTop - selectedItem.offsetHeight;
		}
	}) : null;
}, "SelectScrollUpButton"));
var SCROLL_DOWN_BUTTON_NAME = "SelectScrollDownButton";
var SelectScrollDownButton$1 = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectScrollDownButton2(props, forwardedRef) {
	const contentContext = useSelectContentContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
	const viewportContext = useSelectViewportContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
	const [canScrollDown, setCanScrollDown] = import_react.useState(false);
	const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange);
	useLayoutEffect2(() => {
		if (contentContext.viewport && contentContext.isPositioned) {
			let handleScroll2 = function() {
				const maxScroll = viewport.scrollHeight - viewport.clientHeight;
				setCanScrollDown(Math.ceil(viewport.scrollTop) < maxScroll);
			};
			__name(handleScroll2, "handleScroll");
			const viewport = contentContext.viewport;
			handleScroll2();
			viewport.addEventListener("scroll", handleScroll2);
			return () => viewport.removeEventListener("scroll", handleScroll2);
		}
	}, [contentContext.viewport, contentContext.isPositioned]);
	return canScrollDown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollButtonImpl, {
		...props,
		ref: composedRefs,
		onAutoScroll: () => {
			const { viewport, selectedItem } = contentContext;
			if (viewport && selectedItem) viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
		}
	}) : null;
}, "SelectScrollDownButton"));
var SelectScrollButtonImpl = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectScrollButtonImpl2(props, forwardedRef) {
	const { __scopeSelect, onAutoScroll, ...scrollIndicatorProps } = props;
	const contentContext = useSelectContentContext("SelectScrollButton", __scopeSelect);
	const autoScrollTimerRef = import_react.useRef(null);
	const getItems = useCollection(__scopeSelect);
	const clearAutoScrollTimer = import_react.useCallback(() => {
		if (autoScrollTimerRef.current !== null) {
			window.clearInterval(autoScrollTimerRef.current);
			autoScrollTimerRef.current = null;
		}
	}, []);
	import_react.useEffect(() => {
		return () => clearAutoScrollTimer();
	}, [clearAutoScrollTimer]);
	useLayoutEffect2(() => {
		getItems().find((item) => item.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [getItems]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.div, {
		"aria-hidden": true,
		...scrollIndicatorProps,
		ref: forwardedRef,
		style: {
			flexShrink: 0,
			...scrollIndicatorProps.style
		},
		onPointerDown: composeEventHandlers(scrollIndicatorProps.onPointerDown, () => {
			if (autoScrollTimerRef.current === null) autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
		}),
		onPointerMove: composeEventHandlers(scrollIndicatorProps.onPointerMove, () => {
			contentContext.onItemLeave?.();
			if (autoScrollTimerRef.current === null) autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
		}),
		onPointerLeave: composeEventHandlers(scrollIndicatorProps.onPointerLeave, () => {
			clearAutoScrollTimer();
		})
	});
}, "SelectScrollButtonImpl"));
var BUBBLE_INPUT_NAME = "SelectBubbleInput";
var SelectBubbleInput = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function SelectBubbleInput2({ __scopeSelect, ...props }, forwardedRef) {
	const context = useSelectContext(BUBBLE_INPUT_NAME, __scopeSelect);
	const { value, onValueChange, required, disabled, name, autoComplete, form } = context;
	const { nativeOptions, nativeSelectKey } = context;
	const ref = import_react.useRef(null);
	const composedRefs = useComposedRefs(forwardedRef, ref);
	const selectValue = value ?? "";
	const prevValue = usePrevious(selectValue);
	const hasEmptyValueOption = Array.from(nativeOptions).some((option) => (option.props.value ?? "") === "");
	import_react.useEffect(() => {
		const select = ref.current;
		if (!select) return;
		const selectProto = window.HTMLSelectElement.prototype;
		const setValue = Object.getOwnPropertyDescriptor(selectProto, "value").set;
		if (prevValue !== selectValue && setValue) {
			const event = new Event("change", { bubbles: true });
			setValue.call(select, selectValue);
			select.dispatchEvent(event);
		}
	}, [prevValue, selectValue]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Primitive.select, {
		"aria-hidden": true,
		required,
		tabIndex: -1,
		name,
		autoComplete,
		disabled,
		form,
		onChange: (event) => onValueChange(event.target.value),
		...props,
		style: {
			...VISUALLY_HIDDEN_STYLES,
			...props.style
		},
		ref: composedRefs,
		defaultValue: selectValue,
		children: [shouldShowPlaceholder(value) && !hasEmptyValueOption ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "" }) : null, Array.from(nativeOptions)]
	}, nativeSelectKey);
}, "SelectBubbleInput"));
function isFunction(value) {
	return typeof value === "function";
}
__name(isFunction, "isFunction");
function shouldShowPlaceholder(value) {
	return value === "" || value === void 0;
}
__name(shouldShowPlaceholder, "shouldShowPlaceholder");
function useTypeaheadSearch(onSearchChange) {
	const handleSearchChange = useCallbackRef(onSearchChange);
	const searchRef = import_react.useRef("");
	const timerRef = import_react.useRef(0);
	const handleTypeaheadSearch = import_react.useCallback((key) => {
		const search = searchRef.current + key;
		handleSearchChange(search);
		(/* @__PURE__ */ __name((function updateSearch(value) {
			searchRef.current = value;
			window.clearTimeout(timerRef.current);
			if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1e3);
		}), "updateSearch"))(search);
	}, [handleSearchChange]);
	const resetTypeahead = import_react.useCallback(() => {
		searchRef.current = "";
		window.clearTimeout(timerRef.current);
	}, []);
	import_react.useEffect(() => {
		return () => window.clearTimeout(timerRef.current);
	}, []);
	return [
		searchRef,
		handleTypeaheadSearch,
		resetTypeahead
	];
}
__name(useTypeaheadSearch, "useTypeaheadSearch");
function findNextItem(items, search, currentItem) {
	const normalizedSearch = search.length > 1 && Array.from(search).every((char) => char === search[0]) ? search[0] : search;
	const currentItemIndex = currentItem ? items.indexOf(currentItem) : -1;
	let wrappedItems = wrapArray(items, Math.max(currentItemIndex, 0));
	if (normalizedSearch.length === 1) wrappedItems = wrappedItems.filter((v) => v !== currentItem);
	const nextItem = wrappedItems.find((item) => item.textValue.toLowerCase().startsWith(normalizedSearch.toLowerCase()));
	return nextItem !== currentItem ? nextItem : void 0;
}
__name(findNextItem, "findNextItem");
function wrapArray(array, startIndex) {
	return array.map((_, index) => array[(startIndex + index) % array.length]);
}
__name(wrapArray, "wrapArray");
//#endregion
//#region components/ui/select.tsx
function Select({ open, defaultOpen = false, onOpenChange, ...props }) {
	const accountBlocked = useOfflineAccountBlocked();
	const [localOpen, setLocalOpen] = import_react.useState(defaultOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select$1, {
		"data-slot": "select",
		...props,
		open: !accountBlocked && (open ?? localOpen),
		onOpenChange: (next) => {
			if (accountBlocked && next) return;
			setLocalOpen(next);
			onOpenChange?.(next);
		}
	});
}
function SelectValue({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue$1, {
		"data-slot": "select-value",
		...props
	});
}
function SelectTrigger({ className, size = "default", children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
		"data-slot": "select-trigger",
		"data-size": size,
		className: cn("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 opacity-50" })
		})]
	});
}
function SelectContent({ className, children, position = "item-aligned", align = "center", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
		"data-slot": "select-content",
		className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
		position,
		align,
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
				className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
		]
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
		"data-slot": "select-item",
		className: cn("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"data-slot": "select-item-indicator",
			className: "absolute right-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
	});
}
function SelectScrollUpButton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
		"data-slot": "select-scroll-up-button",
		className: cn("flex cursor-default items-center justify-center py-1", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" })
	});
}
function SelectScrollDownButton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
		"data-slot": "select-scroll-down-button",
		className: cn("flex cursor-default items-center justify-center py-1", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })
	});
}
//#endregion
//#region components/marketplace-publish-extras.tsx
var emptyMarketplaceExtras = () => ({
	details: { attributes: {
		age: "",
		size: "",
		weight: "",
		color: "",
		breed: ""
	} },
	gallery: [],
	sellerImage: ""
});
function MarketplacePublishFields({ value, onChange, onProcessing }) {
	const [message, setMessage] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false), [map, setMap] = (0, import_react.useState)(false), [locationEnabled, setLocationEnabled] = (0, import_react.useState)(false), [latitudeInput, setLatitudeInput] = (0, import_react.useState)(""), [longitudeInput, setLongitudeInput] = (0, import_react.useState)(""), [precision, setPrecision] = (0, import_react.useState)("approximate");
	const point = value.details.publicLocation;
	const selectPoint = (0, import_react.useCallback)((latitude, longitude) => {
		setLatitudeInput(String(latitude));
		setLongitudeInput(String(longitude));
		onChange({
			...value,
			details: {
				...value.details,
				publicLocation: {
					latitude,
					longitude,
					precision,
					label: point?.label || "Punto público elegido por el anunciante"
				}
			}
		});
	}, [
		value,
		onChange,
		precision,
		point?.label
	]);
	function coordinates(lat, lon) {
		setLatitudeInput(lat);
		setLongitudeInput(lon);
		if (lat.trim() && lon.trim() && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) selectPoint(Number(lat), Number(lon));
		else onChange({
			...value,
			details: {
				...value.details,
				publicLocation: null
			}
		});
	}
	async function photos(files, seller = false) {
		if (!files?.length || busy) return;
		setBusy(true);
		onProcessing(true);
		setMessage("");
		try {
			const input = Array.from(files);
			if (!seller && value.gallery.length + input.length > 5) throw new Error("Puedes añadir hasta 5 fotografías adicionales.");
			const results = [];
			for (const file of input.slice(0, seller ? 1 : 5)) {
				if (![
					"image/jpeg",
					"image/png",
					"image/webp"
				].includes(file.type) || file.size > 12e6) throw new Error("Usa JPG, PNG o WebP de menos de 12 MB.");
				const photo = await optimizeImage(file, 1e3, 45e4);
				if (photo.length > 7e5) throw new Error("La imagen sigue siendo demasiado grande. Selecciona otra.");
				results.push(photo);
			}
			onChange(seller ? {
				...value,
				sellerImage: results[0]
			} : {
				...value,
				gallery: [...value.gallery, ...results]
			});
			setMessage("Imágenes optimizadas; se guardarán con la publicación.");
		} catch (error) {
			setMessage(error.message || "No pudimos procesar las imágenes.");
		} finally {
			setBusy(false);
			onProcessing(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: "min-w-0 space-y-5 rounded-2xl border bg-[#f8f3ea] p-4 sm:p-6",
		disabled: busy,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: "px-2 text-base font-semibold",
				children: "Más información para tu anuncio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-[#71685f]",
				children: "Campos opcionales. No rellenes características que no puedas confirmar. Esta información y las imágenes se harán públicas cuando el anuncio sea aprobado."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: productAttributeFields.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm font-semibold",
					children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						maxLength: 100,
						value: value.details.attributes[key],
						onChange: (e) => onChange({
							...value,
							details: {
								...value.details,
								attributes: {
									...value.details.attributes,
									[key]: e.target.value
								}
							}
						}),
						className: "mt-2 h-12 w-full rounded-md border bg-white px-3",
						placeholder: key === "weight" ? "Ej. 320 kg por animal" : key === "size" ? "Incluye las unidades" : key === "age" ? "Ej. 18 meses" : "Opcional"
					})]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-semibold",
				children: ["Fotos adicionales (hasta 5)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/jpeg,image/png,image/webp",
					multiple: true,
					onChange: (e) => {
						photos(e.target.files);
						e.target.value = "";
					},
					className: "mt-2 block w-full text-xs"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-3",
				children: value.gallery.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt: `Foto adicional ${i + 1}`,
						width: 96,
						height: 96,
						className: "size-24 rounded-xl object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onChange({
							...value,
							gallery: value.gallery.filter((_, index) => index !== i)
						}),
						className: "min-h-11 text-xs underline",
						children: ["Quitar foto ", i + 1]
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm font-semibold",
				children: ["Foto o logo de tu finca / negocio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/jpeg,image/png,image/webp",
					onChange: (e) => {
						photos(e.target.files, true);
						e.target.value = "";
					},
					className: "mt-2 block w-full text-xs"
				})]
			}),
			value.sellerImage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: value.sellerImage,
					alt: "Logo o foto del anunciante, vista previa",
					width: 64,
					height: 64,
					className: "size-16 rounded-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange({
						...value,
						sellerImage: ""
					}),
					className: "min-h-11 text-xs underline",
					children: "Quitar imagen del anunciante"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-start gap-3 text-sm leading-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: locationEnabled,
					onChange: (e) => {
						setLocationEnabled(e.target.checked);
						if (!e.target.checked) {
							setMap(false);
							setLatitudeInput("");
							setLongitudeInput("");
							onChange({
								...value,
								details: {
									...value.details,
									publicLocation: null
								}
							});
						}
					},
					className: "mt-1 size-5 shrink-0"
				}), "Quiero elegir un punto para mostrarlo públicamente en este anuncio."]
			}),
			locationEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-xl bg-white p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-6",
						children: "Elige una zona aproximada o un punto exacto que quieras compartir. Nunca copiamos el plano, GPS ni ubicación privada de Mi Finca. No se solicita tu ubicación al dispositivo."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm font-semibold",
						children: ["Tipo de ubicación", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: precision,
							onChange: (e) => {
								const next = e.target.value;
								setPrecision(next);
								if (point) onChange({
									...value,
									details: {
										...value.details,
										publicLocation: {
											...point,
											precision: next
										}
									}
								});
							},
							className: "mt-2 h-12 w-full rounded-md border px-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "approximate",
								children: "Punto aproximado que elegiré"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "exact",
								children: "Punto exacto que autorizo mostrar"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "button-light",
						onClick: () => setMap((v) => !v),
						children: map ? "Cerrar selector de mapa" : "Elegir punto en el mapa"
					}),
					map && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCanvas, {
						point,
						onSelect: selectPoint
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: ["Latitud", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								step: "any",
								min: "-90",
								max: "90",
								value: latitudeInput,
								onChange: (e) => coordinates(e.target.value, longitudeInput),
								className: "mt-2 h-12 w-full rounded-md border px-3"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: ["Longitud", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								step: "any",
								min: "-180",
								max: "180",
								value: longitudeInput,
								onChange: (e) => coordinates(latitudeInput, e.target.value),
								className: "mt-2 h-12 w-full rounded-md border px-3"
							})]
						})]
					}),
					point && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Nombre público de la zona", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							maxLength: 180,
							minLength: 2,
							value: point.label,
							onChange: (e) => onChange({
								...value,
								details: {
									...value.details,
									publicLocation: {
										...point,
										label: e.target.value
									}
								}
							}),
							className: "mt-2 h-12 w-full rounded-md border px-3"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				"aria-live": "polite",
				className: "text-xs leading-6",
				children: busy ? "Optimizando imágenes…" : message
			})
		]
	});
}
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Camera = createLucideIcon("camera", [["path", {
	d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
	key: "18u6gg"
}], ["circle", {
	cx: "12",
	cy: "13",
	r: "3",
	key: "1vg3eu"
}]]);
//#endregion
//#region components/listing-form.tsx
var listing_form_exports = /* @__PURE__ */ __exportAll({
	ListingForm: () => ListingForm,
	optimizeImage: () => optimizeImage
});
function ListingForm({ sellerName, userId, draftOwner }) {
	(0, import_react.useEffect)(() => {
		if (userId) selectVerifiedDashboardOwner(userId);
	}, [userId]);
	const locked = (0, import_react.useRef)(false);
	const [category, setCategory] = (0, import_react.useState)("");
	const [customCategory, setCustomCategory] = (0, import_react.useState)("");
	const [pricePreview, setPricePreview] = (0, import_react.useState)("");
	const [currency, setCurrency] = (0, import_react.useState)("USD");
	const [state, setState] = (0, import_react.useState)("");
	const [buyerType, setBuyerType] = (0, import_react.useState)("Personas y empresas");
	const [supplyUnit, setSupplyUnit] = (0, import_react.useState)("unidad");
	const [imageDataUrl, setImageDataUrl] = (0, import_react.useState)();
	const [imageName, setImageName] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [tone, setTone] = (0, import_react.useState)("info");
	const [processing, setProcessing] = (0, import_react.useState)(false);
	const [extras, setExtras] = (0, import_react.useState)(emptyMarketplaceExtras);
	const [extrasKey, setExtrasKey] = (0, import_react.useState)(0);
	async function selectImage(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		setTone("error");
		if (!file.type.startsWith("image/")) {
			setMessage("Selecciona una fotografía válida.");
			return;
		}
		if (file.size > 12e6) {
			setMessage("La fotografía original debe pesar menos de 12 MB.");
			return;
		}
		setProcessing(true);
		try {
			const optimized = await optimizeImage(file);
			if (optimized.length > 19e5) {
				setMessage("No pudimos comprimir la fotografía lo suficiente. Elige una más liviana.");
				return;
			}
			setImageName(`${file.name} · optimizada`);
			setImageDataUrl(optimized);
			setMessage("");
		} catch {
			setMessage("No pudimos procesar esa imagen. Intenta con JPG, PNG o WebP.");
		} finally {
			setProcessing(false);
		}
	}
	async function submit(event) {
		event.preventDefault();
		if (locked.current || processing) return;
		setTone("error");
		if (!imageDataUrl) {
			setMessage("Añade una fotografía real de lo que ofreces antes de enviarlo a revisión.");
			return;
		}
		const resolvedCategory = category === "Otra categoría" ? customCategory.trim() : category;
		if (!resolvedCategory) {
			setMessage("Selecciona una categoría.");
			return;
		}
		if (!state) {
			setMessage("Selecciona el estado donde está la oferta.");
			return;
		}
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		const contactResult = listingContactSchema.safeParse({
			responsibleName: form.get("responsibleName"),
			phone: form.get("phone"),
			farmName: form.get("farmName"),
			whatsapp: form.get("whatsapp") === "on",
			advertiserType: form.get("advertiserType"),
			contactHours: form.get("contactHours"),
			deliveryMode: form.get("deliveryMode"),
			instagram: form.get("instagram"),
			facebook: form.get("facebook"),
			tiktok: form.get("tiktok"),
			youtube: form.get("youtube"),
			googleBusiness: form.get("googleBusiness"),
			website: form.get("website")
		});
		if (!contactResult.success) {
			setMessage(contactResult.error.issues[0]?.message || "Revisa tus datos de contacto.");
			return;
		}
		if (contactResult.data.whatsapp && !/^[1-9]\d{9,14}$/.test(phoneDigits(contactResult.data.phone))) {
			setMessage("Para WhatsApp incluye el código de país y el número completo (ej. +58 414 1234567).");
			return;
		}
		setSubmitting(true);
		const price = String(form.get("price") ?? "").trim();
		const listingId = createLocalId("listing");
		const payload = {
			sellerName: contactResult.data.responsibleName,
			contactProfile: contactResult.data,
			title: String(form.get("title") ?? ""),
			description: String(form.get("description") ?? ""),
			category: resolvedCategory,
			priceCents: price ? Math.round(Number(price) * 100) : null,
			currency,
			state,
			municipality: String(form.get("municipality") ?? ""),
			location: [
				String(form.get("municipality") ?? ""),
				state,
				"Venezuela"
			].filter(Boolean).join(", "),
			shortIntro: String(form.get("shortIntro") ?? ""),
			photoContext: String(form.get("photoContext") ?? ""),
			contact: contactResult.data.phone,
			saleFormat: String(form.get("saleFormat") ?? "A convenir"),
			supplyUnit,
			minimumOrder: String(form.get("minimumOrder") ?? ""),
			buyerType,
			productDetails: {
				...extras.details,
				ruralReference: String(form.get("ruralReference") ?? "").trim()
			},
			additionalImageDataUrls: extras.gallery,
			...extras.sellerImage ? { sellerImageDataUrl: extras.sellerImage } : {},
			...imageDataUrl ? { imageDataUrl } : {}
		};
		try {
			const parsed = listingPayloadSchema.parse(payload);
			locked.current = true;
			const operation = await queueMutation({
				expectedOwner: userId ?? draftOwner,
				entityType: "listing",
				entityId: listingId,
				action: "upsert",
				payload: parsed
			});
			const result = await syncNow().catch(() => ({ reason: "connection_interrupted" }));
			const receipt = await getOperationStatus(operation.id);
			setTone(receipt.state === "confirmed" ? "success" : "info");
			setMessage(receipt.state === "confirmed" ? "Publicación recibida para revisión. Aún no está publicada." : result.reason === "public_content_consent_required" ? "Publicación guardada. Autoriza primero el contenido público en Seguridad y privacidad para enviarla." : receipt.state === "blocked" ? "Borrador conservado. Revisa el motivo en Mi Finca → Sincronización antes de reenviar." : "Borrador guardado localmente; el envío todavía no está confirmado.");
			formElement.reset();
			setCategory("");
			setCustomCategory("");
			setCurrency("USD");
			setPricePreview("");
			setState("");
			setBuyerType("Personas y empresas");
			setSupplyUnit("unidad");
			setImageDataUrl(void 0);
			setImageName("");
			setExtras(emptyMarketplaceExtras());
			setExtrasKey((k) => k + 1);
		} catch (error) {
			setTone("error");
			setMessage(publicFormError(error, "No pudimos guardar la publicación en este dispositivo. Tus datos siguen en el formulario; intenta nuevamente."));
		} finally {
			locked.current = false;
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		"aria-busy": submitting || processing,
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFormGuide, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: submitting || processing,
				className: "space-y-6 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "min-w-0 rounded-2xl border border-[#3e2a19]/10 bg-[#f8f3ea] p-4 sm:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "px-2 text-base font-semibold",
								children: "1. Producto, precio y fotografía"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-5 text-sm leading-6 text-[#675f57]",
								children: "Empieza por lo que ofreces. El precio es opcional; la fotografía debe mostrar el producto real."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "sm:col-span-2 text-sm font-semibold",
										children: ["Título de la publicación *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "title",
											required: true,
											minLength: 3,
											maxLength: 160,
											className: "mt-2 h-12 bg-white",
											placeholder: "Ej. Novillas doble propósito"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
													category: category || "Cultivos",
													size: 18
												}), "Categoría *"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: category,
												onChange: (e) => setCategory(e.target.value),
												list: "marketplace-rubrics",
												required: true,
												className: "mt-2 h-12 bg-white",
												placeholder: "Busca tu rubro o escribe uno propio"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
												id: "marketplace-rubrics",
												children: marketplaceCategories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: item.value,
													children: [
														item.emoji,
														" ",
														item.group
													]
												}, item.value))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs font-normal text-[#71685f]",
												children: "Ej. maíz blanco, café, bovinos, leche o maquinaria. También puedes escribir otro rubro."
											})
										]
									}),
									category === "Otra categoría" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Categoría personalizada *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: customCategory,
											onChange: (event) => setCustomCategory(event.target.value),
											required: true,
											className: "mt-2 h-12 bg-white",
											placeholder: "Escribe la categoría agropecuaria"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Estado de Venezuela *", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: state,
											onValueChange: setState,
											required: true,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "mt-2 h-12 w-full bg-white",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Seleccionar estado" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: venezuelanStates.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: item,
												children: item
											}, item)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Municipio o zona", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "municipality",
											className: "mt-2 h-12 bg-white",
											placeholder: "Ej. Páez · El Nula"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "sm:col-span-2 text-sm font-semibold",
										children: [
											"Referencia para llegar (opcional)",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "ruralReference",
												maxLength: 240,
												className: "mt-2 h-12 bg-white",
												placeholder: "Ej. sector La Yuca, vía principal, cerca de la escuela"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs font-normal leading-5 text-[#71685f]",
												children: "Será pública. Comparte solo una referencia que quieras mostrar; no hace falta publicar la entrada ni las coordenadas de tu finca."
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: [
											"Precio por ",
											supplyUnit,
											" (opcional)",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "price",
												value: pricePreview,
												onChange: (event) => setPricePreview(event.target.value),
												type: "number",
												min: "0",
												max: "20000000",
												step: "0.01",
												inputMode: "decimal",
												className: "mt-2 h-12 bg-white",
												placeholder: "0,00"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Moneda", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: currency,
											onValueChange: setCurrency,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "mt-2 h-12 w-full bg-white",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: currencies.map((currency) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: currency,
												children: currencyLabels[currency]
											}, currency)) })]
										})]
									}),
									pricePreview.trim() !== "" && Number.isFinite(Number(pricePreview)) && Number(pricePreview) >= 0 && Number(pricePreview) <= 2e7 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "sm:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
											amount: Number(pricePreview),
											currency,
											unit: supplyUnit,
											showBasePrices: true
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["¿Cómo lo vendes?", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: buyerType,
											onValueChange: setBuyerType,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "mt-2 h-12 w-full bg-white",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Personas y empresas",
													children: "Personas y empresas"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Personas",
													children: "Venta unitaria / personas"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Solo empresas",
													children: "Solo empresas / volumen"
												})
											] })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Presentación o modalidad *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "saleFormat",
											required: true,
											className: "mt-2 h-12 bg-white",
											placeholder: "Ej. animal en pie, cortes, grano seco"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["¿A qué corresponde el precio?", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: supplyUnit,
											onValueChange: setSupplyUnit,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "mt-2 h-12 w-full bg-white",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"unidad",
												"kg",
												"animal",
												"lote",
												"g",
												"arroba",
												"tonelada",
												"litro",
												"saco",
												"caja",
												"dosis"
											].map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: unit,
												children: unit
											}, unit)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "sm:col-span-2 text-xs leading-6 text-[#71685f]",
										children: [
											"Este precio se publicará en la moneda que elegiste, por ",
											supplyUnit,
											". Si vendes por lote, indica cuántos animales o productos incluye. Las conversiones son aproximadas y no cambian tu precio."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Pedido mínimo (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "minimumOrder",
											className: "mt-2 h-12 bg-white",
											placeholder: "Ej. 20 kg, 1 res, 1 tonelada"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "sm:col-span-2 text-sm font-semibold",
										children: [
											"Cuéntalo en una frase *",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "shortIntro",
												required: true,
												minLength: 8,
												maxLength: 240,
												className: "mt-2 h-12 bg-white",
												placeholder: "Ej. Lote de novillas sanas para sistema doble propósito"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs font-normal leading-5 text-[#71685f]",
												children: "Nosotros ordenamos esta frase para que compradores y buscadores entiendan mejor tu oferta."
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "sm:col-span-2 text-sm font-semibold",
										children: ["Detalles útiles *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											name: "description",
											required: true,
											minLength: 10,
											maxLength: 3e3,
											className: "mt-2 min-h-36 bg-white",
											placeholder: "Incluye cantidad, edad o estado, medidas, condiciones, procedencia y cualquier información útil."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Fotografía principal (obligatoria)", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-2 flex min-h-12 min-w-0 cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 font-normal text-[#71685f]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
													size: 18,
													className: "shrink-0"
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "min-w-0 [overflow-wrap:anywhere]",
													children: imageName || "Elegir imagen (se optimiza automáticamente)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													disabled: processing || submitting,
													accept: "image/*",
													required: !imageDataUrl,
													onChange: selectImage,
													className: "sr-only"
												})
											]
										})]
									}),
									imageDataUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
										className: "sm:col-span-2 overflow-hidden rounded-2xl border bg-white p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: imageDataUrl,
											alt: "Vista previa de la fotografía principal",
											className: "max-h-72 w-full rounded-xl object-contain"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
											className: "mt-2 text-xs leading-5 text-[#675f57]",
											children: "Fotografía principal lista. Puedes reemplazarla con Elegir imagen."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "sm:col-span-2 text-sm leading-6",
										children: "Usa una fotografía real del producto, animal, terreno o servicio que ofreces y que tengas derecho a publicar. Los iconos de categoría no sustituyen esa fotografía."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "sm:col-span-2 text-sm font-semibold",
										children: [
											"¿Qué se ve en la foto? *",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "photoContext",
												required: true,
												minLength: 5,
												maxLength: 300,
												className: "mt-2 h-12 bg-white",
												placeholder: "Ej. Tres novillas marrones en potrero, vista lateral"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs font-normal leading-5 text-[#71685f]",
												children: "Este texto mejora la accesibilidad y se convierte automáticamente en una descripción útil para buscadores."
											})
										]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "min-w-0 rounded-2xl border border-[#3e2a19]/10 bg-[#f8f3ea] p-4 sm:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "px-2 text-base font-semibold",
								children: "2. Contacto del anunciante"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-5 text-sm leading-6 text-[#71685f]",
								children: "En esta sección solo son obligatorios el nombre del responsable y su teléfono. Estos datos aparecerán en tu publicación para que puedan contactarte."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Nombre del responsable *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "responsibleName",
											required: true,
											minLength: 2,
											maxLength: 120,
											defaultValue: sellerName,
											autoComplete: "name",
											className: "mt-2 h-12 bg-white",
											placeholder: "Nombre y apellido"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: [
											"Teléfono / celular *",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "phone",
												required: true,
												type: "tel",
												autoComplete: "tel",
												inputMode: "tel",
												maxLength: 40,
												className: "mt-2 h-12 bg-white",
												placeholder: "Ej. +58 412 123 4567"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs font-normal text-[#71685f]",
												children: "Incluye el código de país para facilitar el contacto."
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Nombre de la finca o negocio (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "farmName",
											maxLength: 160,
											className: "mt-2 h-12 bg-white",
											placeholder: "Nombre de tu finca"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Tipo de anunciante (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											name: "advertiserType",
											className: "mt-2 h-12 w-full rounded-md border bg-white px-3 text-sm font-normal",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Seleccionar"
											}), [
												"Productor agropecuario",
												"Finca familiar",
												"Cooperativa",
												"Distribuidor",
												"Profesional / servicios",
												"Otro"
											].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: value }, value))]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-11 items-center gap-3 text-sm sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											name: "whatsapp",
											type: "checkbox",
											className: "size-5 accent-[#4c6b3a]"
										}), "Este teléfono también recibe WhatsApp"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Horario de contacto (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "contactHours",
											maxLength: 120,
											className: "mt-2 h-12 bg-white",
											placeholder: "Ej. lunes a sábado, 8:00 a 17:00"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-sm font-semibold",
										children: ["Modalidad de entrega (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											name: "deliveryMode",
											className: "mt-2 h-12 w-full rounded-md border bg-white px-3 text-sm font-normal",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "A convenir"
											}), [
												"Retiro en finca",
												"Entrega a convenir",
												"Retiro o entrega"
											].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: value }, value))]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-5 rounded-xl border border-[#3e2a19]/10 bg-white p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
										className: "min-h-11 cursor-pointer py-3 text-sm font-semibold",
										children: "Agregar redes sociales y enlaces (opcional)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs leading-5 text-[#71685f]",
										children: "Pega los enlaces completos de tu finca o negocio. Puedes dejarlos vacíos."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 grid gap-4 sm:grid-cols-2",
										children: [
											[
												"instagram",
												"Instagram",
												"https://www.instagram.com/tuusuario"
											],
											[
												"facebook",
												"Facebook",
												"https://www.facebook.com/…"
											],
											[
												"tiktok",
												"TikTok",
												"https://www.tiktok.com/@tuusuario"
											],
											[
												"youtube",
												"YouTube",
												"https://www.youtube.com/@tuusuario"
											],
											[
												"googleBusiness",
												"Google Mi Negocio / Maps",
												"https://maps.app.goo.gl/…"
											],
											[
												"website",
												"Sitio web",
												"https://tufinca.com"
											]
										].map(([name, label, placeholder]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "min-w-0 text-sm font-semibold",
											children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "url",
												name,
												maxLength: 500,
												className: "mt-2 h-12 min-w-0 bg-white",
												placeholder
											})]
										}, name))
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "3. Información adicional (opcional)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplacePublishFields, {
						value: extras,
						onChange: setExtras,
						onProcessing: setProcessing
					}, extrasKey),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 rounded-2xl bg-[#e8f0df] p-4 text-sm leading-6 text-[#365026]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudOff, {
							className: "mt-0.5 shrink-0",
							size: 19
						}), "Puedes completar y guardar esta publicación sin señal. Permanecerá en este dispositivo. Para enviarla a revisión necesitas conexión, sesión y permisos de publicación."]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFeedback, {
				message,
				tone
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: submitting || processing,
				className: "h-13 w-full rounded-full bg-[#3e2a19] text-white hover:bg-[#4c6b3a] sm:w-auto sm:px-8",
				children: [submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, processing ? "Optimizando fotografía…" : submitting ? "Guardando publicación…" : "Guardar y enviar a revisión"]
			})
		]
	});
}
function readFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
async function optimizeImage(file, maximum = 1400, targetBytes = 135e4) {
	const objectUrl = URL.createObjectURL(file);
	const source = await new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(/* @__PURE__ */ new Error("image_decode_failed"));
		};
		image.src = objectUrl;
	});
	const scale = Math.min(1, maximum / Math.max(source.naturalWidth, source.naturalHeight));
	const width = Math.max(1, Math.round(source.naturalWidth * scale));
	const height = Math.max(1, Math.round(source.naturalHeight * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context) {
		URL.revokeObjectURL(objectUrl);
		throw new Error("canvas_unavailable");
	}
	context.drawImage(source, 0, 0, width, height);
	URL.revokeObjectURL(objectUrl);
	let quality = .8;
	let blob = null;
	do {
		blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
		quality -= .1;
	} while (blob && blob.size > targetBytes && quality >= .3);
	if (!blob) throw new Error("compression_failed");
	return readFile(blob);
}
//#endregion
export { SelectContent as a, SelectValue as c, Select as i, Root as l, listing_form_exports as n, SelectItem as o, optimizeImage as r, SelectTrigger as s, ListingForm as t };
