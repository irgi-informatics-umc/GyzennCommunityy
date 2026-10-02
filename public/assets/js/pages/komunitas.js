/**
 * Komunitas Page JS - Counter Animation
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    const duration = 800;
    const startTime = performance.now();

    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const hasDecimal = target % 1 !== 0;

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = hasDecimal ? (easeOut * target).toFixed(1) : Math.floor(easeOut * target);

        if (target >= 1000 && !suffix.includes('K')) {
          counter.textContent = prefix + Math.floor(easeOut * target).toLocaleString('id-ID') + suffix;
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
});
