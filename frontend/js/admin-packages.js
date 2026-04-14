/**
 * admin-packages.js
 * Admin module for CRUD operations on the packages collection.
 * Replaces Firebase/Firestore with REST API calls.
 */
import { apiFetch } from './api.js';

/** Create a brand new catering package */
export async function addPackage(pkgData) {
    try {
        const data = await apiFetch('/packages', {
            method: 'POST',
            body: JSON.stringify(pkgData)
        });
        return { id: data.package._id, error: null };
    } catch (error) {
        console.error('Error adding package: ', error);
        return { id: null, error: error.message };
    }
}

/** Update an existing package */
export async function updatePackage(id, pkgData) {
    try {
        await apiFetch(`/packages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(pkgData)
        });
        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating package: ', error);
        return { success: false, error: error.message };
    }
}

/** Delete a package securely */
export async function deletePackage(id) {
    try {
        await apiFetch(`/packages/${id}`, { method: 'DELETE' });
        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting package: ', error);
        return { success: false, error: error.message };
    }
}
