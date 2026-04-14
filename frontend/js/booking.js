/**
 * booking.js
 * Frontend scripts to populate dynamic menus on booking.html 
 * and execute API booking payloads exclusively.
 * Replaces Firebase/Firestore calls with REST API.
 */
import { fetchPackages } from './packages.js';
import { addBooking } from './database.js';
import { getCurrentUser, fetchCurrentUser } from './auth.js';

let allPkgs = [];

// Define the rendering specifications exactly as derived from user request
const catSpecs = [
    { id: 'drink', key: 'drinks', label: 'Welcome Drink', mode: 'single' },
    { id: 'starters', key: 'starters', label: 'Starter', mode: 'multi' },
    { id: 'vegetables', key: 'vegetables', label: 'Vegetable Dish', mode: 'multi' },
    { id: 'dal', key: 'dal', label: 'Dal', mode: 'single' },
    { id: 'rice', key: 'rice', label: 'Rice', mode: 'single' },
    { id: 'bread', key: 'breads', label: 'Bread', mode: 'multi' },
    { id: 'sweet', key: 'sweets', label: 'Sweet', mode: 'single' },
    { id: 'dessert', key: 'desserts', label: 'Dessert', mode: 'single' },
    { id: 'extras', key: 'extras', label: 'Extras', mode: 'multi' }
];

