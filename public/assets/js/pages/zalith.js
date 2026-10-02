/**
 * Zalith Page JS - Progress Bar Animation
 */
document.addEventListener('DOMContentLoaded', () => {
  const zalithSection = document.getElementById('zalith');
  const zalithProgressFill = document.getElementById('zalithProgressFill');
  let zalithAnimated = false;

  if (zalithSection && zalithProgressFill && 'IntersectionObserver' in window) {
    const zalithObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !zalithAnimated) {
          zalithAnimated = true;
          zalithProgressFill.style.width = '100%';
          zalithObserver.unobserve(zalithSection);
        }
      });
    }, { threshold: 0.2 });

    zalithObserver.observe(zalithSection);
  } else if (zalithProgressFill) {
    zalithProgressFill.style.width = '100%';
  }
});
