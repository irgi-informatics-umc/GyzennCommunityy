/**
 * Gyzenn Community - Interactive Scripts
 * Handles mobile drawer, fast & subtle stat counters, reduced motion support,
 * scrollspy, and copy server IP functionality for KitaSMP.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Accessibility Check for Reduced Motion ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Header Scroll State & Back to Top Button ---
  const header = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header border/bg on scroll
    if (scrollY > 25) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Back to top visibility
    if (scrollY > 320) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }

    // Update active navigation indicator
    updateActiveNavOnScroll();
  }, { passive: true });

  // --- Mobile Drawer Navigation ---
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
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileNavBackdrop?.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // --- Back to Top Click Action ---
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });

  // --- Toast Notification Helper ---
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --- Copy IP Server KitaSMP Feature ---
  const btnCopyIp = document.getElementById('btnCopyIp');
  const copyIpBtnText = document.getElementById('copyIpBtnText');
  let copyResetTimeout = null;

  function fallbackCopyText(text, successCallback) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful && successCallback) successCallback();
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
  }

  if (btnCopyIp) {
    btnCopyIp.addEventListener('click', (e) => {
      e.preventDefault();
      const serverIp = 'play.kitasmp.com';

      function handleCopySuccess() {
        if (copyIpBtnText) {
          copyIpBtnText.textContent = 'IP Disalin!';
        }
        btnCopyIp.classList.add('copied');
        const icon = btnCopyIp.querySelector('i');
        if (icon) {
          icon.className = 'fa-solid fa-check';
        }

        showToast('✓ IP play.kitasmp.com berhasil disalin!');

        if (copyResetTimeout) clearTimeout(copyResetTimeout);
        copyResetTimeout = setTimeout(() => {
          if (copyIpBtnText) {
            copyIpBtnText.textContent = 'Copy IP';
          }
          btnCopyIp.classList.remove('copied');
          if (icon) {
            icon.className = 'fa-solid fa-copy';
          }
        }, 2500);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(serverIp).then(handleCopySuccess).catch(() => {
          fallbackCopyText(serverIp, handleCopySuccess);
        });
      } else {
        fallbackCopyText(serverIp, handleCopySuccess);
      }
    });
  }

  // --- Fast & Subtle Animated Numbers Counter ---
  const counters = document.querySelectorAll('.counter-animate');
  let counterAnimated = false;

  function renderInstantCounters() {
    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      if (suffix.includes('K')) {
        counter.textContent = prefix + target + suffix;
      } else {
        counter.textContent = prefix + target.toLocaleString('id-ID') + suffix;
      }
    });
  }

  function animateCounters() {
    if (prefersReducedMotion) {
      renderInstantCounters();
      return;
    }

    const duration = 800; // Fast 800ms
    const startTime = performance.now();

    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * target);

        if (target >= 1000 && !suffix.includes('K')) {
          counter.textContent = prefix + currentVal.toLocaleString('id-ID') + suffix;
        } else {
          counter.textContent = prefix + currentVal + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          if (suffix.includes('K')) {
            counter.textContent = prefix + target + suffix;
          } else {
            counter.textContent = prefix + target.toLocaleString('id-ID') + suffix;
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // Observe community section for triggering stat counter
  const communitySection = document.getElementById('community');
  if (communitySection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counterAnimated) {
          counterAnimated = true;
          animateCounters();
          observer.unobserve(communitySection);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(communitySection);
  } else {
    animateCounters();
  }

  // --- Scrollspy for Highlighting Active Nav Link ---
  const sections = document.querySelectorAll('section[id]');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  const desktopNavLinks = document.querySelectorAll('.nav-menu .nav-link');

  function updateActiveNavOnScroll() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        desktopNavLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        bottomNavItems.forEach((item) => {
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }
});
