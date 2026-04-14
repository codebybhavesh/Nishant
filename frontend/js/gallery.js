document.addEventListener('DOMContentLoaded', () => {
    // Gallery Assets Definition
    // The hero video is separate but also included in the gallery under 'videos'
    const galleryItems = [
        { id: 2, src: 'assets/gallery/img1.webp', type: 'image', category: 'food', title: 'Gourmet Appetizers' },
        { id: 3, src: 'assets/gallery/img2.webp', type: 'image', category: 'events', title: 'Outdoor Reception' },
        { id: 4, src: 'assets/gallery/img3.webp', type: 'image', category: 'decorations', title: 'Floral Mandap' },
        { id: 5, src: 'assets/gallery/img4.webp', type: 'image', category: 'food', title: 'Dessert Platter' },
        { id: 6, src: 'assets/gallery/img5.webp', type: 'image', category: 'events', title: 'Corporate Gala' },
        { id: 7, src: 'assets/gallery/img6.webp', type: 'image', category: 'decorations', title: 'Elegant Table Setting' },
        { id: 8, src: 'assets/gallery/img7.webp', type: 'image', category: 'food', title: 'Main Course Buffet' },
        { id: 9, src: 'assets/gallery/img8.webp', type: 'image', category: 'events', title: 'Birthday Celebration' },
        { id: 10, src: 'assets/gallery/img9.webp', type: 'image', category: 'decorations', title: 'Ambient Lighting Setup' }
    ];

    const galleryGrid = document.getElementById('galleryGrid');
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');

    // Lightbox elements
    const lightbox = document.getElementById('lightboxModal');
    const lightboxMediaContainer = document.getElementById('lightboxMedia');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxCaption = document.getElementById('lightboxCaption');

    let currentFilter = 'all';
    let currentFilteredItems = [...galleryItems];
    let lightboxCurrentIndex = 0;

    /** ---- RENDER GALLERY ---- */
    function renderGallery(filter) {
        // Filter items
        if (filter === 'all') {
            currentFilteredItems = [...galleryItems];
        } else {
            currentFilteredItems = galleryItems.filter(item => item.category === filter);
        }

        // Clear grid
        galleryGrid.innerHTML = '';

        if (currentFilteredItems.length === 0) {
            galleryGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:var(--text-muted); padding:3rem 0;">No items found in this category.</p>';
            return;
        }

        // Render items
        currentFilteredItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-card reveal';
            // Slight staggered animation
            card.style.transitionDelay = `${(index % 8) * 0.05}s`;

            // Thumbnail content
            let mediaHtml = '';
            if (item.type === 'video') {
                // For video thumbnail we can use a generic poster or rely on the browser's first frame if we mute it
                mediaHtml = `
                    <video src="${item.src}" muted playsinline class="gallery-media-thumb"></video>
                    <div class="gallery-play-icon">▶</div>
                `;
            } else {
                mediaHtml = `<img src="${item.src}" alt="${item.title}" loading="lazy" class="gallery-media-thumb">`;
            }

            card.innerHTML = `
                ${mediaHtml}
                <div class="gallery-hover-overlay">
                    <span class="gallery-view-text">View</span>
                    <h4 class="gallery-item-title">${item.title}</h4>
                </div>
            `;

            // Click to open lightbox
            card.addEventListener('click', () => openLightbox(index));

            galleryGrid.appendChild(card);
        });

        // Trigger reveal animations for newly added items
        setTimeout(() => {
            const newCards = document.querySelectorAll('.gallery-card');
            newCards.forEach(c => c.classList.add('visible'));
        }, 50);
    }

    /** ---- FILTER LOGIC ---- */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.dataset.filter;

            // Animate grid out slightly before rendering
            galleryGrid.style.opacity = '0';
            galleryGrid.style.transform = 'translateY(10px)';

            setTimeout(() => {
                renderGallery(currentFilter);
                galleryGrid.style.opacity = '1';
                galleryGrid.style.transform = 'translateY(0)';
            }, 300);
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
            // Remove src to stop video playing in background
            lightboxMediaContainer.innerHTML = '';
        }, 300);
    }

    function updateLightboxContent() {
        const item = currentFilteredItems[lightboxCurrentIndex];
        if (!item) return;

        // Clear current content fading it out
        lightboxMediaContainer.style.opacity = '0';

        setTimeout(() => {
            if (item.type === 'video') {
                lightboxMediaContainer.innerHTML = `<video src="${item.src}" controls autoplay playsinline class="lightbox-hero-media"></video>`;
            } else {
                lightboxMediaContainer.innerHTML = `<img src="${item.src}" alt="${item.title}" class="lightbox-hero-media">`;
            }
            lightboxCaption.textContent = item.title;
            lightboxMediaContainer.style.opacity = '1';
        }, 200);

        // Update nav buttons visibility based on array bounds
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

    // Close on overlay click (outside the media)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;

        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') navLightbox(-1);
        else if (e.key === 'ArrowRight') navLightbox(1);
    });

    // Initialize
    renderGallery('all');
});
