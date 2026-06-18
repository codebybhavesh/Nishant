import { initAuthListener, logoutUser } from './auth.js';
import { apiFetch } from './api.js';

// Setup Authentication Listener
initAuthListener({ requireAuth: true, requireAdmin: true });
window.adminLogout = async function () {
    await logoutUser();
};

const CLOUD_NAME = 'dfgtpljtq';
const UPLOAD_PRESET = 'nishant-events';

// Custom upload helper that returns both url and public_id
async function uploadToCloudinaryFull(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
        }

        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve({ imageUrl: data.secure_url, publicId: data.public_id });
            } else {
                let msg = 'Cloudinary upload failed.';
                try {
                    const err = JSON.parse(xhr.responseText);
                    msg = err.error?.message || msg;
                } catch (_) { }
                reject(new Error(msg));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(formData);
    });
}

let allGalleryItems = [];

// Fetch and render gallery items
window.loadGallery = async function () {
    try {
        const data = await apiFetch('/gallery');
        allGalleryItems = data.items || [];
        window.filterAndSearchGallery();
    } catch (err) {
        console.error('Failed to load gallery items:', err);
        alert('Error loading gallery items: ' + err.message);
    }
};

// Filter and search logic
window.filterAndSearchGallery = function () {
    const query = document.getElementById('gallerySearch').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('galleryCategoryFilter').value;

    const filtered = allGalleryItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(query);
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    document.getElementById('galleryCount').textContent = `${filtered.length} Item${filtered.length !== 1 ? 's' : ''}`;
    
    const container = document.getElementById('galleryList');
    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-gray);">No gallery items found.</div>`;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="gallery-card-admin">
            <div class="gallery-thumb-container">
                <img class="gallery-thumb-admin" src="${item.imageUrl}" alt="${item.title}" />
                <span class="gallery-badge-admin">${item.category}</span>
            </div>
            <div class="gallery-card-body-admin">
                <h4>${item.title}</h4>
                <div class="gallery-card-actions">
                    <button class="btn btn-outline btn-sm" onclick='window.editGalleryItem(${JSON.stringify(item).replace(/'/g, "&apos;")})'>Edit</button>
                    <button class="btn btn-sm" style="background:var(--danger-bg);color:var(--danger)" onclick="window.deleteGalleryItem('${item._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
};

// Modal controls
window.openModal = function (item = null) {
    const modal = document.getElementById('modal');
    const titleEl = document.getElementById('modalTitle');
    const editIdEl = document.getElementById('editId');
    const fTitleEl = document.getElementById('fTitle');
    const fCategoryEl = document.getElementById('fCategory');
    const fImgUrlEl = document.getElementById('fImgUrl');
    const fPublicIdEl = document.getElementById('fPublicId');
    const previewEl = document.getElementById('fImgPreview');
    const fileEl = document.getElementById('fFile');
    const statusEl = document.getElementById('imgUploadStatus');
    const errEl = document.getElementById('modalErr');

    modal.classList.add('open');
    errEl.style.display = 'none';
    statusEl.style.display = 'none';
    fileEl.value = '';

    if (!item) {
        titleEl.textContent = 'Add Gallery Item';
        editIdEl.value = '';
        fTitleEl.value = '';
        fCategoryEl.value = 'Wedding';
        fImgUrlEl.value = '';
        fPublicIdEl.value = '';
        previewEl.style.display = 'none';
        previewEl.src = '';
    }
};

window.closeModal = function () {
    document.getElementById('modal').classList.remove('open');
};

window.editGalleryItem = function (item) {
    window.openModal(item);
    document.getElementById('modalTitle').textContent = 'Edit Gallery Item';
    document.getElementById('editId').value = item._id;
    document.getElementById('fTitle').value = item.title;
    document.getElementById('fCategory').value = item.category;
    document.getElementById('fImgUrl').value = item.imageUrl;
    document.getElementById('fPublicId').value = item.publicId || '';

    const preview = document.getElementById('fImgPreview');
    preview.src = item.imageUrl;
    preview.style.display = 'block';
};

// Cloudinary image upload file listener
document.getElementById('fFile').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const status = document.getElementById('imgUploadStatus');
    const preview = document.getElementById('fImgPreview');

    status.className = 'upload-status uploading';
    status.textContent = 'Uploading image… 0%';
    status.style.display = 'block';
    preview.style.display = 'none';

    try {
        const { imageUrl, publicId } = await uploadToCloudinaryFull(file, (pct) => {
            status.textContent = `Uploading image… ${pct}%`;
        });
        document.getElementById('fImgUrl').value = imageUrl;
        document.getElementById('fPublicId').value = publicId;
        preview.src = imageUrl;
        preview.style.display = 'block';
        status.className = 'upload-status success';
        status.textContent = '✓ Image uploaded successfully';
    } catch (err) {
        status.className = 'upload-status error';
        status.textContent = '✗ Upload failed: ' + err.message;
    }
});

// Save Gallery Item
window.saveGalleryItem = async function () {
    const title = document.getElementById('fTitle').value.trim();
    const category = document.getElementById('fCategory').value;
    const imageUrl = document.getElementById('fImgUrl').value;
    const publicId = document.getElementById('fPublicId').value;
    const editId = document.getElementById('editId').value;
    const errEl = document.getElementById('modalErr');

    if (!title || !imageUrl) {
        errEl.textContent = 'Title and Image Upload are required.';
        errEl.style.display = 'block';
        return;
    }

    const itemData = { title, category, imageUrl, publicId };
    const btn = document.querySelector('#modal .btn-accent');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        if (editId) {
            await apiFetch(`/gallery/${editId}`, {
                method: 'PUT',
                body: JSON.stringify(itemData)
            });
        } else {
            await apiFetch('/gallery', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
        }
        window.closeModal();
        await window.loadGallery();
    } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
    } finally {
        btn.textContent = 'Save Item';
        btn.disabled = false;
    }
};

// Delete Gallery Item
window.deleteGalleryItem = async function (id) {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    try {
        await apiFetch(`/gallery/${id}`, {
            method: 'DELETE'
        });
        await window.loadGallery();
    } catch (err) {
        alert('Delete failed: ' + err.message);
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    window.loadGallery();
});
