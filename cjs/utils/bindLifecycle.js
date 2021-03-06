"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var hoist_non_react_statics_1 = __importDefault(require("hoist-non-react-statics"));
var noop_1 = __importDefault(require("./noop"));
var debug_1 = require("./debug");
var keepAliveDecorator_1 = require("./keepAliveDecorator");
var withIdentificationContextConsumer_1 = __importDefault(require("./withIdentificationContextConsumer"));
var getDisplayName_1 = __importDefault(require("./getDisplayName"));
exports.bindLifecycleTypeName = '$$bindLifecycle';
function bindLifecycle(Component) {
    var WrappedComponent = Component.WrappedComponent || Component.wrappedComponent || Component;
    var _a = WrappedComponent.prototype, _b = _a.componentDidMount, componentDidMount = _b === void 0 ? noop_1.default : _b, _c = _a.componentDidUpdate, componentDidUpdate = _c === void 0 ? noop_1.default : _c, _d = _a.componentDidActivate, componentDidActivate = _d === void 0 ? noop_1.default : _d, _e = _a.componentWillUnactivate, componentWillUnactivate = _e === void 0 ? noop_1.default : _e, _f = _a.componentWillUnmount, componentWillUnmount = _f === void 0 ? noop_1.default : _f, _g = _a.shouldComponentUpdate, shouldComponentUpdate = _g === void 0 ? noop_1.default : _g;
    WrappedComponent.prototype.componentDidMount = function () {
        var _this = this;
        componentDidMount.call(this);
        this._needActivate = false;
        var _a = this.props, _b = _a._container, identification = _b.identification, eventEmitter = _b.eventEmitter, activated = _b.activated, keepAlive = _a.keepAlive;
        // Determine whether to execute the componentDidActivate life cycle of the current component based on the activation state of the KeepAlive components
        if (!activated && keepAlive !== false) {
            componentDidActivate.call(this);
        }
        eventEmitter.on([identification, keepAliveDecorator_1.COMMAND.ACTIVATE], this._bindActivate = function () { return _this._needActivate = true; }, true);
        eventEmitter.on([identification, keepAliveDecorator_1.COMMAND.UNACTIVATE], this._bindUnactivate = function () {
            componentWillUnactivate.call(_this);
            _this._unmounted = false;
        }, true);
        eventEmitter.on([identification, keepAliveDecorator_1.COMMAND.UNMOUNT], this._bindUnmount = function () {
            componentWillUnmount.call(_this);
            _this._unmounted = true;
        }, true);
    };
    // In order to be able to re-update after transferring the DOM, we need to block the first update.
    WrappedComponent.prototype.shouldComponentUpdate = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this._needActivate) {
            this.forceUpdate();
            return false;
        }
        return shouldComponentUpdate.call.apply(shouldComponentUpdate, [this].concat(args)) || true;
    };
    WrappedComponent.prototype.componentDidUpdate = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        componentDidUpdate.call.apply(componentDidUpdate, [this].concat(args));
        if (this._needActivate) {
            this._needActivate = false;
            componentDidActivate.call(this);
        }
    };
    WrappedComponent.prototype.componentWillUnmount = function () {
        if (!this._unmounted) {
            componentWillUnmount.call(this);
        }
        var _a = this.props._container, identification = _a.identification, eventEmitter = _a.eventEmitter;
        eventEmitter.off([identification, keepAliveDecorator_1.COMMAND.ACTIVATE], this._bindActivate);
        eventEmitter.off([identification, keepAliveDecorator_1.COMMAND.UNACTIVATE], this._bindUnactivate);
        eventEmitter.off([identification, keepAliveDecorator_1.COMMAND.UNMOUNT], this._bindUnmount);
    };
    var BindLifecycleHOC = withIdentificationContextConsumer_1.default(function (_a) {
        var forwardRef = _a.forwardRef, _b = _a._identificationContextProps, identification = _b.identification, eventEmitter = _b.eventEmitter, activated = _b.activated, keepAlive = _b.keepAlive, extra = _b.extra, wrapperProps = __rest(_a, ["forwardRef", "_identificationContextProps"]);
        if (!identification) {
            debug_1.warn('[React Keep Alive] You should not use bindLifecycle outside a <KeepAlive>.');
            return null;
        }
        return (React.createElement(Component, __assign({}, extra, wrapperProps, { ref: forwardRef || noop_1.default, _container: {
                identification: identification,
                eventEmitter: eventEmitter,
                activated: activated,
                keepAlive: keepAlive,
            } })));
    });
    var BindLifecycle = React.forwardRef(function (props, ref) { return (React.createElement(BindLifecycleHOC, __assign({}, props, { forwardRef: ref }))); });
    BindLifecycle.WrappedComponent = WrappedComponent;
    BindLifecycle.displayName = exports.bindLifecycleTypeName + "(" + getDisplayName_1.default(Component) + ")";
    return hoist_non_react_statics_1.default(BindLifecycle, Component);
}
exports.default = bindLifecycle;
