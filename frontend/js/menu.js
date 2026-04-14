/**
 * menu.js
 * Fetches menu items from the REST API and groups them by category.
 * Replaces Firestore direct calls.
 */
import { apiFetch } from './api.js';

const CATEGORIES = [
    'Welcome Drink',
    'Starter',
    'Vegetable Dish',
    'Dal',
    'Rice',
    'Bread',
    'Sweet',
    'Dessert',
    'Extras'
];

/**
 * Fetch all menus from the API and group them by category.
 */
export async function fetchGroupedMenus() {
    try {
        const data = await apiFetch('/menus');
        const menus = (data.menus || []).map(m => ({ ...m, id: m._id || m.id }));

        const grouped = {};
        CATEGORIES.forEach(c => (grouped[c] = []));

        menus.forEach(menu => {
            const cat = menu.category || 'Extras';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(menu);
        });

        return { grouped, error: null };
    } catch (err) {
        console.error('Error fetching menus:', err);
        return { grouped: null, error: err.message };
    }
}
