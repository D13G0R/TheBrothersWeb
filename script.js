(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const els = {
    scrollProgress: $('#scroll-progress'),
    siteHeader: $('#site-header'),
    nav: $('#nav'),
    menuToggle: $('#menu-toggle'),
  };

  function syncLock() {
    const locked = els.nav && els.nav.classList.contains('is-open');
    document.body.classList.toggle('is-locked', Boolean(locked));
  }

  function openNav() {
    els.nav.classList.add('is-open');
    els.menuToggle.classList.add('is-open');
    els.menuToggle.setAttribute('aria-expanded', 'true');
    els.menuToggle.setAttribute('aria-label', 'Cerrar menú');
    syncLock();
  }

  function closeNav() {
    if (!els.nav.classList.contains('is-open')) return;
    els.nav.classList.remove('is-open');
    els.menuToggle.classList.remove('is-open');
    els.menuToggle.setAttribute('aria-expanded', 'false');
    els.menuToggle.setAttribute('aria-label', 'Abrir menú');
    syncLock();
  }

  if (els.menuToggle && els.nav) {
    els.menuToggle.addEventListener('click', () => {
      if (els.nav.classList.contains('is-open')) closeNav();
      else openNav();
    });

    $$('.nav__link').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  }

  function updateScroll() {
    if (!els.siteHeader) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (els.scrollProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? (scrollTop / max) * 100 : 0;
      els.scrollProgress.style.width = `${progress}%`;
    }
    els.siteHeader.classList.toggle('is-scrolled', scrollTop > 8);
  }

  window.addEventListener('scroll', updateScroll, { passive: true });

  function initReveal() {
    const targets = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((target) => observer.observe(target));
  }

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    const media = target.closest('.media');
    if (media) media.classList.add('is-fallback');
  }, true);

  function markBrokenImages() {
    $$('.media img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        img.closest('.media')?.classList.add('is-fallback');
      }
    });
  }

  initReveal();
  markBrokenImages();
  updateScroll();
})();
