/**
 * Gyzenn Community - Centralized Retro Particle Engine
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class RetroParticleEngine {
    constructor() {
      this.canvas = document.getElementById('retroParticleCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouseX = -9999;
      this.mouseY = -9999;

      this.isMobile = window.innerWidth <= 768;
      this.particleCount = this.isMobile ? 10 : (window.innerWidth <= 1024 ? 20 : 32);

      this.palette = ['#FF2A85', '#FFD600', '#2563EB', '#A3E635', '#FF5722', '#7C3AED'];
      this.types = ['square', 'dot', 'plus', 'star'];

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      if (!this.isMobile) {
        window.addEventListener('mousemove', (e) => {
          this.mouseX = e.clientX;
          this.mouseY = e.clientY;
        }, { passive: true });
      }

      this.createParticles();

      if (!prefersReducedMotion) {
        requestAnimationFrame(() => this.loop());
      }
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      this.isMobile = window.innerWidth <= 768;
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 4 + 3,
          color: this.palette[Math.floor(Math.random() * this.palette.length)],
          type: this.types[Math.floor(Math.random() * this.types.length)],
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.02,
          opacity: Math.random() * 0.45 + 0.25
        });
      }
    }

    loop() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        if (!this.isMobile && this.mouseX > 0) {
          const dx = p.x - this.mouseX;
          const dy = p.y - this.mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * 1.5;
            p.y += Math.sin(angle) * 1.5;
          }
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;

        if (p.type === 'square') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.type === 'dot') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.type === 'plus') {
          this.ctx.fillRect(-p.size / 2, -1, p.size, 2);
          this.ctx.fillRect(-1, -p.size / 2, 2, p.size);
        } else if (p.type === 'star') {
          this.ctx.font = `${Math.floor(p.size * 2)}px VT323`;
          this.ctx.fillText('★', -p.size / 2, p.size / 2);
        }

        this.ctx.restore();
      });

      requestAnimationFrame(() => this.loop());
    }
  }

  new RetroParticleEngine();
});
