/**
 * database.js
 * REST API integration for Nishant Events & Catering.
 * Replaces Firestore — Menu, Bookings CRUD operations.
 */

import { apiFetch } from './api.js';

// ==============================
// MENUS OPERATIONS
// ==============================
export async function addMenu(menuData) {
    try {
        const data = await apiFetch('/menus', {
            method: 'POST',
            body: JSON.stringify({ ...menuData })
        });
        return { id: data.menu._id, error: null };
    } catch (error) {
        console.error('Error adding menu: ', error);
        return { id: null, error: error.message };
    }
}

export async function fetchMenus() {
    try {
        const data = await apiFetch('/menus');
        const menus = (data.menus || []).map(m => ({ ...m, id: m._id || m.id }));
        return { menus, error: null };
    } catch (error) {
        console.error('Error fetching menus: ', error);
        return { menus: [], error: error.message };
    }
}

export async function updateMenu(id, menuData) {
    try {
        await apiFetch(`/menus/${id}`, {
            method: 'PUT',
            body: JSON.stringify(menuData)
        });
        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating menu: ', error);
        return { success: false, error: error.message };
    }
}

export async function deleteMenu(id) {
    try {
        await apiFetch(`/menus/${id}`, { method: 'DELETE' });
        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting menu: ', error);
        return { success: false, error: error.message };
    }
}

// ==============================
// BOOKINGS OPERATIONS
// ==============================
export async function addBooking(bookingData) {
    try {
        const data = await apiFetch('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        return { id: data.booking._id, error: null };
    } catch (error) {
        console.error('Error adding booking: ', error);
        return { id: null, error: error.message };
    }
}

export async function fetchBookings() {
    try {
        const data = await apiFetch('/bookings');
        const bookings = (data.bookings || []).map(b => ({ ...b, id: b._id || b.id }));
        return { bookings, error: null };
    } catch (error) {
        console.error('Error fetching bookings: ', error);
        return { bookings: [], error: error.message };
    }
}

export async function updateBookingStatus(id, newStatus) {
    try {
        const endpoint = newStatus === 'approved'
            ? `/bookings/${id}/approve`
            : `/bookings/${id}/reject`;
        await apiFetch(endpoint, { method: 'POST' });
        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating booking status: ', error);
        return { success: false, error: error.message };
    }
}
