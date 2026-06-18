import { apiFetch } from './api.js';

function renderStars(rating) {
  return "⭐".repeat(rating) + "☆".repeat(5 - rating);
}

async function loadTestimonials() {
  const container = document.getElementById('testimonial-track');
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
                <div class="t-avatar">${userName.charAt(0)}</div>
                <div>
                  <strong>${userName}</strong>
                  <span>${new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          `;
      }).join('');

      container.insertAdjacentHTML('afterbegin', dynamicHTML);
    }
  } catch (err) {
    console.error('Failed to load testimonials:', err);
  } finally {
    if (window.initMarquee) {
      window.initMarquee('testimonial-track', 50);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadTestimonials);
