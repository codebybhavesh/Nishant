/**
 * Reusable Carousel Initialization
 * Support for auto-sliding, mouse drag, touch swipe, and loop effect.
 */
function initCarousel(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoSlide;

    const startAutoSlide = () => {
        autoSlide = setInterval(() => {
            // Amount to scroll - roughly the width of one card + gap
            const step = 320;
            track.scrollBy({ left: step, behavior: 'smooth' });

            // Loop back logic
            // Using a small threshold (10px) for reaching the end
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }, 1000);
    };

    const stopAutoSlide = () => {
        clearInterval(autoSlide);
    };

    // MOUSE DRAG
    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.classList.add('active'); // Could use for styling
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        stopAutoSlide();
    });

    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.classList.remove('active');
        startAutoSlide();
    });

    track.addEventListener('mouseup', () => {
        isDown = false;
        track.classList.remove('active');
        startAutoSlide();
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        track.scrollLeft = scrollLeft - walk;
    });

    // TOUCH SWIPE
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        stopAutoSlide();
    }, { passive: true });

    track.addEventListener('touchend', () => {
        startAutoSlide();
    });

    track.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - track.offsetLeft;
        const walk = (x - startX) * 2;
        track.scrollLeft = scrollLeft - walk;
    }, { passive: true });

    // PAUSE ON HOVER (Mouse)
    track.addEventListener('mouseenter', stopAutoSlide);
    track.addEventListener('mouseleave', startAutoSlide);

    // Initial Start
    startAutoSlide();
}

// Global exposure if needed, or initialized in main.js
window.initCarousel = initCarousel;
