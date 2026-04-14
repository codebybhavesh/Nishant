/**
 * auth.js
 * Authentication logic for Nishant Events & Catering
 * Uses REST API + JWT (replaces Firebase Auth)
 */

import { apiFetch, saveSession, clearSession, getToken, getStoredUser } from './api.js';

/**
 * Register a new user with Email and Password
 */
export async function registerUser(email, password, name = '', phone = '', role = 'user') {
    try {
        // Register via API (role ignored server-side for security; admin must be set manually)
        await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, phone })
        });
        return { user: { email }, error: null };
    } catch (error) {
        console.error('Registration Error:', error);
        return { user: null, error: error.message };
    }
}

/**
 * Log in an existing user with Email and Password
 */
export async function loginUser(email, password) {
    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        saveSession(data.token, data.user);
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Login Error:', error);
        return { user: null, error: error.message };
    }
}

/**
 * Log out the current user — clears session and redirects to login
 */
export async function logoutUser() {
    clearSession();
    const loginUrl = window.location.pathname.includes('/admin/')
        ? '../login.html'
        : '/login.html';
    window.location.href = loginUrl;
}

/**
 * Get the currently logged-in user synchronously from localStorage
 */
export function getCurrentUser() {
    return getStoredUser();
}

/**
 * Fetch full user profile from server (verifies token is valid)
 */
export async function fetchCurrentUser() {
    try {
        const data = await apiFetch('/auth/me');
        // Refresh stored user with latest data
        saveSession(getToken(), data.user);
        return data.user;
    } catch {
        clearSession();
        return null;
    }
}

/**
 * Initialize Auth Listener — protects pages based on route boundaries.
 * Replaces Firebase onAuthStateChanged.
 * @param {Object} options
 * @param {boolean} options.requireAuth
 * @param {boolean} options.requireAdmin
 */
export function initAuthListener(options = {}) {
    const { requireAuth = false, requireAdmin = false } = options;

    // Async check to verify token is still valid with server
    (async () => {
        const user = await fetchCurrentUser();

        if (!user) {
            if (requireAuth) {
                const currentPath = window.location.pathname + window.location.search;
                const loginPrefix = window.location.pathname.includes('/admin/') ? '../' : '';
                window.location.href = `${loginPrefix}login.html?redirect=${encodeURIComponent(currentPath)}`;
            }
            return;
        }

        const isAdmin = user.role === 'admin';

        // Handle Admin Page Protection
        if (requireAdmin && !isAdmin) {
            alert('Access Denied: You do not have admin privileges.');
            const homeUrl = window.location.pathname.includes('/admin/')
                ? '../index.html'
                : '/index.html';
            window.location.href = homeUrl;
            return;
        }

        // Redirect away from login/signup if already authenticated
        if (
            window.location.pathname.includes('login.html') ||
            window.location.pathname.includes('admin-login.html') ||
            window.location.pathname.includes('signup.html')
        ) {
            if (isAdmin) {
                const dashboardUrl = window.location.pathname.includes('/admin/')
                    ? 'admin-dashboard.html'
                    : 'admin/admin-dashboard.html';
                window.location.href = dashboardUrl;
            } else {
                window.location.href = '/index.html';
            }
        }
    })();
}
