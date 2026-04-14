/**
 * admin-bookings.js
 * Handles fetching, approving, and rejecting bookings from the Admin Panel.
 * Replaces Firebase/Firestore with REST API calls.
 */
import { apiFetch } from './api.js';
import { fetchPackages } from './packages.js';

let allPackages = [];

/** Load package list for price lookup */
export async function loadPackages() {
    const { packages } = await fetchPackages();
    allPackages = packages || [];
}

/** Fetch all bookings from API, newest first */
export async function fetchAllBookings() {
    try {
        const data = await apiFetch('/bookings');
        const bookings = (data.bookings || []).map(b => ({ ...b, id: b._id || b.id }));
        return { bookings, error: null };
    } catch (err) {
        return { bookings: [], error: err.message };
    }
}

/**
 * Approve a booking — backend handles price calculation from package tiers.
 */
export async function approveBooking(bookingId) {
    try {
        const data = await apiFetch(`/bookings/${bookingId}/approve`, { method: 'POST' });
        return { success: true, grandTotal: data.booking?.grandTotal };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/** Reject a booking */
export async function rejectBooking(bookingId) {
    try {
        await apiFetch(`/bookings/${bookingId}/reject`, { method: 'POST' });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}
