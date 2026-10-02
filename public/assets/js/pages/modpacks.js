/**
 * Modpacks Page JS - Dynamic Renderer, Collapsible Search, Subnav Chips, Deep Linking & Refreshing ScrollTrigger
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper string escaper
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 1. Gaming Mode Switcher
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

      if (window.showToast) {
        window.showToast(`Gaming Mode: ${isGamingMode ? 'ON (Bold Shadow Glow)' : 'OFF (Standard Mode)'}`);
      }
    });
  }

  // 2. Filter Pills & ScrollTrigger Refresh Fix
  const filterPills = document.querySelectorAll('.filter-pill');
  if (filterPills.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const category = pill.getAttribute('data-category');
        
        filterPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        const strips = document.querySelectorAll('#gyzennModpacksGrid .modpack-editorial-strip');
        strips.forEach(strip => {
          const cardCat = strip.getAttribute('data-category') || '';
          if (category === 'ALL') {
            strip.style.display = '';
          } else if (category === 'CPVP') {
            strip.style.display = (cardCat === 'CPVP' || cardCat.includes('CPVP')) ? '' : 'none';
          } else {
            strip.style.display = (cardCat === category || cardCat.includes(category)) ? '' : 'none';
          }
        });

        // Bug Fix #3: Refresh ScrollTrigger after filter changes
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    });
  }

  // 3. Deep Linking Hash Reset Fix (#5)
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetCard = document.getElementById(targetId);
    if (targetCard) {
      // Reset filter to ALL to make sure card is visible
      const allPill = document.querySelector('.filter-pill[data-category="ALL"]');
      if (allPill) allPill.click();
      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  // 4. Refresh ScrollTrigger on Details Toggle
  document.querySelectorAll('details').forEach(d => {
    d.addEventListener('toggle', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });

  // 5. Subnav Chips IntersectionObserver Active State
  const subnavChips = document.querySelectorAll('.subnav-chip');
  const modpackSections = document.querySelectorAll('section[id], div[id="derivative-shader"], div[id="better-sound-java"]');

  if (subnavChips.length > 0 && 'IntersectionObserver' in window) {
    const subnavObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          subnavChips.forEach(chip => {
            const href = chip.getAttribute('href');
            if (href === `#${id}`) chip.classList.add('active');
            else chip.classList.remove('active');
          });
        }
      });
    }, { threshold: 0.2 });

    modpackSections.forEach(s => subnavObserver.observe(s));
  }
});
