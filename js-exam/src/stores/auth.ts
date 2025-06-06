import { defineStore } from "pinia";
import { useTodoStore } from "@/stores/todoStore"
import { authService } from "@/services/authService";
import type { LoginCredentials, RegisterInfo, JwtResponse, UserProfile, DecodedToken } from "@/types";
import router from "@/router";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("todoAppToken") || null as string | null,
        refreshToken: localStorage.getItem("todoAppRefreshToken") || null as string | null,
        user: JSON.parse(localStorage.getItem("todoAppUser") || "null") as UserProfile | null,
        isAuthenticated: !!localStorage.getItem("todoAppToken"),
        loginError: null as string | null,
        registerError: null as string | null,
        isLoading: false
    }),

    getters: {
        userDisplayName: (state) => {
            if (state.user){
                return `${state.user.firstName} ${state.user.lastName}`;
            }
            return "Guest";
        },
        bearerToken: (state) => {
            return state.token ? `Bearer ${state.token}` : null;
        }
    },

    actions: {
        _setUserAndToken(jwtResponse: JwtResponse, emailUsedForLoginOrRegister?: string){
            this.token = jwtResponse.token || null;
            this.refreshToken = jwtResponse.refreshToken || null;
            this.isAuthenticated = !!this.token;

            let userIdFromToken = '';
            let emailFromToken = emailUsedForLoginOrRegister || '';
            let firstNameToStore = jwtResponse.firstName || '';
            let lastNameToStore = jwtResponse.lastName || '';

            if (this.token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(this.token);
                    userIdFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
                    emailFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || emailFromToken;
                    firstNameToStore = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || firstNameToStore;
                    lastNameToStore = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || lastNameToStore;

                    if (!userIdFromToken) {
                        throw new Error("ID not found in token");
                    }
                } catch (error){
                    this.logoutCleanup();
                }
            } else {
                this.logoutCleanup();
            }

            this.user = {
                id: userIdFromToken,
                email: emailFromToken,
                firstName: firstNameToStore,
                lastName: lastNameToStore
            };

            localStorage.setItem("todoAppToken", this.token || '');
            localStorage.setItem("todoAppRefreshToken", this.refreshToken || '');
            localStorage.setItem("todoAppUser", JSON.stringify(this.user));
        },

        async login(credentials: LoginCredentials) {
            this.isLoading = true;
            this.loginError = null;
            try {
                const jwtResponse = await authService.login(credentials);
                this._setUserAndToken(jwtResponse, credentials.email ?? undefined);
                await router.push( {name: "home" });
                return true;
            } catch (error: any) {
                this.logoutCleanup();
                this.loginError = error.message || "Login failed. Please try again.";
                return false;
            } finally {
                this.isLoading = false;
            }

        },

        async register(userInfo: RegisterInfo) {
            this.isLoading = true;
            this.registerError = null;
            try {
                const jwtResponse = await authService.register(userInfo);
                this._setUserAndToken(jwtResponse, userInfo.email ?? undefined);
                await router.push( {name: "home" });
                return true;
            } catch (error: any) {
                this.logoutCleanup();
                this.registerError = error.message || "Registration failed. Please try again.";
                return false;
            } finally {
                this.isLoading = false;
            }
        },

        async refreshTokenAction() {
            this.isLoading = true;
            const currentToken = this.token;
            const currentRefreshToken = this.refreshToken;

            if (!currentToken || !currentRefreshToken) {
                this.logoutCleanup();
                return false;
            }

            try {
                const jwtResponse = await authService.refreshToken({
                    jwt: currentToken,
                    refreshToken: currentRefreshToken
                });

                this._setUserAndToken(jwtResponse, this.user?.email || undefined);
                this.isLoading = false;
                return true;
            } catch (error: any) {
                this.logoutCleanup();
                this.loginError = "Current session has expired. Please log in again.";
                this.isLoading = false;
                return false;
            }
        },

        logout() {
            this.logoutCleanup();
            const todoStore = useTodoStore();
            todoStore.clearUserTodosAndCategories();
            router.push( {name: "login"});
        },

        logoutCleanup() {
            this.token = null;
            this.refreshToken = null;
            this.user = null;
            this.isAuthenticated = false;
            this.loginError = null;
            this.registerError = null;
            localStorage.removeItem("todoAppToken");
            localStorage.removeItem("todoAppRefreshToken");
            localStorage.removeItem("todoAppUser");
        },

        initializeAuthFromStorage() {
            const token = localStorage.getItem("todoAppToken");
            const refreshToken = localStorage.getItem("todoAppRefreshToken");

            if (token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                        if (refreshToken) {
                            this.refreshTokenAction();
                        } else {
                            this.logoutCleanup();
                        }
                        return;
                    }

                    const userIdFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
                    const emailFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
                    const firstNameFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || '';
                    const lastNameFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || '';

                    if (!userIdFromToken) {
                        this.logoutCleanup();
                    }

                    this.user = {
                        id: userIdFromToken,
                        email: emailFromToken,
                        firstName: firstNameFromToken,
                        lastName: lastNameFromToken
                    };
                    this.token = token;
                    this.refreshToken = refreshToken;
                    this.isAuthenticated = true;
                    localStorage.setItem("todoAppUser", JSON.stringify(this.user));
                } catch (e) {
                    this.logoutCleanup();
                }
            } else {
                this.logoutCleanup();
            }
        }
    }
});