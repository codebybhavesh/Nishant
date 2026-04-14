/**
 * custom-menu.js
 * Handles custom menu request page logic.
 * Replaces Firebase Auth + Firestore with REST API calls.
 */
import { apiFetch } from './api.js';
import { fetchCurrentUser, getCurrentUser } from './auth.js';
import { fetchGroupedMenus } from './menu.js';
import { Cart } from './cart.js';

let currentUser = null;

// Initialize Cart
window.customCart = new Cart('cartContainer');

document.addEventListener('DOMContentLoaded', async () => {
    // Get user from API (verifies token)
    currentUser = await fetchCurrentUser();

    // Render menus
    const { grouped, error } = await fetchGroupedMenus();
    const browser = document.getElementById('menuBrowser');

    if (error) {
        browser.innerHTML = `<p style="color:var(--danger);text-align:center;padding:2rem;">Failed to load menus. Please try again later.</p>`;
        return;
    }

    if (!grouped || Object.keys(grouped).length === 0) {
        browser.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--text-muted)">No menu items available to display.</p>`;
        return;
    }

    let html = '';
    Object.keys(grouped).forEach(cat => {
        const items = grouped[cat];
        if (items.length > 0) {
            html += `
        <div class="category-section">
          <h2 class="category-title">${cat}</h2>
          <div class="menu-grid">
            ${items.map(item => `
              <div class="menu-item-card">
                ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}" style="width:100%;height:140px;object-fit:cover;border-radius:6px;margin-bottom:0.5rem;" onerror="this.style.display='none'" />` : ''}
                <h4>${item.name}</h4>
                <p>${item.description || ''}</p>
                <button class="btn btn-sm btn-outline" style="margin-top:0.5rem;" onclick='window.addCustomItem(${JSON.stringify(item).replace(/'/g, "&apos;")})'>+ Add to Menu</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
        }
    });

    browser.innerHTML = html;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cDate').min = today;

    // Render empty cart
    window.customCart.render();
});

// Global dispatcher for inline HTML onclick handlers
window.addCustomItem = function (item) {
    window.customCart.addItem(item);
};

// Handle Form Submission
document.getElementById('customMenuForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const errBox = document.getElementById('formReqErr');
    errBox.style.display = 'none';

    if (!currentUser) {
        errBox.textContent = 'You must be logged in to submit a request. Please login first.';
        errBox.style.display = 'block';
        return;
    }

    const selectedItems = window.customCart.getItems();
    if (selectedItems.length === 0) {
        errBox.textContent = 'Please add at least one menu item to your custom selection.';
        errBox.style.display = 'block';
        return;
    }

    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const requestPayload = {
        userName: currentUser.name || 'Unknown',
        email: currentUser.email || 'Unknown',
        phone: currentUser.phone || '',
        eventDate: document.getElementById('cDate').value,
        guestCount: parseInt(document.getElementById('cGuests').value, 10),
        selectedMenuItems: selectedItems.map(i => ({ id: i.id, name: i.name, category: i.category })),
        address: {
            street: document.getElementById('cStreet').value.trim(),
            city: document.getElementById('cCity').value.trim(),
            state: document.getElementById('cState').value.trim(),
            pincode: document.getElementById('cPincode').value.trim()
        },
        notes: document.getElementById('cNotes').value.trim()
    };

    try {
        await apiFetch('/custom-menu-requests', {
            method: 'POST',
            body: JSON.stringify(requestPayload)
        });

        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4500);

        this.reset();
        window.customCart.clear();
    } catch (err) {
        console.error('Submission Error:', err);
        errBox.textContent = 'An error occurred while sending your request. Please try again.';
        errBox.style.display = 'block';
    } finally {
        btn.textContent = 'Send Request';
        btn.disabled = false;
    }
});
