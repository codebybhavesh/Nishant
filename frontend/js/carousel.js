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
        }, 2000);
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

function initMarquee(trackId, speed = 40) {
  const track = document.getElementById(trackId);
  if (!track) return;

  const container = track.parentElement;
  const cards = Array.from(track.children);
  if (cards.length === 0) return;

  track.innerHTML = '';
  const group1 = document.createElement('div');
  group1.className = 'marquee-group';
  cards.forEach(c => group1.appendChild(c));
  track.appendChild(group1);

  for (let i = 0; i < 3; i++) {
    const clone = group1.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  track.style.animationDuration = `${speed}s`;
  track.classList.add('marquee-active');

  // --- helpers ---
  const groupWidth = () => track.querySelector('.marquee-group').offsetWidth + 24;

  function getCurrentTranslate() {
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41;
  }

  function clampTranslate(x) {
    const gw = groupWidth();
    return ((x % gw) - gw) % gw;
  }

  function applyTranslate(x) {
    track.style.transform = `translateX(${clampTranslate(x)}px)`;
  }

  function resumeAnimation(fromX) {
    const gw = groupWidth();
    const clamped = clampTranslate(fromX);
    const progress = Math.abs(clamped) / gw;
    track.style.transform = '';
    track.style.animationDelay = `${-(progress * speed)}s`;
    track.style.animationPlayState = 'running';
    track.classList.remove('is-dragging');
  }

  // --- drag state ---
  let isDragging = false;
  let startX = 0, dragOffset = 0, baseTranslate = 0;
  let velocity = 0, lastX = 0, lastTime = 0;
  let rafId = null;

  function onDragStart(clientX) {
    isDragging = true;
    startX = lastX = clientX;
    lastTime = Date.now();
    velocity = dragOffset = 0;
    baseTranslate = getCurrentTranslate();
    track.classList.add('is-dragging');
    track.style.animationPlayState = 'paused';
    cancelAnimationFrame(rafId);
  }

  function onDragMove(clientX) {
    if (!isDragging) return;
    const now = Date.now();
    velocity = (clientX - lastX) / (now - lastTime || 1);
    lastX = clientX;
    lastTime = now;
    dragOffset = clientX - startX;
    applyTranslate(baseTranslate + dragOffset);
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    let currentX = baseTranslate + dragOffset;
    let vel = velocity * 12;

    function coast() {
      vel *= 0.92;
      currentX += vel;
      applyTranslate(currentX);
      if (Math.abs(vel) > 0.5) {
        rafId = requestAnimationFrame(coast);
      } else {
        resumeAnimation(currentX);
      }
    }
    rafId = requestAnimationFrame(coast);
  }

  // Mouse
  container.addEventListener('mousedown', e => { e.preventDefault(); onDragStart(e.clientX); });
  window.addEventListener('mousemove',    e => { if (isDragging) onDragMove(e.clientX); });
  window.addEventListener('mouseup',      ()  => { if (isDragging) onDragEnd(); });

  // Touch
  container.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
  container.addEventListener('touchmove',  e => onDragMove(e.touches[0].clientX),  { passive: true });
  container.addEventListener('touchend',   onDragEnd);

  // --- arrow buttons ---
  const wrapper = container.parentElement;
  const btnLeft  = wrapper ? wrapper.querySelector('.carousel-arrow.left') : null;
  const btnRight = wrapper ? wrapper.querySelector('.carousel-arrow.right') : null;
  let isTransitioning = false;

  function getCardWidth() {
    const card = track.querySelector('.t-card') || track.querySelector('.expertise-card-item') || track.querySelector('.marquee-group > *');
    if (!card) return 400;
    const gap = 24; // must match .marquee-group gap in px
    return card.offsetWidth + gap;
  }

  function arrowScroll(direction) {
    if (isTransitioning || isDragging) return;
    isTransitioning = true;
    cancelAnimationFrame(rafId);

    const startVal = getCurrentTranslate();
    const W = getCardWidth();

    // Convert negative translate to positive scroll offset
    const scrollOffset = -startVal;
    const currentCardFloat = scrollOffset / W;
    let targetCardIndex;

    if (direction === -1) {
      // Go right / forward (scrollOffset increases)
      targetCardIndex = Math.floor(currentCardFloat) + 1;
      if ((targetCardIndex * W) - scrollOffset < 0.3 * W) {
        targetCardIndex += 1;
      }
    } else {
      // Go left / backward (scrollOffset decreases)
      targetCardIndex = Math.ceil(currentCardFloat) - 1;
      if (scrollOffset - (targetCardIndex * W) < 0.3 * W) {
        targetCardIndex -= 1;
      }
    }

    const target = -(targetCardIndex * W);

    // 1. Temporarily disable CSS animation and set start translate inline
    track.style.animation = 'none';
    applyTranslate(startVal);

    // Force browser reflow to register the starting inline style
    track.offsetHeight;

    // 2. Enable transition and move to target
    track.classList.add('has-transition');
    applyTranslate(target);

    function onTransitionEnd(e) {
      if (e.propertyName !== 'transform') return;
      track.removeEventListener('transitionend', onTransitionEnd);
      track.classList.remove('has-transition');

      // Clear the inline animation override so stylesheet marquee rules apply again
      track.style.animation = '';

      resumeAnimation(target);
      isTransitioning = false;
    }
    track.addEventListener('transitionend', onTransitionEnd);
  }

  if (btnLeft)  btnLeft.addEventListener('click',  () => arrowScroll(+1));
  if (btnRight) btnRight.addEventListener('click', () => arrowScroll(-1));
}

// Global exposure if needed, or initialized in main.js
window.initCarousel = initCarousel;
window.initMarquee = initMarquee;

