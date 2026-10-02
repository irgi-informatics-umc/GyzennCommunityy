/**
 * Casda Network Page JS - Exploding Pixel Particles Burst & Copy IP Notification
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const btnCopyIp = document.getElementById('btnCopyIp');
  const copyIpBtnText = document.getElementById('copyIpBtnText');
  let copyResetTimeout = null;

  function spawnCopyIpParticles(button) {
    if (prefersReducedMotion) return;
    const rect = button.getBoundingClientRect();
    const particleCount = 8;
    const colors = ['#FF2A85', '#FFD600', '#A3E635', '#2563EB'];

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'ip-particle';
      p.textContent = 'SOON!';
      p.style.backgroundColor = colors[i % colors.length];
      p.style.left = `${rect.left + rect.width / 2}px`;
      p.style.top = `${rect.top + rect.height / 2}px`;

      document.body.appendChild(p);

      const angle = (i / particleCount) * Math.PI * 2;
      const dist = Math.random() * 50 + 30;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 15;

      requestAnimationFrame(() => {
        p.style.transform = `translate(${tx}px, ${ty}px) scale(0.7)`;
        p.style.opacity = '0';
      });

      setTimeout(() => {
        p.remove();
      }, 600);
    }
  }

  if (btnCopyIp) {
    btnCopyIp.addEventListener('click', (e) => {
      e.preventDefault();
      spawnCopyIpParticles(btnCopyIp);
      if (window.showToast) {
        window.showToast('🟡 IP Casda Network akan segera diumumkan! Server sedang dalam tahap pengembangan.');
      }

      if (copyIpBtnText) copyIpBtnText.textContent = 'SEGERA DIUMUMKAN!';
      btnCopyIp.classList.add('copied');
      const icon = btnCopyIp.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bullhorn';

      if (copyResetTimeout) clearTimeout(copyResetTimeout);
      copyResetTimeout = setTimeout(() => {
        if (copyIpBtnText) copyIpBtnText.textContent = 'IP SEGERA RILIS';
        btnCopyIp.classList.remove('copied');
        if (icon) icon.className = 'fa-solid fa-clock';
      }, 2500);
    });
  }
});
