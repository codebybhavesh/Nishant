/**
 * api.js
 * Shared REST API helper for Nishant Events & Catering.
 * Replaces Firebase SDK - all backend calls go through here.
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://nishant-backend-7ree.onrender.com/api';

/**
 * Get stored JWT token from localStorage
 */
export function getToken() {
    return localStorage.getItem('ne_token') || null;
}

/**
 * Get stored user object from localStorage
 */
export function getStoredUser() {
    try {
        const raw = localStorage.getItem('ne_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Save auth session to localStorage
 */
export function saveSession(token, user) {
    localStorage.setItem('ne_token', token);
    localStorage.setItem('ne_user', JSON.stringify(user));
}

/**
 * Clear auth session from localStorage
 */
export function clearSession() {
    localStorage.removeItem('ne_token');
    localStorage.removeItem('ne_user');
}

/**
 * Core fetch wrapper with auth header injection
 * @param {string} path - API path (e.g. '/auth/login')
 * @param {object} options - fetch options
 */
export async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
}