export async function loadBookingSystem() {
    const { packages } = await fetchPackages();
    allPkgs = packages || [];

    // Globally accessible hook for main.js pricing references 
    window.getPackages = () => allPkgs;

    const grid = document.getElementById('pkgSelectGrid');
    const sel = document.getElementById('packageSelect');

    if (allPkgs.length === 0) {
        grid.innerHTML = '<p>No packages found.</p>';
    } else {
        grid.innerHTML = allPkgs.map((p, i) => `
        <div class="pkg-opt ${i === 0 ? 'active' : ''}" data-pkg="${p.id}" onclick="selectPkg(this,'${p.id}')">
          <div class="opt-icon">${p.type === 'premium' ? '👑' : '🌿'}</div>
          <div class="opt-name">${p.name}</div>
          <div class="opt-price">From ₹${p.pricePerPlate || p.price || 0}/head</div>
        </div>
      `).join('');
        sel.innerHTML = allPkgs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    // Pre-select from URL param
    const urlParams = new URLSearchParams(location.search);
    const preselect = urlParams.get('pkgId') || urlParams.get('pkg');
    let initialTarget = null;
    let initialPkgId = null;

    if (preselect && grid.querySelector(`.pkg-opt[data-pkg="${preselect}"]`)) {
        initialTarget = grid.querySelector(`.pkg-opt[data-pkg="${preselect}"]`);
        initialPkgId = preselect;
    } else if (allPkgs.length > 0) {
        initialTarget = grid.querySelector(`.pkg-opt[data-pkg="${allPkgs[0].id}"]`);
        initialPkgId = allPkgs[0].id;
    }

    if (initialTarget && initialPkgId) {
        window.selectPkg(initialTarget, initialPkgId);
    } else if (sel) {
        sel.dispatchEvent(new Event('change'));
    }

    // Prefill user info from API
    try {
        const user = await fetchCurrentUser();
        if (user) {
            window.activeUserAuthId = user._id || user.id;
            const nameInp = document.getElementById('contactName');
            const emailInp = document.getElementById('contactEmail');
            const phoneInp = document.getElementById('contactPhone');
            if (nameInp && !nameInp.value) nameInp.value = user.name || '';
            if (emailInp && !emailInp.value) emailInp.value = user.email || '';
            if (phoneInp && !phoneInp.value) phoneInp.value = user.phone || '';
        } else {
            window.activeUserAuthId = null;
        }
    } catch (e) {
        window.activeUserAuthId = null;
    }
}

window.selectPkg = function (el, pkgId) {
    document.querySelectorAll('.pkg-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('packageSelect').value = pkgId;

    const pkg = allPkgs.find(p => p.id === pkgId);
    if (pkg) {
        document.getElementById('summaryPkg').innerHTML = `<strong>${pkg.name}</strong>`;
        renderMenuCustomizer(pkg);
    }
    document.getElementById('packageSelect').dispatchEvent(new Event('change'));
};

window.enforceMenuLimit = function (cb, catId, limit) {
    const checked = document.querySelectorAll(`input[name="menu_${catId}"]:checked`);
    if (checked.length > limit) {
        cb.checked = false;
        alert(`You can only select up to ${limit} items for this category.`);
    }
};

function renderMenuCustomizer(pkg) {
    const menuSection = document.getElementById('dynamicMenuSelection');
    const grid = document.getElementById('menuOptionsGrid');

    const hasAnyItems = pkg.menu && catSpecs.some(cat => (pkg.menu[cat.key] || []).length > 0);

    if (!hasAnyItems) {
        menuSection.style.display = 'none';
        return;
    }

    menuSection.style.display = 'block';

    grid.innerHTML = catSpecs.map(cat => {
        const items = (pkg.menu && pkg.menu[cat.key]) || [];
        if (items.length === 0) return '';

        const limit = (pkg.menuLimits && pkg.menuLimits[cat.key]) ? pkg.menuLimits[cat.key] : (cat.mode === 'single' ? 1 : 99);

        let innerHTML = '';
        if (limit === 1) {
            innerHTML = `
                <select id="sel_${cat.id}" class="form-control" name="menu_${cat.id}">
                    <option value="">— Choose ${cat.label} —</option>
                    ${items.map(item => `<option value="${item}">${item}</option>`).join('')}
                </select>
            `;
        } else {
            const limitHint = limit < 99
                ? `<span style="display:block;font-size:0.75rem;color:var(--accent);margin-bottom:0.5rem;font-weight:600">(Choose up to ${limit})</span>`
                : `<span style="display:block;font-size:0.75rem;color:var(--text-gray);margin-bottom:0.5rem">(Select all that apply)</span>`;
            innerHTML = `
                <div style="background:var(--bg-section);border:1px solid var(--border);border-radius:var(--r-md);padding:0.75rem;max-height:140px;overflow-y:auto">
                    ${limitHint}
                    ${items.map(item => `
                        <label style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;font-size:0.88rem;font-weight:400;color:var(--text);cursor:pointer">
                            <input type="checkbox" name="menu_${cat.id}" value="${item}" onchange="window.enforceMenuLimit(this, '${cat.id}', ${limit})" style="width:15px;height:15px;cursor:pointer"> ${item}
                        </label>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="form-group">
                <label>${cat.label}</label>
                ${innerHTML}
            </div>
        `;
    }).join('');
}


// Submission — maps directly to REST API
window.submitBookingProcess = async function (e) {
    e.preventDefault();
    document.getElementById('formError').style.display = 'none';

    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const date = document.getElementById('eventDate').value;
    const type = document.getElementById('eventType').value;
    const guests = parseInt(document.getElementById('guestsCount').value) || 0;
    const street = document.getElementById('addrStreet').value.trim();
    const city = document.getElementById('addrCity').value.trim();
    const state = document.getElementById('addrState').value.trim();
    const pincode = document.getElementById('addrPin').value.trim();

    if (!name || !phone || !email || !date || !type || guests < 10 || !street || !city || !state || !pincode) {
        document.getElementById('formError').textContent = 'Please fill in all required fields, including the full address elements.';
        document.getElementById('formError').style.display = 'block';
        document.getElementById('formError').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const matchedPkg = allPkgs.find(p => p.id === document.getElementById('packageSelect').value);

    let selectedMenu = {};
    catSpecs.forEach(cat => {
        const limit = (matchedPkg && matchedPkg.menuLimits && matchedPkg.menuLimits[cat.key]) ? matchedPkg.menuLimits[cat.key] : (cat.mode === 'single' ? 1 : 99);

        if (limit === 1) {
            const selObj = document.getElementById('sel_' + cat.id);
            const val = selObj ? selObj.value : '';
            selectedMenu[cat.id] = (cat.mode === 'multi') ? (val ? [val] : []) : val;
        } else {
            const cbs = document.querySelectorAll(`input[name="menu_${cat.id}"]:checked`);
            const arr = Array.from(cbs).map(c => c.value);
            selectedMenu[cat.id] = (cat.mode === 'single') ? (arr[0] || '') : arr;
        }
    });

    const payload = {
        userName: name,
        email: email,
        phone: phone,
        packageId: matchedPkg ? matchedPkg.id : null,
        pkgName: matchedPkg ? matchedPkg.name : '',
        guestCount: guests,
        selectedMenu: selectedMenu,
        eventDate: date,
        time: document.getElementById('eventTime').value,
        eventType: type,
        address: { street, city, state, pincode },
        specialReq: document.getElementById('specialReq').value
    };

    const submitBtn = document.querySelector('form button[type="submit"]');
    const oldT = submitBtn.innerText;
    submitBtn.innerText = 'Processing...';
    submitBtn.disabled = true;

    try {
        const { id, error } = await addBooking(payload);
        if (error) throw new Error(error);

        const confirmPayload = { ...payload, pkg: payload.pkgName, name: payload.userName, id };
        localStorage.setItem('nis_last_booking', JSON.stringify(confirmPayload));

        window.location.href = `confirmation.html`;
    } catch (err) {
        submitBtn.innerText = oldT;
        submitBtn.disabled = false;
        document.getElementById('formError').style.display = 'block';
        document.getElementById('formError').innerText = 'Submit Error: ' + err.message;
    }
};
