import { apiFetch } from './api.js';

function renderStars(rating) {
  return "⭐⭐⭐⭐⭐".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
}

let currentIndex = 0;
let cards = [];
let dots = [];
let autoTimer = null;
let isTransitioning = false;

async function loadTestimonials() {
  const container = document.getElementById('testimonial-stack-track');
  if (!container) return;

  try {
    const feedbacks = await apiFetch('/feedback/latest');

    if (feedbacks && feedbacks.length > 0) {
      const dynamicHTML = feedbacks.map(f => {
        const userName = f.isManual ? f.name : (f.userId?.name || 'Anonymous User');
        return `
          <div class="t-card">
            <div class="t-stars" style="margin-bottom: 0.5rem; font-size: 1.2rem;">${renderStars(f.rating)}</div>
            <p><i>"${f.message}"</i></p>
            <div class="t-author">
              <div>
                <strong>${userName}</strong>
                <span>${new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.insertAdjacentHTML('beforeend', dynamicHTML);
    }
  } catch (err) {
    console.error('Failed to load testimonials:', err);
  } finally {
    initTestimonialStack();
  }
}

function initTestimonialStack() {
  const track = document.getElementById('testimonial-stack-track');
  const container = document.getElementById('testimonial-stack-container');
  const wrapper = document.querySelector('.testimonial-stack-wrapper');
  const btnPrev = document.getElementById('testimonial-prev');
  const btnNext = document.getElementById('testimonial-next');
  const dotsWrap = document.getElementById('testimonial-stack-dots');

  if (!track || !container) return;

  cards = Array.from(track.children);
  const total = cards.length;
  if (total === 0) return;

  // Build dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonial-stack-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        if (isTransitioning) return;
        goTo(i);
      });
      dotsWrap.appendChild(dot);
    });
    dots = Array.from(dotsWrap.children);
  }

  function goTo(index) {
    currentIndex = (index + total) % total;

    cards.forEach((card, i) => {
      card.classList.remove('state-front', 'state-behind-1', 'state-behind-2', 'state-hidden', 'exiting-left', 'exiting-right');

      if (i === currentIndex) {
        card.classList.add('state-front');
      } else if (i === (currentIndex + 1) % total) {
        card.classList.add('state-behind-1');
      } else if (i === (currentIndex + 2) % total) {
        card.classList.add('state-behind-2');
      } else {
        card.classList.add('state-hidden');
      }
    });

    if (dots.length > 0) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
  }

  function next() {
    if (isTransitioning || total <= 1) return;
    isTransitioning = true;

    const currentCard = cards[currentIndex];
    currentCard.classList.add('exiting-left');

    setTimeout(() => {
      goTo((currentIndex + 1) % total);
      isTransitioning = false;
    }, 400);
  }

  function prev() {
    if (isTransitioning || total <= 1) return;
    isTransitioning = true;

    const currentCard = cards[currentIndex];
    currentCard.classList.add('exiting-right');

    setTimeout(() => {
      goTo((currentIndex - 1 + total) % total);
      isTransitioning = false;
    }, 400);
  }

  if (btnPrev) btnPrev.addEventListener('click', prev);
  if (btnNext) btnNext.addEventListener('click', next);

  // --- Drag & Swipe Logic ---
  let isDragging = false;
  let isScrolling = false;
  let startX = 0;
  let startY = 0;

  function onDragStart(clientX, clientY) {
    if (isTransitioning) return;
    isDragging = true;
    isScrolling = false;
    startX = clientX;
    if (clientY !== undefined) startY = clientY;
    stopAuto();
  }

  function onDragMove(clientX, clientY) {
    if (!isDragging || isScrolling) return;

    if (clientY !== undefined && startY !== 0) {
      const dx = Math.abs(clientX - startX);
      const dy = Math.abs(clientY - startY);
      if (dy > dx && dy > 10) {
        isScrolling = true;
        isDragging = false;
        startAuto();
        return;
      }
    }
  }

  function onDragEnd(clientX) {
    if (!isDragging) return;
    isDragging = false;
    const diff = clientX - startX;
    if (diff < -80) {
      next();
    } else if (diff > 80) {
      prev();
    }
    startAuto();
  }

  // Mouse drag events on container
  container.addEventListener('mousedown', e => {
    onDragStart(e.clientX);
  });
  window.addEventListener('mousemove', e => {
    if (isDragging) onDragMove(e.clientX);
  });
  window.addEventListener('mouseup', e => {
    if (isDragging) onDragEnd(e.clientX);
  });

  // Touch events on container
  container.addEventListener('touchstart', e => {
    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  container.addEventListener('touchmove', e => {
    onDragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  container.addEventListener('touchend', e => {
    if (isDragging) onDragEnd(e.changedTouches[0].clientX);
  });
  container.addEventListener('touchcancel', () => {
    if (isDragging) {
      isDragging = false;
      startAuto();
    }
  });

  // --- Auto Rotate ---
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 2500);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);
  }

  // Initial render
  goTo(0);
  startAuto();
}

document.addEventListener('DOMContentLoaded', loadTestimonials);
