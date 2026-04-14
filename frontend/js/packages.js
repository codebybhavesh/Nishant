/**
 * packages.js
 * Frontend client module for fetching packages from the REST API.
 * Replaces Firestore direct calls.
 */
import { apiFetch } from './api.js';

/**
 * Fetches all available catering packages from the backend API.
 */
export async function fetchPackages() {
    try {
        const data = await apiFetch('/packages');
        // Normalize _id -> id for compatibility with existing rendering code
        const packages = (data.packages || []).map(p => ({
            ...p,
            id: p._id || p.id,
            imageURL: p.imageURL || p.image || '',
            description: p.description || p.desc || ''
        }));
        return { packages, error: null };
    } catch (error) {
        console.error('Error fetching packages: ', error);
        return { packages: [], error: error.message };
    }
}
