/**
 * admin-custom-requests.js
 * Admin panel — fetch and manage custom menu requests.
 * Replaces Firebase/Firestore with REST API calls.
 */
import { apiFetch } from './api.js';

let allRequests = [];

window.renderRequests = function () {
    const q = document.getElementById('searchInp').value.toLowerCase().trim();
    const status = document.getElementById('statusFilter').value;

    let filtered = allRequests;
    if (q) {
        filtered = filtered.filter(r =>
            (r.userName || '').toLowerCase().includes(q) ||
            (r.phone || '').includes(q) ||
            (r.id || '').toLowerCase().includes(q)
        );
    }
    if (status) {
        filtered = filtered.filter(r => r.status === status);
    }

    document.getElementById('countLabel').textContent = `${filtered.length} Request${filtered.length !== 1 ? 's' : ''}`;

    const tbody = document.getElementById('requestsTbody');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:3rem;color:var(--text-muted)">No custom requests found.</td></tr>`;
        return;
    }

    const badgeClass = {
        pending: 'badge-pending',
        contacted: 'badge-info',
        approved: 'badge-approved',
        rejected: 'badge-danger'
    };

    tbody.innerHTML = filtered.map(r => {
        let itemsHtml = r.selectedMenuItems ? r.selectedMenuItems.map(i => `<span class="menu-item-tag">${i.name} <small style="opacity:0.6">(${i.category})</small></span>`).join('') : '—';
        let fullAddr = r.address ? `${r.address.street}, ${r.address.city}, ${r.address.state} ${r.address.pincode}` : '—';

        return `
        <tr>
            <td style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${(r.id || '').substring(0, 8)}</td>
            <td>
                <div style="font-weight:600">${r.userName}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">${r.phone}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">${r.email}</div>
            </td>
            <td style="white-space:nowrap">${r.eventDate}</td>
            <td>${r.guestCount}</td>
            <td>${itemsHtml}</td>
            <td>
                <div style="font-size:0.85rem;max-height:80px;overflow-y:auto;">
                    <strong>Addr:</strong> ${fullAddr}<br/>
                    <strong>Notes:</strong> ${r.notes || 'None'}
                </div>
            </td>
            <td><span class="badge ${badgeClass[r.status] || 'badge-pending'}">${r.status || 'pending'}</span></td>
            <td>
                <select onchange="window.updateReqStatus('${r.id}', this.value)" style="padding:0.3rem;font-size:0.8rem;border:1px solid #ddd;border-radius:4px;">
                    <option value="" disabled selected>Update...</option>
                    <option value="pending" ${r.status === 'pending' ? 'disabled' : ''}>Pending</option>
                    <option value="contacted" ${r.status === 'contacted' ? 'disabled' : ''}>Contacted</option>
                    <option value="approved" ${r.status === 'approved' ? 'disabled' : ''}>Approved</option>
                    <option value="rejected" ${r.status === 'rejected' ? 'disabled' : ''}>Rejected</option>
                </select>
            </td>
        </tr>`;
    }).join('');
};

window.updateReqStatus = async function (id, newStatus) {
    if (!newStatus) return;
    try {
        await apiFetch(`/custom-menu-requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        // Update local memory
        const req = allRequests.find(r => r.id === id);
        if (req) req.status = newStatus;
        window.renderRequests();
    } catch (err) {
        alert('Error updating status: ' + err.message);
    }
};

async function fetchAllRequests() {
    try {
        const data = await apiFetch('/custom-menu-requests');
        allRequests = (data.requests || []).map(r => ({ ...r, id: r._id || r.id }));
        window.renderRequests();
    } catch (err) {
        console.error('Error fetching requests:', err);
    }
}

document.addEventListener('DOMContentLoaded', fetchAllRequests);
