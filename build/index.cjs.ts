'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var axios = require('axios');
var AsyncStorage = require('@react-native-async-storage/async-storage');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var AsyncStorage__default = /*#__PURE__*/_interopDefaultLegacy(AsyncStorage);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const SanctumContext = React__namespace.createContext(undefined);

axios__default["default"].defaults.withCredentials = true;
const Sanctum = ({ checkOnInit = true, config, children }) => {
    const localAxiosInstance = React.useMemo(() => config.axiosInstance || axios__default["default"].create(), [config.axiosInstance]);
    const [sanctumState, setSanctumState] = React.useState({ user: null, authenticated: null });
    const user = sanctumState.user;
    const authenticated = sanctumState.authenticated;
    React.useEffect(() => {
        if (checkOnInit) {
            checkAuthentication();
        }
    }, [checkOnInit]);
    const csrf = () => {
        const { apiUrl, csrfCookieRoute } = config;
        return localAxiosInstance.get(`${apiUrl}/${csrfCookieRoute}`);
    };
    const signIn = (username, password, remember = false) => {
        const { apiUrl, signInRoute, usernameKey } = config;
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Get CSRF cookie.
                yield csrf();
                // Sign in.
                const { data: signInData } = yield localAxiosInstance.post(`${apiUrl}/${signInRoute}`, {
                    [usernameKey || "email"]: username,
                    password,
                    remember: remember ? true : null,
                }, {
                    maxRedirects: 0,
                });
                AsyncStorage__default["default"].setItem("@token", signInData).catch((error) => console.error(error));
                // Handle two factor.
                if (typeof signInData === "object" && signInData.two_factor === true) {
                    return resolve({ twoFactor: true, signedIn: false });
                }
                // Fetch user.
                const user = yield revalidate();
                return resolve({ twoFactor: false, signedIn: true, user });
            }
            catch (error) {
                return reject(error);
            }
        }));
    };
    const twoFactorChallenge = (code, recovery = false) => {
        const { apiUrl, twoFactorChallengeRoute } = config;
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // The user can either use their OTP token or use a recovery code.
                const formData = recovery ? { recovery_code: code } : { code };
                const token = yield AsyncStorage__default["default"].getItem("@token");
                yield localAxiosInstance.post(`${apiUrl}/${twoFactorChallengeRoute}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                // Fetch user.
                const user = yield revalidate();
                return resolve(user);
            }
            catch (error) {
                return reject(error);
            }
        }));
    };
    const signOut = () => {
        const { apiUrl, signOutRoute } = config;
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const token = yield AsyncStorage__default["default"].getItem("@token");
                yield localAxiosInstance.post(`${apiUrl}/${signOutRoute}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Only sign out after the server has successfully responded.
                setSanctumState({ user: null, authenticated: false });
                resolve();
            }
            catch (error) {
                return reject(error);
            }
        }));
    };
    const setUser = (user, authenticated = true) => {
        setSanctumState({ user, authenticated });
    };
    const revalidate = () => {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            const { apiUrl, userObjectRoute } = config;
            try {
                const token = yield AsyncStorage__default["default"].getItem("@token");
                const { data } = yield localAxiosInstance.get(`${apiUrl}/${userObjectRoute}`, {
                    maxRedirects: 0,
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(data);
                resolve(data);
            }
            catch (error) {
                if (axios__default["default"].isAxiosError(error)) {
                    if (error.response && error.response.status === 401) {
                        // If there's a 401 error the user is not signed in.
                        setSanctumState({ user: null, authenticated: false });
                        return resolve(false);
                    }
                    else {
                        // If there's any other error, something has gone wrong.
                        return reject(error);
                    }
                }
                else {
                    return reject(error);
                }
            }
        }));
    };
    const checkAuthentication = () => {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            if (authenticated === null) {
                // The status is null if we haven't checked it, so we have to make a request.
                try {
                    yield revalidate();
                    return resolve(true);
                }
                catch (error) {
                    if (axios__default["default"].isAxiosError(error)) {
                        if (error.response && error.response.status === 401) {
                            // If there's a 401 error the user is not signed in.
                            setSanctumState({ user: null, authenticated: false });
                            return resolve(false);
                        }
                        else {
                            // If there's any other error, something has gone wrong.
                            return reject(error);
                        }
                    }
                    else {
                        return reject(error);
                    }
                }
            }
            else {
                // If it has been checked with the server before, we can just return the state.
                return resolve(authenticated);
            }
        }));
    };
    return (React__default["default"].createElement(SanctumContext.Provider, { children: children || null, value: {
            user,
            authenticated,
            signIn,
            twoFactorChallenge,
            signOut,
            setUser,
            checkAuthentication,
        } }));
};

const withSanctum = (Component) => {
    const displayName = `withSanctum(${Component.displayName || Component.name})`;
    const C = (props) => {
        return (React__namespace.createElement(SanctumContext.Consumer, null, (context) => {
            if (!context)
                throw new Error(`<${displayName} /> should only be used inside <Sanctum />`);
            return React__namespace.createElement(Component, Object.assign({}, props, context));
        }));
    };
    C.displayName = displayName;
    return C;
};

function useSanctum() {
    const context = React__namespace.useContext(SanctumContext);
    if (!context)
        throw new Error("useSanctum should only be used inside <Sanctum />");
    return context;
}

exports.Sanctum = Sanctum;
exports.SanctumContext = SanctumContext;
exports.useSanctum = useSanctum;
exports.withSanctum = withSanctum;
//# sourceMappingURL=index.cjs.ts.map
