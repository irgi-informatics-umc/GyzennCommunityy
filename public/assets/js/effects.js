/**
 * Gyzenn Community - Effects & Particle Burst Helper
 */
function createRetroBurst(element, options = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !element) return;
  
  const rect = element.getBoundingClientRect();
  const count = options.count || 8;
  const colors = options.colors || ['#FF2A85', '#FFD600', '#2563EB', '#A3E635', '#FF5722'];
  const shapes = options.shapes || ['★', '✦', '■', '▲', '+', '♥'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'v7-particle';
    p.textContent = shapes[i % shapes.length];
    p.style.color = colors[i % colors.length];
    p.style.left = `${rect.left + rect.width / 2}px`;
    p.style.top = `${rect.top + rect.height / 2}px`;
    p.style.transform = 'translate(-50%, -50%) scale(0)';
    p.style.opacity = '1';

    document.body.appendChild(p);

    const angle = (i / count) * Math.PI * 2;
    const dist = Math.random() * 35 + 25;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.2)`;
      p.style.opacity = '0';
    });

    setTimeout(() => {
      p.remove();
    }, 550);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saweriaBurstBtns = document.querySelectorAll('.btn-saweria-burst');
  saweriaBurstBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      createRetroBurst(btn, { count: 8 });
    });
  });
});
