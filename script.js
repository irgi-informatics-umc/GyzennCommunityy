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

  // --- Modpack Gyzenn Data Structure & Dynamic Renderer ---
  const gyzennModpacks = [
    {
      id: "fpsboost-v3",
      name: "Modpack FpsBoost V3",
      category: "FPS BOOST",
      minecraft: "1.21",
      fabric: "0.19.2",
      badges: [],
      note: null,
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/1Bt49_fwH8VNpVIM2bNAQ9-yl1GBQzwAU/view?usp=sharing"
    },
    {
      id: "fpsboost-v4",
      name: "Modpack FpsBoost V4",
      category: "FPS BOOST",
      minecraft: "1.21.11",
      fabric: "0.19.3",
      badges: ["Resourcepack Included"],
      note: null,
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/12loZ_FYc41HiogJwDwZXi0bggaXWgDtY/view?usp=sharing"
    },
    {
      id: "fpsboost-v5",
      name: "Modpack FpsBoost V5",
      category: "FPS BOOST",
      minecraft: "1.21.11",
      fabric: "0.19.3",
      badges: ["Resourcepack Included"],
      note: "Ada mod Flashback. Kalau tidak suka, mod tersebut bisa dihapus.",
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/1fFOHr8H7mli-qDYFDZWs9zbjxPNMCqUS/view?usp=sharing"
    },
    {
      id: "fpsboost-v6",
      name: "Modpack FpsBoost V6",
      category: "FPS BOOST",
      minecraft: "26.2",
      fabric: "0.19.3",
      badges: ["Resourcepack Included"],
      note: null,
      isNew: true,
      isRecommended: true,
      downloadUrl: "https://drive.google.com/file/d/1Bw3AgXkeX0qKYb191QuudxwoHvgP3FIP/view?usp=sharing"
    },
    {
      id: "survival-v1",
      name: "Modpack Survival V1",
      category: "SURVIVAL",
      minecraft: "26.2",
      fabric: "0.19.3",
      badges: ["130 Mods", "Resourcepack Included", "Shaders Included"],
      note: null,
      isNew: true,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/1wlTff3EIipv1DAqdwfEt75UyLQABuC4f/view?usp=sharing"
    }
  ];

  function renderGyzennModpacks() {
    const container = document.getElementById('gyzennModpacksGrid');
    if (!container) return;

    const cardsHtml = gyzennModpacks.map(modpack => {
      let badgeBannerHtml = '';

      if (modpack.isNew) {
        badgeBannerHtml += `<span class="tag-badge tag-new-status"><i class="fa-solid fa-fire"></i> NEW</span> `;
      }
      if (modpack.isRecommended) {
        badgeBannerHtml += `<span class="tag-badge tag-recommended-status"><i class="fa-solid fa-star"></i> Recommended</span> `;
      }

      if (modpack.category === 'FPS BOOST') {
        badgeBannerHtml += `<span class="tag-badge tag-fps-category"><i class="fa-solid fa-bolt"></i> FPS BOOST</span> `;
      } else if (modpack.category === 'SURVIVAL') {
        badgeBannerHtml += `<span class="tag-badge tag-survival-category"><i class="fa-solid fa-campground"></i> SURVIVAL</span> `;
      }

      badgeBannerHtml += `<span class="tag-badge tag-mc-version"><i class="fa-solid fa-gamepad"></i> Minecraft ${modpack.minecraft}</span> `;
      badgeBannerHtml += `<span class="tag-badge tag-fabric"><i class="fa-solid fa-puzzle-piece"></i> Fabric ${modpack.fabric}</span> `;

      modpack.badges.forEach(b => {
        let icon = 'fa-solid fa-box-archive';
        if (b.includes('Mods')) icon = 'fa-solid fa-cubes';
        if (b.includes('Shaders')) icon = 'fa-solid fa-wand-magic-sparkles';
        badgeBannerHtml += `<span class="tag-badge tag-extra-bonus"><i class="${icon}"></i> ${b}</span> `;
      });

      const noteHtml = modpack.note ? `
        <div class="modpack-note-box">
          <i class="fa-solid fa-circle-info"></i>
          <span>${modpack.note}</span>
        </div>` : '';

      return `
        <div class="glass-card gyzenn-modpack-card">
          <div class="card-content">
            <div class="modpack-badge-banner">
              ${badgeBannerHtml}
            </div>
            <h3 class="modpack-title">${modpack.name}</h3>
            ${noteHtml}
          </div>
          <div class="card-action">
            <a href="${modpack.downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-google-drive btn-download-modpack">
              <i class="fa-brands fa-google-drive"></i>
              <span>Download Modpack</span>
              <i class="fa-solid fa-arrow-up-right-from-square icon-ext"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHtml;
  }

  // Initial call to ensure cards match JS data
  renderGyzennModpacks();

  // --- Interactive Gaming Mode Toggle ---
  const btnGamingModeToggle = document.getElementById('btnGamingModeToggle');
  const modpackGyzennSection = document.getElementById('modpack-gyzenn');

  if (btnGamingModeToggle && modpackGyzennSection) {
    btnGamingModeToggle.addEventListener('click', () => {
      const isGamingMode = modpackGyzennSection.classList.toggle('gaming-mode');
      btnGamingModeToggle.classList.toggle('active', isGamingMode);
      
      const statusEl = btnGamingModeToggle.querySelector('.mode-status');
      if (statusEl) {
        statusEl.textContent = isGamingMode ? 'ON' : 'OFF';
      }

      showToast(`Gaming Mode: ${isGamingMode ? 'ON (Efek Glow & Animated Border)' : 'OFF (Clean Mode)'}`);
    });
  }
});

