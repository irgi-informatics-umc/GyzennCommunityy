/**
 * Home Page JS - GSAP Motion & Polaroid Cursor Tilt QuickTo Optimization
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const heroTimeline = gsap.timeline();
    heroTimeline
      .from('.status-badge', { duration: 0.5, y: -20, opacity: 0, ease: 'back.out(1.7)' })
      .from('.word-gyzenn', { duration: 0.6, x: -50, opacity: 0, ease: 'back.out(1.4)' }, '-=0.2')
      .from('.word-community', { duration: 0.6, x: 50, opacity: 0, ease: 'back.out(1.4)' }, '-=0.4')
      .from('.sticker-tag', { duration: 0.4, scale: 0, opacity: 0, stagger: 0.1, ease: 'back.out(2)' }, '-=0.3')
      .from('#heroPolaroid', { duration: 0.7, y: 30, rotation: -8, opacity: 0, ease: 'power2.out' }, '-=0.2')
      .from('.device-spec-pill', { duration: 0.4, y: 20, opacity: 0 }, '-=0.3')
      .from('.hero-cta-group .btn', { duration: 0.4, y: 20, opacity: 0, stagger: 0.1, ease: 'back.out(1.5)' }, '-=0.2');

    // Optimization: Desktop Polaroid Cursor Tilt using gsap.quickTo
    const heroPolaroid = document.getElementById('heroPolaroid');
    if (heroPolaroid && window.innerWidth > 768) {
      const xTo = gsap.quickTo(heroPolaroid, "rotationY", { duration: 0.4, ease: "power1.out" });
      const yTo = gsap.quickTo(heroPolaroid, "rotationX", { duration: 0.4, ease: "power1.out" });

      window.addEventListener('mousemove', (e) => {
        const { innerWidth, innerHeight } = window;
        const rotateY = ((e.clientX / innerWidth) - 0.5) * 8;
        const rotateX = -((e.clientY / innerHeight) - 0.5) * 8;
        xTo(rotateY);
        yTo(rotateX);
      }, { passive: true });
    }

    // Support Campaign Reveal
    if (document.getElementById('support') && typeof ScrollTrigger !== 'undefined') {
      const supportTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#support',
          start: 'top 82%',
          once: true
        }
      });

      supportTimeline
        .from('#support .support-tag-row', { duration: 0.4, y: -15, opacity: 0, ease: 'power2.out' })
        .from('#support .support-giant-title', { duration: 0.6, x: -30, opacity: 0, ease: 'back.out(1.4)' }, '-=0.2')
        .from('#support .support-editorial-lead', { duration: 0.45, y: 15, opacity: 0, ease: 'power2.out' }, '-=0.2')
        .from('#support .saweria-editorial-poster', { duration: 0.6, y: 35, rotation: 6, opacity: 0, ease: 'back.out(1.5)' }, '-=0.35');
    }
  }
});
