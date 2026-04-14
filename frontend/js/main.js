/* ============================================================
   MAIN.JS — Shared behaviour across all user pages
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. NAVBAR ---- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navCloseBtn = document.getElementById('navCloseBtn');
  const hero = document.querySelector('.hero');

  // Mobile overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  // UI Logic
  const openNav = () => {
    if (!navLinks) return;
    navLinks.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    if (navToggle) navToggle.textContent = '✕';
  };

  const closeNav = () => {
    if (!navLinks) return;
    navLinks.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    if (navToggle) navToggle.textContent = '☰';
  };

  // Toggle button click
  navToggle && navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('show')) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close on nav link click
  navLinks && navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeNav);
  });

  // Close on overlay click
  overlay.addEventListener('click', closeNav);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  // Smart scroll behaviour - Navbar ALWAYS VISIBLE on all devices
  let lastY = 0, ticking = false;

  function updateNav() {
    if (!navbar) return; // Fix: Only update if navbar exists on this page

    const y = window.scrollY;
    const hero = document.querySelector('.hero, .service-hero');

    // Handle hero section transparency (HomePage & ServicesPage)
    if (hero) {
      const boundary = hero.offsetHeight - 100;
      navbar.classList.toggle('hero-top', y < boundary);
    } else {
      navbar.classList.remove('hero-top');
    }

    // Add scrolled shadow for visual feedback
    navbar.classList.toggle('scrolled', y > 20); // More sensitive shadow

    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateNav); ticking = true; } }, { passive: true });
  updateNav();

  // Handle window resize - ensure navbar stays visible
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Always ensure navbar is visible after resize
      if (navbar) navbar.classList.remove('hidden');
    }, 250);
  });

  /* ---- 1.1 HERO SLIDER ---- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 0) {
    let currentSlide = 0;
    const slideInterval = 2500; // 2.5 seconds

    function nextSlide() {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, slideInterval);
  }

  /* ---- "OUR EXPERTISE" SCROLL (Home) ---- */
  const expertiseScroll = document.getElementById('expertiseScroll');
  const expertisePrev = document.getElementById('expertisePrev');
  const expertiseNext = document.getElementById('expertiseNext');

  if (expertiseScroll && expertisePrev && expertiseNext) {
    const scrollAmount = 350;

    expertisePrev.addEventListener('click', () => {
      expertiseScroll.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });

    expertiseNext.addEventListener('click', () => {
      expertiseScroll.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });

    // Hide/show arrows based on scroll position (optional but better UX)
    const updateArrows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = expertiseScroll;
      expertisePrev.style.opacity = scrollLeft <= 0 ? '0.3' : '1';
      expertisePrev.style.pointerEvents = scrollLeft <= 0 ? 'none' : 'auto';

      expertiseNext.style.opacity = scrollLeft + clientWidth >= scrollWidth - 5 ? '0.3' : '1';
      expertiseNext.style.pointerEvents = scrollLeft + clientWidth >= scrollWidth - 5 ? 'none' : 'auto';
    };

    expertiseScroll.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  /* ---- TESTIMONIALS SCROLL (Home) ---- */
  const testimonialScroll = document.getElementById('testimonialScroll');
  const testimonialPrev = document.getElementById('testimonialPrev');
  const testimonialNext = document.getElementById('testimonialNext');

  if (testimonialScroll && testimonialPrev && testimonialNext) {
    const scrollAmount = 400;

    testimonialPrev.addEventListener('click', () => {
      testimonialScroll.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });

    testimonialNext.addEventListener('click', () => {
      testimonialScroll.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });

    const updateArrowsT = () => {
      const { scrollLeft, scrollWidth, clientWidth } = testimonialScroll;
      testimonialPrev.style.opacity = scrollLeft <= 0 ? '0.3' : '1';
      testimonialPrev.style.pointerEvents = scrollLeft <= 0 ? 'none' : 'auto';

      testimonialNext.style.opacity = scrollLeft + clientWidth >= scrollWidth - 5 ? '0.3' : '1';
      testimonialNext.style.pointerEvents = scrollLeft + clientWidth >= scrollWidth - 5 ? 'none' : 'auto';
    };

    testimonialScroll.addEventListener('scroll', updateArrowsT);
    window.addEventListener('resize', updateArrowsT);
    updateArrowsT();
  }

  /* ---- ADMIN PANEL MOBILE MENU ---- */
  const adminMenuToggle = document.getElementById('adminMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  // Admin menu toggle for mobile
  adminMenuToggle && adminMenuToggle.addEventListener('click', () => {
    if (sidebar) {
      sidebar.classList.toggle('open');
      // Change icon based on state
      adminMenuToggle.innerHTML = sidebar.classList.contains('open') ? '✕' : '☰';
    }
  });

  // Close button inside sidebar (× button)
  sidebarCloseBtn && sidebarCloseBtn.addEventListener('click', () => {
    if (sidebar) {
      sidebar.classList.remove('open');
      if (adminMenuToggle) adminMenuToggle.innerHTML = '☰';
    }
  });

  // Close admin sidebar when clicking overlay (if exists)
  if (typeof overlay !== 'undefined') {
    overlay.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (adminMenuToggle) adminMenuToggle.innerHTML = '☰';
      }
    });
  }

  /* ---- ADMIN TABLE SCROLL INDICATOR ---- */
  // Add scroll indicators to admin tables on all devices
  const tableWraps = document.querySelectorAll('.table-wrap');

  function checkTableScroll(wrap) {
    if (!wrap) return;
    const hasScroll = wrap.scrollWidth > wrap.clientWidth;
    wrap.classList.toggle('has-scroll', hasScroll);
    const atEnd = wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 5;
    wrap.classList.toggle('scrolled-end', atEnd);
  }

  tableWraps.forEach(wrap => {
    // Initial check
    checkTableScroll(wrap);

    // Update on scroll
    wrap.addEventListener('scroll', () => checkTableScroll(wrap));

    // Set up ResizeObserver to dynamically detect table content load (e.g. from API)
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => checkTableScroll(wrap));
      resizeObserver.observe(wrap);

      // Also observe the inner table if it exists, as its width might change independently
      const table = wrap.querySelector('table');
      if (table) resizeObserver.observe(table);
    } else {
      // Fallback for older browsers
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => checkTableScroll(wrap), 200);
      });
    }
  });

  // Expose function globally in case external scripts need to force an update
  window.updateTableScrollIndicators = () => {
    document.querySelectorAll('.table-wrap').forEach(checkTableScroll);
  };


  /* ---- 2. PACKAGE FILTERING ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pkgCards = document.querySelectorAll('.package-card');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        pkgCards.forEach((c, i) => {
          const show = f === 'all' || c.dataset.category === f;
          c.style.display = show ? 'flex' : 'none';
          if (show) { c.style.animation = 'none'; c.offsetHeight; c.style.animation = `scaleIn 0.35s ease ${i * 0.05}s both`; }
        });
      });
    });
  }


  /* ---- 3. LIVE PRICE CALCULATOR ---- */
  const pkgSel = document.getElementById('packageSelect');
  const guestsInp = document.getElementById('guestsCount');
  const elSub = document.getElementById('totalPrice');
  const elPer = document.getElementById('perHeadPrice');
  const elTax = document.getElementById('taxAmount');
  const elGrand = document.getElementById('grandTotal');

  function animVal(el, txt) {
    if (!el) return;
    el.style.opacity = '0'; el.style.transform = 'translateY(-5px)';
    setTimeout(() => { el.textContent = txt; el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'opacity 0.2s, transform 0.2s'; }, 160);
  }

  function recalc() {
    if (!pkgSel || !guestsInp) return;
    const guests = Math.max(10, parseInt(guestsInp.value) || 50);
    // Get price from actual packages
    let pricePerHead = 500;
    if (typeof getPackages === 'function') {
      const pkgs = getPackages();
      const matched = pkgs.find(p => p.id === pkgSel.value || p.type === pkgSel.value);
      if (matched) {
        pricePerHead = matched.pricePerPlate || matched.price || 500;
        if (matched.tiers && matched.tiers.length > 0) {
          const applicableTier = matched.tiers.find(t => guests >= t.min && guests <= t.max);
          if (applicableTier) pricePerHead = applicableTier.price;
        }
      }
    } else {
      const prices = { veg: 500, premium: 1500 };
      pricePerHead = prices[pkgSel.value] || 500;
    }
    const subtotal = pricePerHead * guests;
    const grand = subtotal;
    animVal(elPer, '₹' + pricePerHead.toLocaleString('en-IN') + ' / person');
    animVal(elSub, '₹' + subtotal.toLocaleString('en-IN'));
    if (elTax) elTax.textContent = '₹0';
    animVal(elGrand, '₹' + grand.toLocaleString('en-IN'));
    // Store for form submission
    window._bookingCalc = { pricePerHead, guests, subtotal, tax: 0, grand };
  }

  if (pkgSel && guestsInp) {
    pkgSel.addEventListener('change', recalc);
    guestsInp.addEventListener('input', () => {
      const el = document.getElementById('summaryGuests');
      if (el) el.textContent = (guestsInp.value || 50) + ' Guests';
      recalc();
    });
    recalc();
  }


  /* ---- 4. SCROLL REVEAL ---- */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal, .stagger-ch').forEach(el => ro.observe(el));

  // Auto-add reveal to common elements
  ['.section-title', '.section-subtitle', '.why-card', '.t-card', '.kpi-card', '.package-card'].forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * 0.06}s`;
        ro.observe(el);
      }
    });
  });
  ['.why-grid', '.testimonials-grid', '.chips-wrap', '.kpi-grid'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.classList.contains('stagger-ch')) { el.classList.add('stagger-ch'); ro.observe(el); }
    });
  });


  /* ---- 5. COUNTER ANIMATIONS ---- */
  const co = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseFloat(e.target.dataset.count || '0');
        const suffix = e.target.dataset.suffix || '';
        const dur = 1400, steps = 55, inc = target / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur += inc;
          if (cur >= target) { cur = target; clearInterval(t); }
          e.target.textContent = Math.floor(cur).toLocaleString('en-IN') + suffix;
        }, dur / steps);
        co.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

});
