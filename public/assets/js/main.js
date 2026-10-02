/**
 * Gyzenn Community - Main Global Controller
 * Dark/Light theme, Navigation Drawer, Back to Top, Toast Notification, Global Central Image Error Handler
 */
document.addEventListener('DOMContentLoaded', () => {
  // Global Centralized Image Error Handler
  document.addEventListener('error', (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      e.target.classList.add('img-failed');
    }
  }, true);

  // 1. Header Scroll State & Back To Top
  const header = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    if (scrollY > 300) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });

  // 2. Mobile Drawer Navigation
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    menuToggle?.classList.add('active');
    menuToggle?.setAttribute('aria-expanded', 'true');
    mobileNav?.classList.add('open');
    mobileNavBackdrop?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    menuToggle?.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileNav?.classList.remove('open');
    mobileNavBackdrop?.classList.remove('show');
    document.body.style.overflow = '';
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.contains('open');
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  });

  mobileNavBackdrop?.addEventListener('click', closeMobileMenu);
  mobileNavLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));

  // 3. Global Toast Helper
  window.showToast = function(message) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // 4. Global Dark / Light Theme Controller
  const themeToggle = document.getElementById('themeToggle');

  function updateThemeUI(theme) {
    if (!themeToggle) return;
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.setAttribute('title', isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode');
    themeToggle.setAttribute('aria-label', isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode');

    const iconEl = themeToggle.querySelector('.theme-icon');
    const textEl = themeToggle.querySelector('.theme-text');

    if (iconEl && textEl) {
      if (isDark) {
        iconEl.className = 'fa-solid fa-sun theme-icon';
        textEl.textContent = 'LIGHT';
      } else {
        iconEl.className = 'fa-solid fa-moon theme-icon';
        textEl.textContent = 'DARK';
      }
    }
  }

  function applyTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
      try {
        localStorage.setItem('gyzenn-theme', theme);
      } catch (e) {}
    }
    updateThemeUI(theme);
  }

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeUI(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      try {
        if (!localStorage.getItem('gyzenn-theme')) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      } catch (err) {}
    });
  }
});
