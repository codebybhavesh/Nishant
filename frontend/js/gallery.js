import { BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    let allGalleryItems = [];
    let currentFilteredItems = [];
    
    // Pagination state
    const ITEMS_PER_PAGE = 8;
    let visibleCount = ITEMS_PER_PAGE;
    let currentFilter = 'all';
    let lightboxCurrentIndex = 0;

    const galleryGrid = document.getElementById('galleryGrid');
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // Lightbox elements
    const lightbox = document.getElementById('lightboxModal');
    const lightboxMediaContainer = document.getElementById('lightboxMedia');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxCaption = document.getElementById('lightboxCaption');

    /** ---- FETCH GALLERY ---- */
    async function fetchGallery() {
        try {
            const response = await fetch(`${BASE_URL}/api/gallery`);
            if (!response.ok) throw new Error('Failed to fetch gallery items');
            const data = await response.json();
            allGalleryItems = data.items || [];
            applyFilter('all');
        } catch (error) {
            console.error('Error fetching gallery:', error);
            galleryGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:var(--danger); padding:3rem 0;">Failed to load gallery images. Please try again later.</p>';
        }
    }

    /** ---- APPLY FILTER ---- */
    function applyFilter(filter) {
        currentFilter = filter;
        visibleCount = ITEMS_PER_PAGE;

        if (filter === 'all') {
            currentFilteredItems = [...allGalleryItems];
        } else {
            currentFilteredItems = allGalleryItems.filter(item => item.category === filter);
        }

        renderGallery();
    }

    /** ---- RENDER GALLERY ---- */
    function renderGallery() {
        galleryGrid.innerHTML = '';
        
        const itemsToDisplay = currentFilteredItems.slice(0, visibleCount);

        if (itemsToDisplay.length === 0) {
            galleryGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:var(--text-muted); padding:3rem 0;">No items found in this category.</p>';
            loadMoreContainer.style.display = 'none';
            return;
        }

        // Show/hide Load More button
        if (currentFilteredItems.length > visibleCount) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }

        // Render cards
        itemsToDisplay.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-card reveal';
            card.style.transitionDelay = `${(index % 8) * 0.05}s`;

            card.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}" loading="lazy" class="gallery-media-thumb">
                <span class="gallery-cat-badge">${item.category}</span>
                <div class="gallery-hover-overlay">
                    <span class="gallery-view-text">View Details</span>
                    <h4 class="gallery-item-title">${item.title}</h4>
                </div>
            `;

            // Click to open lightbox
            card.addEventListener('click', () => openLightbox(index));

            galleryGrid.appendChild(card);
        });

        // Trigger reveal animations
        setTimeout(() => {
            const newCards = document.querySelectorAll('.gallery-card');
            newCards.forEach(c => c.classList.add('visible'));
        }, 50);
    }

    /** ---- LOAD MORE LOGIC ---- */
    loadMoreBtn.addEventListener('click', () => {
        visibleCount += ITEMS_PER_PAGE;
        renderGallery();
    });

    /** ---- FILTER LOGIC ---- */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.dataset.filter;

            // Fade grid out
            galleryGrid.style.opacity = '0';
            galleryGrid.style.transform = 'translateY(10px)';

            setTimeout(() => {
                applyFilter(filterValue);
                galleryGrid.style.opacity = '1';
                galleryGrid.style.transform = 'translateY(0)';
            }, 250);
        });
    });

    /** ---- LIGHTBOX LOGIC ---- */
    function openLightbox(index) {
        lightboxCurrentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxMediaContainer.innerHTML = '';
        }, 300);
    }

    function updateLightboxContent() {
        const item = currentFilteredItems[lightboxCurrentIndex];
        if (!item) return;

        lightboxMediaContainer.style.opacity = '0';

        setTimeout(() => {
            lightboxMediaContainer.innerHTML = `
                <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                    <img src="${item.imageUrl}" alt="${item.title}" class="lightbox-hero-media">
                    <span class="gallery-cat-badge" style="top: 1rem; left: 1rem; position: absolute;">${item.category}</span>
                </div>
            `;
            lightboxCaption.textContent = item.title;
            lightboxMediaContainer.style.opacity = '1';
        }, 200);

        // Navigation visibility
        lightboxPrev.style.visibility = lightboxCurrentIndex > 0 ? 'visible' : 'hidden';
        lightboxNext.style.visibility = lightboxCurrentIndex < currentFilteredItems.length - 1 ? 'visible' : 'hidden';
    }

    function navLightbox(direction) {
        const newIndex = lightboxCurrentIndex + direction;
        if (newIndex >= 0 && newIndex < currentFilteredItems.length) {
            lightboxCurrentIndex = newIndex;
            updateLightboxContent();
        }
    }

    // Lightbox event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navLightbox(-1));
    lightboxNext.addEventListener('click', () => navLightbox(1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;

        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') navLightbox(-1);
        else if (e.key === 'ArrowRight') navLightbox(1);
    });

    // Initialize
    fetchGallery();
});
