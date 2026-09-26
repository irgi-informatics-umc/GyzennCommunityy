/**
 * Gyzenn Community - 90s Retro Interactive Engine (Homepage)
 * Centralized retro particle system, hero motion timeline & polaroid cursor tilt,
 * scrollspy navigation, Zalith progress bar, Casda IP copy burst,
 * dynamic modpack renderer with Survival V1 97 mods explorer,
 * global dark/light theme toggle, and gaming mode toggle.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Accessibility Check for Reduced Motion ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 1. Centralized Retro Particle System Engine (Single rAF Loop)
  // --------------------------------------------------------------------------
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

        // Wrap edges
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        // Subtle Mouse Proximity Avoidance Drift (Desktop only)
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

        // Draw particle
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

  // Initialize Particle Engine
  new RetroParticleEngine();

  // --------------------------------------------------------------------------
  // 2. GSAP Entrance Motion Timeline & Hero Polaroid Cursor Tilt
  // --------------------------------------------------------------------------
  if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    const heroTimeline = gsap.timeline();

    heroTimeline
      .from('.status-badge', { duration: 0.5, y: -20, opacity: 0, ease: 'back.out(1.7)' })
      .from('.word-gyzenn', { duration: 0.6, x: -50, opacity: 0, ease: 'back.out(1.4)' }, '-=0.2')
      .from('.word-community', { duration: 0.6, x: 50, opacity: 0, ease: 'back.out(1.4)' }, '-=0.4')
      .from('.sticker-tag', { duration: 0.4, scale: 0, opacity: 0, stagger: 0.1, ease: 'back.out(2)' }, '-=0.3')
      .from('#heroPolaroid', { duration: 0.7, y: 30, rotation: -8, opacity: 0, ease: 'power2.out' }, '-=0.2')
      .from('.device-spec-pill', { duration: 0.4, y: 20, opacity: 0 }, '-=0.3')
      .from('.hero-cta-group .btn', { duration: 0.4, y: 20, opacity: 0, stagger: 0.1, ease: 'back.out(1.5)' }, '-=0.2');

    // Desktop Polaroid Cursor Tilt (max ±4deg)
    const heroPolaroid = document.getElementById('heroPolaroid');
    if (heroPolaroid && window.innerWidth > 768) {
      window.addEventListener('mousemove', (e) => {
        const { innerWidth, innerHeight } = window;
        const rotateY = ((e.clientX / innerWidth) - 0.5) * 8;
        const rotateX = -((e.clientY / innerHeight) - 0.5) * 8;
        gsap.to(heroPolaroid, {
          rotationY: rotateY,
          rotationX: rotateX,
          duration: 0.4,
          ease: 'power1.out'
        });
      }, { passive: true });
    }

    // Section Titles Reveal Animations
    gsap.utils.toArray('.section-title').forEach((title) => {
      gsap.from(title, {
        scrollTrigger: { trigger: title, start: 'top 85%' },
        duration: 0.6,
        y: 25,
        opacity: 0,
        ease: 'power2.out'
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. Header Scroll State & Back to Top Button
  // --------------------------------------------------------------------------
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

    updateActiveNavOnScroll();
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 4. Mobile Drawer Navigation
  // --------------------------------------------------------------------------
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
  mobileNavLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));

  // Back to Top Action
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });

  // Toast Notification Helper
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

  // --------------------------------------------------------------------------
  // 5. Casda Network Server Feature (Under Development) & Pixel Particles
  // --------------------------------------------------------------------------
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
      showToast('🟡 IP Casda Network akan segera diumumkan! Server sedang dalam tahap pengembangan.');

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

  // --------------------------------------------------------------------------
  // 6. Fast & Subtle Animated Numbers Counter
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 7. Scrollspy Navigation Update
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  const desktopNavLinks = document.querySelectorAll('.nav-menu .nav-link');

  function updateActiveNavOnScroll() {
    const scrollPosition = window.scrollY + 130;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {

        // Determine matching nav target (Treating #modpacks and #modpack-gyzenn as MODPACKS group)
        const isModpackGroup = (sectionId === 'modpacks' || sectionId === 'modpack-gyzenn');

        desktopNavLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if ((isModpackGroup && href === '#modpacks') || href === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        bottomNavItems.forEach((item) => {
          const href = item.getAttribute('href');
          if ((isModpackGroup && href === '#modpacks') || href === `#${sectionId}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. Zalith Installer Progress Bar Viewport Animation
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 9. Modpack Gyzenn Data Structure & Dynamic Renderer
  // --------------------------------------------------------------------------
  function spawnNewReleaseParticles(element) {
    if (prefersReducedMotion || !element) return;
    const rect = element.getBoundingClientRect();
    const particleCount = 8;
    const colors = ['#FF2A85', '#FFD600', '#2563EB', '#A3E635', '#FF5722'];
    const shapes = ['★', '✦', '■', '▲', '+'];

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'v7-particle';
      p.textContent = shapes[i % shapes.length];
      p.style.color = colors[i % colors.length];
      p.style.left = `${rect.left + rect.width / 2}px`;
      p.style.top = `${rect.top + rect.height / 2}px`;
      p.style.transform = 'translate(-50%, -50%) scale(0)';
      p.style.opacity = '1';

      document.body.appendChild(p);

      const angle = (i / particleCount) * Math.PI * 2;
      const dist = Math.random() * 35 + 25;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.1)`;
        p.style.opacity = '0';
      });

      setTimeout(() => {
        p.remove();
      }, 650);
    }
  }

  const gyzennModpacks = [
    {
      id: "survival-v1",
      name: "GYZENN SURVIVAL V1",
      displayTitle: "GYZENN SURVIVAL V1",
      version: "V1",
      category: "SURVIVAL",
      minecraft: "1.21.11",
      loader: "Fabric",
      fabric: "0.19.5",
      fabricLoader: "0.19.5",
      modCount: "97 Mods",
      status: "RELEASED",
      description: "Modpack survival Minecraft 1.21.11 berbasis Fabric dengan kombinasi performance, visual enhancement, quality of life, utility, exploration, building, dan survival gameplay.",
      badges: ["NEW RELEASE", "SURVIVAL", "97 MODS"],
      note: null,
      noteType: "info",
      isNew: true,
      isRecommended: true,
      theme: "strip-yellow",
      image: "survival-v1.png",
      imageAlt: "Gyzenn Survival V1 Minecraft Modpack Cover",
      downloads: [
        {
          label: "DOWNLOAD MRPACK",
          url: "https://sfile.co/kz2S93BomE1",
          type: "mrpack"
        },
        {
          label: "DOWNLOAD ZIP",
          url: "https://www.mediafire.com/file/3top57qjgz2jhsb/Modpack+1.21.11+SURVIVAL+V1.zip/file",
          type: "mediafire"
        }
      ],
      mods: [
        "Accurate Block Placement Reborn",
        "Amber",
        "Ambient Sounds",
        "AppleSkin",
        "Bridging Mod",
        "C2ME",
        "Carry On",
        "Chat Animation",
        "Chunky",
        "Cloth Config",
        "Clumps",
        "Collective",
        "Common Networking",
        "Continuity",
        "Controlling",
        "CreativeCore",
        "Day Counter",
        "Durability Viewer",
        "Dynamic FPS",
        "Elytra Trails",
        "Emotecraft",
        "Entity Culling",
        "Entity Model Features",
        "Entity Texture Features",
        "Exordium",
        "Explosive Enhancement",
        "Fabric API",
        "Fabric Language Kotlin",
        "FallingTree",
        "FastQuit",
        "FerriteCore",
        "Forge Config API Port",
        "Freecam",
        "Fzzy Config",
        "Get It Together, Drops!",
        "HMI",
        "IdleTweaks",
        "Infinite Trading",
        "Inventory Profiles Next",
        "Jade",
        "JEI",
        "Jump Over Fences",
        "Krypton",
        "Ksyxis",
        "lib-5555ff",
        "libIPN",
        "libJF",
        "LiteMiner",
        "Lithium",
        "Loot Beams Refork",
        "MaLiLib",
        "Mezz Config",
        "MidnightLib",
        "Mine Frame Gen",
        "Mining & Placing Animations",
        "Mob Heads",
        "ModernFix",
        "Mod Menu",
        "More Culling",
        "Mouse Tweaks",
        "MRU",
        "Night Vision Toggle",
        "Nirvana Lib",
        "Noisium",
        "Nvidium",
        "OK Zoomer",
        "Placeholder API",
        "Player Animation Library",
        "Presence Footsteps",
        "Puzzle",
        "Reanimated",
        "Reese's Sodium Options",
        "RenderScale",
        "Resourcify",
        "Respackopts",
        "ScalableLux",
        "Searchables",
        "Shoulder Surfing",
        "3D Skin Layers",
        "Smooth GUI",
        "Sodium Extra",
        "Sodium",
        "Sound Physics Remastered",
        "Sounds",
        "Subtle Effects",
        "ThreadTweak",
        "Tool Trims",
        "Trade Cycling",
        "Veinminer",
        "View Model",
        "Visible Traders",
        "VMP",
        "Simple Voice Chat",
        "WorldEdit",
        "Xaero's Minimap",
        "Xaero's World Map",
        "Yet Another Config Lib (YACL)"
      ]
    },
    {
      id: "cobra-x-boom-remake",
      name: "Cobra x Boom Remake",
      version: "1.21.11",
      category: "SURVIVAL",
      minecraft: "1.21.11",
      loader: "Fabric",
      fabric: "0.19.5",
      fabricLoader: "0.19.5",
      description: "Cobra x Boom Remake adalah modpack Minecraft 1.21.11 berbasis Fabric yang menghadirkan kombinasi gameplay survival dengan berbagai mod tambahan untuk meningkatkan pengalaman bermain, eksplorasi, utility, dan kenyamanan gameplay.",
      badges: ["COBRA"],
      note: null,
      noteType: "info",
      isNew: true,
      isRecommended: false,
      theme: "strip-orange",
      image: "cobra-x-boom-remake.jpg",
      imageAlt: "Cobra x Boom Remake Minecraft Modpack",
      extraModsNote: "Beberapa mod tambahan dapat dihapus jika tidak diperlukan atau tidak sesuai dengan preferensi gameplay.",
      extraMods: [
        "Almanac",
        "Balm",
        "Better Advancements",
        "C2ME",
        "Chat Animation",
        "Cherished Worlds",
        "Click Mobs",
        "Collective",
        "Easy Elytra Takeoff",
        "EnchDesc",
        "Fast Chest",
        "Fast Trading",
        "Freecam",
        "Gamma Utils",
        "Infinite Trading",
        "Let Me Despawn",
        "LibJF",
        "Litematica Printer",
        "Mining and Placing Animations",
        "Nether Portal Fix",
        "No Resource Pack Warnings",
        "Owo Lib",
        "Prickle",
        "Respackopts",
        "Scalable Lux",
        "Shoulder Surfing",
        "ShulkerBox Tooltip",
        "Smelter The Hedgehog",
        "Sound Physics Remastered",
        "SquatGrow",
        "Stack Plus",
        "StackRefill",
        "Touch Controller",
        "TreeHarvester"
      ],
      downloads: [
        {
          label: "DOWNLOAD MRPACK",
          url: "https://www.mediafire.com/file/2gebh0zhznbfak0/Caboom_x_Cobra_Remake.mrpack/file",
          type: "mediafire"
        },
        {
          label: "DOWNLOAD ZIP",
          url: "https://www.mediafire.com/file/9yydc93x40avtiz/Caboom_x_Cobra_Remake.zip/file",
          type: "mediafire"
        }
      ]
    },
    {
      id: "quick-cpvp-26-3",
      name: "Quick CPVP 26.3",
      version: "26.3",
      category: "CPVP",
      minecraft: "26.3",
      loader: "Fabric",
      fabric: "0.19.5",
      fabricLoader: "0.19.5",
      description: "Modpack ringan untuk Minecraft 26.3 yang difokuskan untuk gameplay PvP/CPvP dengan optimasi performa agar pengalaman bermain terasa lebih ringan dan responsif.",
      badges: ["FPS BOOST"],
      note: "Pakai ini kalau kalian suka main PvP only. Fokus ke performa dan FPS.",
      noteType: "info",
      isNew: true,
      isRecommended: false,
      theme: "strip-blue",
      downloads: [
        {
          label: "DOWNLOAD MRPACK",
          url: "https://www.mediafire.com/file/e723973m3etjub1/Quick+CPVP+26.3.mrpack/file",
          type: "mediafire"
        },
        {
          label: "DOWNLOAD ZIP",
          url: "https://www.mediafire.com/file/4mrnm8wapiqrowx/Modpack+Quick+CPVP+26.3.zip/file",
          type: "mediafire"
        }
      ]
    },
    {
      id: "sodiumpack-v2",
      name: "Sodiumpack V2",
      version: "V2",
      category: "FPS BOOST",
      minecraft: "1.21.11",
      loader: "Fabric",
      fabric: "0.19.2",
      fabricLoader: "0.19.2",
      description: "Modpack Sodium generasi V2 dengan optimasi rendering engine untuk Minecraft 1.21.11 Fabric Loader 0.19.2. Menghasilkan frame rate tinggi dan gameplay ultra responsif.",
      badges: ["SODIUM"],
      note: null,
      isNew: true,
      isRecommended: true,
      theme: "strip-blue",
      downloads: [
        {
          label: "DOWNLOAD MRPACK",
          url: "https://drive.google.com/file/d/1Hu-6s98Qdj4E8VwHIfNXoRpiMOXg6nHJ/view?usp=sharing",
          type: "gdrive"
        },
        {
          label: "DOWNLOAD ZIP",
          url: "https://www.mediafire.com/file/1i425xdbe5ahybf/Sodiumpack+V2.zip/file",
          type: "mediafire"
        }
      ]
    },
    {
      id: "cobra-ultimize-remake",
      name: "Cobra Ultimize Remake",
      version: "Remake",
      category: "FPS BOOST",
      minecraft: "1.21.11",
      loader: "Fabric",
      fabric: "0.19.3",
      fabricLoader: "0.19.3",
      description: "Modpack Cobra Ultimize Remake edisi performa tinggi untuk Minecraft 1.21.11 Fabric 0.19.3. Menghadirkan stabilitas FPS optimal untuk PvP dan eksplorasi intensif.",
      badges: ["COBRA"],
      note: null,
      isNew: true,
      isRecommended: false,
      theme: "strip-orange",
      downloads: [
        {
          label: "DOWNLOAD MRPACK",
          url: "https://drive.google.com/file/d/1kigZd3mRxc-e3h2WWE94bfO7o6r5HAL8/view?usp=sharing",
          type: "gdrive"
        },
        {
          label: "DOWNLOAD ZIP",
          url: "https://drive.usercontent.google.com/download?id=1Gs3FuSEChQcHkugyA0eXnkiPen9MvLXn&export=download&authuser=0",
          type: "gdrive"
        },
        {
          label: "DOWNLOAD ZIP MEDIAFIRE",
          url: "https://www.mediafire.com/file/z8cv4570z7jnebg/Cobra+Ultimized+By+Gyzenn.zip/file",
          type: "mediafire"
        }
      ]
    },
    {
      id: "survival-x-fpsboost",
      name: "Survival X Fpsboost",
      version: "26.3",
      category: "SURVIVAL",
      minecraft: "26.3",
      loader: "Fabric",
      fabric: "0.19.5",
      fabricLoader: "0.19.5",
      description: "Paket modpack Survival lengkap berpadu optimasi FPS boost terbaru untuk Minecraft 26.3 Fabric Loader 0.19.5.",
      badges: ["FPS BOOST"],
      note: "Versi ZIP memiliki file mod Survival terpisah. Pasang file mod Survival tersebut hanya jika dibutuhkan. Jangan memasangnya jika tidak dibutuhkan.",
      noteType: "warning",
      isNew: true,
      isRecommended: false,
      theme: "strip-green",
      downloads: [
        {
          label: "DOWNLOAD MRPACK",
          url: "https://www.mediafire.com/file/5y5pvjgf15ghqh5/Modpack_26.3_Gyzenn.mrpack/file",
          type: "mediafire"
        },
        {
          label: "DOWNLOAD ZIP",
          url: "https://www.mediafire.com/file/34t9fn7oa0tn7nm/Modpack_26.3_Gyzenn.zip/file",
          type: "mediafire"
        }
      ]
    },
    {
      id: "fpsboost-v7",
      name: "Modpack FpsBoost V7",
      version: "V7",
      category: "FPS BOOST",
      minecraft: "1.21.1",
      loader: "Fabric",
      fabric: "0.19.3",
      fabricLoader: "0.19.3",
      description: "FpsBoost V7 is a performance-focused Fabric modpack for Minecraft 1.21.1, designed to improve FPS and provide a smoother gameplay experience.",
      badges: [],
      note: null,
      isNew: false,
      isRecommended: true,
      theme: "strip-v7-latest",
      mrpackUrl: "https://drive.google.com/file/d/1i7sWR6Dsy1BFLpPZspuUpe12DGm4IQwz/view?usp=sharing",
      zipUrl: "https://drive.google.com/file/d/1wn9KM-NFKQTvoBnGar3Q4s_N-ymRWFj/view?usp=sharing",
      downloadUrl: "https://drive.google.com/file/d/1i7sWR6Dsy1BFLpPZspuUpe12DGm4IQwz/view?usp=sharing"
    },
    {
      id: "fpsboost-v6",
      name: "Modpack FpsBoost V6",
      version: "V6",
      category: "FPS BOOST",
      minecraft: "26.2",
      loader: "Fabric",
      fabric: "0.19.3",
      fabricLoader: "0.19.3",
      badges: ["Resourcepack Included"],
      note: null,
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/1Bw3AgXkeX0qKYb191QuudxwoHvgP3FIP/view?usp=sharing"
    },
    {
      id: "fpsboost-v5",
      name: "Modpack FpsBoost V5",
      version: "V5",
      category: "FPS BOOST",
      minecraft: "1.21.11",
      loader: "Fabric",
      fabric: "0.19.3",
      fabricLoader: "0.19.3",
      badges: ["Resourcepack Included"],
      note: "Ada mod Flashback. Kalau tidak suka, mod tersebut bisa dihapus.",
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/1fFOHr8H7mli-qDYFDZWs9zbjxPNMCqUS/view?usp=sharing"
    },
    {
      id: "fpsboost-v4",
      name: "Modpack FpsBoost V4",
      version: "V4",
      category: "FPS BOOST",
      minecraft: "1.21.11",
      loader: "Fabric",
      fabric: "0.19.3",
      fabricLoader: "0.19.3",
      badges: ["Resourcepack Included"],
      note: null,
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/12loZ_FYc41HiogJwDwZXi0bggaXWgDtY/view?usp=sharing"
    },
    {
      id: "fpsboost-v3",
      name: "Modpack FpsBoost V3",
      version: "V3",
      category: "FPS BOOST",
      minecraft: "1.21",
      loader: "Fabric",
      fabric: "0.19.2",
      fabricLoader: "0.19.2",
      badges: [],
      note: null,
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/1Bt49_fwH8VNpVIM2bNAQ9-yl1GBQzwAU/view?usp=sharing"
    },
    {
      id: "survival-v1-legacy",
      name: "Modpack Survival V1 (Legacy 26.2)",
      version: "V1",
      category: "SURVIVAL",
      minecraft: "26.2",
      loader: "Fabric",
      fabric: "0.19.3",
      fabricLoader: "0.19.3",
      badges: ["130 Mods", "Resourcepack Included", "Shaders Included"],
      note: null,
      isNew: false,
      isRecommended: false,
      downloadUrl: "https://drive.google.com/file/d/1wlTff3EIipv1DAqdwfEt75UyLQABuC4f/view?usp=sharing"
    }
  ];

  function renderGyzennModpacks() {
    const container = document.getElementById('gyzennModpacksGrid');
    if (!container) return;

    const cardsHtml = gyzennModpacks.map((modpack, index) => {
      let badgeBannerHtml = '';

      if (modpack.isNew) {
        badgeBannerHtml += `<span class="tag-badge tag-release tag-new-pulse ${modpack.id === 'fpsboost-v7' ? 'badge-new-v7' : ''}"><i class="fa-solid fa-fire"></i> NEW</span> `;
      }
      if (modpack.version) {
        badgeBannerHtml += `<span class="tag-badge tag-version-pill">[${modpack.version}]</span> `;
      }
      if (modpack.isRecommended) {
        badgeBannerHtml += `<span class="tag-badge tag-mc-version"><i class="fa-solid fa-star"></i> RECOMMENDED</span> `;
      }

      if (modpack.category === 'FPS BOOST') {
        badgeBannerHtml += `<span class="tag-badge tag-shader"><i class="fa-solid fa-bolt"></i> FPS BOOST</span> `;
      } else if (modpack.category === 'SURVIVAL') {
        badgeBannerHtml += `<span class="tag-badge tag-fabric"><i class="fa-solid fa-campground"></i> SURVIVAL</span> `;
      } else if (modpack.category === 'CPVP' || modpack.category === 'PVP') {
        badgeBannerHtml += `<span class="tag-badge tag-shader cpvp-badge"><i class="fa-solid fa-crosshairs"></i> ${modpack.category}</span> `;
      }

      badgeBannerHtml += `<span class="tag-badge tag-mc-version">Minecraft ${modpack.minecraft}</span> `;
      badgeBannerHtml += `<span class="tag-badge tag-fabric">Fabric Loader ${modpack.fabricLoader || modpack.fabric}</span> `;

      if (Array.isArray(modpack.badges)) {
        modpack.badges.forEach(b => {
          if (b !== modpack.category) {
            badgeBannerHtml += `<span class="tag-badge tag-release">${b}</span> `;
          }
        });
      }

      const descHtml = modpack.description ? `
        <p class="modpack-editorial-desc">${modpack.description}</p>
      ` : '';

      // Expandable Extra Mods List (Collapsible Accordion/Details)
      let extraModsHtml = '';
      if (Array.isArray(modpack.extraMods) && modpack.extraMods.length > 0) {
        const modCount = modpack.extraMods.length;
        const modNote = modpack.extraModsNote || 'Beberapa mod tambahan dapat dihapus jika tidak diperlukan atau tidak sesuai dengan preferensi gameplay.';
        extraModsHtml = `
          <details class="modpack-extra-mods-details">
            <summary class="modpack-extra-mods-summary">
              <span class="summary-title"><i class="fa-solid fa-boxes-stacked"></i> + MOD TAMBAHAN (${modCount} MOD)</span>
              <span class="summary-hint">BUKA DAFTAR <i class="fa-solid fa-chevron-down summary-arrow"></i></span>
            </summary>
            <div class="extra-mods-content">
              <p class="extra-mods-notice">
                <i class="fa-solid fa-circle-info"></i> ${modNote}
              </p>
              <div class="extra-mods-chips">
                ${modpack.extraMods.map(m => `<span class="extra-mod-tag">${m}</span>`).join('')}
              </div>
            </div>
          </details>
        `;
      }

      // Collapsible Complete Mod List with Search (e.g. for Survival V1 with 97 mods)
      let modsListHtml = '';
      if (Array.isArray(modpack.mods) && modpack.mods.length > 0) {
        const totalMods = modpack.mods.length;
        modsListHtml = `
          <div class="modpack-collapsible-wrapper" data-modpack-id="${modpack.id}">
            <div class="collapsible-header-card" role="button" tabindex="0" aria-expanded="false" aria-controls="modlist-body-${modpack.id}">
              <div class="collapsible-title-col">
                <div class="collapsible-badge-wrap">
                  <span class="summary-title"><i class="fa-solid fa-boxes-stacked"></i> MOD LIST</span>
                  <span class="tag-badge tag-release">${totalMods} MODS</span>
                </div>
                <p class="collapsible-subtext">Complete list of included mods</p>
              </div>
              <div class="collapsible-action-col">
                <button type="button" class="btn-toggle-modlist" aria-expanded="false" aria-controls="modlist-body-${modpack.id}" aria-label="Toggle Mod List ${modpack.name}">
                  <span class="toggle-icon"><i class="fa-solid fa-plus"></i></span>
                  <span class="toggle-text">VIEW MOD LIST</span>
                </button>
              </div>
            </div>

            <div class="collapsible-body-card" id="modlist-body-${modpack.id}" style="display: none;" aria-hidden="true">
              <div class="modlist-search-toolbar">
                <div class="modlist-search-box">
                  <i class="fa-solid fa-magnifying-glass mod-search-icon" aria-hidden="true"></i>
                  <input type="text" class="mod-inline-search" placeholder="Search mods (e.g. Sodium, Xaero)..." aria-label="Search mods in ${modpack.name}">
                  <button type="button" class="btn-clear-inline-search" style="display:none;" aria-label="Clear search"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modlist-counter-status">
                  Showing: <strong class="counter-num">${totalMods}</strong> / ${totalMods} mods
                </div>
              </div>

              <div class="modlist-items-grid">
                ${modpack.mods.map((modName, idx) => {
                  const numStr = String(idx + 1).padStart(2, '0');
                  return `
                    <div class="modlist-item" data-num="${idx + 1}" data-num-str="${numStr}" data-name="${modName.toLowerCase()}">
                      <span class="modlist-num">${numStr}</span>
                      <span class="modlist-name">${modName}</span>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="modlist-no-results" style="display: none;">
                <i class="fa-solid fa-circle-question"></i> No mods found.
              </div>
            </div>
          </div>
        `;
      }

      let noteHtml = '';
      if (modpack.note) {
        const isWarning = modpack.noteType === 'warning';
        const noteIcon = isWarning ? 'fa-triangle-exclamation' : 'fa-circle-info';
        const noteTitle = isWarning ? 'CATATAN PENTING' : 'INFO TAMBAHAN';
        const noteClass = isWarning ? 'modpack-note-callout note-warning' : 'modpack-note-callout';
        noteHtml = `
          <div class="${noteClass}">
            <div class="modpack-note-header">
              <i class="fa-solid ${noteIcon}"></i>
              <span>${noteTitle}</span>
            </div>
            <p class="modpack-note-text">${modpack.note}</p>
          </div>
        `;
      }

      let downloadActionHtml = '';
      if (Array.isArray(modpack.downloads) && modpack.downloads.length > 0) {
        const isStack = modpack.downloads.length >= 3;
        downloadActionHtml = `
          <div class="modpack-download-group ${isStack ? 'modpack-download-stack' : ''}">
            ${modpack.downloads.map(dl => {
              const isMediafire = dl.type === 'mediafire';
              const isMrpack = dl.type === 'mrpack';
              const iconClass = isMediafire ? 'fa-solid fa-cloud-arrow-down' : (isMrpack ? 'fa-solid fa-download' : 'fa-brands fa-google-drive');
              const btnClass = isMediafire ? 'btn-mediafire-subtle' : (isMrpack ? 'btn-primary' : 'btn-gdrive-subtle');
              return `
                <a href="${dl.url}" target="_blank" rel="noopener noreferrer" class="btn ${btnClass} btn-download-action" aria-label="${dl.label} ${modpack.name}">
                  <i class="${iconClass}"></i> ${dl.label}
                </a>
              `;
            }).join('')}
          </div>
        `;
      } else if (modpack.mrpackUrl && modpack.zipUrl) {
        downloadActionHtml = `
          <div class="modpack-download-group">
            <a href="${modpack.mrpackUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gdrive-subtle btn-download-dual" aria-label="Download ${modpack.name} MRPACK">
              <i class="fa-brands fa-google-drive"></i> MRPACK
            </a>
            <a href="${modpack.zipUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-download-dual btn-download-zip" aria-label="Download ${modpack.name} ZIP">
              <i class="fa-brands fa-google-drive"></i> ZIP
            </a>
          </div>
        `;
      } else {
        downloadActionHtml = `
          <a href="${modpack.downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gdrive-subtle" style="width: 100%;">
            <i class="fa-brands fa-google-drive"></i> DOWNLOAD MODPACK
          </a>
        `;
      }

      let stripTheme = modpack.theme || 'strip-orange';
      if (!modpack.theme) {
        if (modpack.id === 'fpsboost-v7') {
          stripTheme = 'strip-v7-latest';
        } else if (index % 2 === 0) {
          stripTheme = 'strip-yellow';
        }
      }

      const versionStampClass = (modpack.id === 'fpsboost-v7') ? 'version-stamp version-stamp-v7' : 'version-stamp';
      const versionStampText = modpack.version ? `[${modpack.version}] MC ${modpack.minecraft}` : `MC ${modpack.minecraft}`;

      // Cover image support with lazy loading & fallback
      let coverImageHtml = '';
      if (modpack.image) {
        const altText = modpack.imageAlt || `${modpack.name} Minecraft Modpack`;
        coverImageHtml = `
          <div class="modpack-cover-frame">
            <img src="${modpack.image}" 
                 alt="${altText}" 
                 class="modpack-cover-img" 
                 loading="lazy" 
                 onerror="this.onerror=null; this.closest('.modpack-cover-frame').classList.add('img-load-failed');">
            <div class="modpack-cover-badge-tag">
              <span class="cover-tag"><i class="fa-solid fa-gamepad"></i> ${modpack.name}</span>
            </div>
          </div>
        `;
      }

      const hasCoverClass = modpack.image ? 'has-cover-image' : '';

      return `
        <div class="modpack-editorial-strip ${stripTheme} ${hasCoverClass}" id="${modpack.id}" data-index="${index}" data-category="${modpack.category}">
          ${coverImageHtml}
          <div class="strip-header-col">
            <span class="${versionStampClass}">${versionStampText}</span>
            <div style="margin-top: 0.4rem;">
              ${badgeBannerHtml}
            </div>
          </div>
          <div class="strip-body-col">
            <h3>${modpack.name}</h3>
            ${descHtml}
            ${extraModsHtml}
            ${modsListHtml}
            ${noteHtml}
          </div>
          <div class="strip-action-col">
            ${downloadActionHtml}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHtml;

    // Interactive Handlers for Collapsible Mod Lists with Real-time Search
    document.querySelectorAll('.modpack-collapsible-wrapper').forEach(wrapper => {
      const toggleBtn = wrapper.querySelector('.btn-toggle-modlist');
      const headerCard = wrapper.querySelector('.collapsible-header-card');
      const bodyCard = wrapper.querySelector('.collapsible-body-card');
      const searchInput = wrapper.querySelector('.mod-inline-search');
      const clearBtn = wrapper.querySelector('.btn-clear-inline-search');
      const counterEl = wrapper.querySelector('.counter-num');
      const items = wrapper.querySelectorAll('.modlist-item');
      const noResults = wrapper.querySelector('.modlist-no-results');
      const toggleText = wrapper.querySelector('.toggle-text');
      const toggleIcon = wrapper.querySelector('.toggle-icon');

      const totalCount = items.length;

      function resetSearch() {
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        items.forEach(item => { item.style.display = 'flex'; });
        if (counterEl) counterEl.textContent = totalCount;
        if (noResults) noResults.style.display = 'none';
      }

      function toggleOpen(forceState) {
        const isCurrentlyOpen = bodyCard && bodyCard.style.display !== 'none';
        const willOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

        if (willOpen) {
          if (bodyCard) {
            bodyCard.style.display = 'block';
            bodyCard.setAttribute('aria-hidden', 'false');
          }
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
          if (headerCard) headerCard.setAttribute('aria-expanded', 'true');
          if (toggleText) toggleText.textContent = 'HIDE MOD LIST';
          if (toggleIcon) toggleIcon.innerHTML = '<i class="fa-solid fa-minus"></i>';
        } else {
          if (bodyCard) {
            bodyCard.style.display = 'none';
            bodyCard.setAttribute('aria-hidden', 'true');
          }
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
          if (headerCard) headerCard.setAttribute('aria-expanded', 'false');
          if (toggleText) toggleText.textContent = 'VIEW MOD LIST';
          if (toggleIcon) toggleIcon.innerHTML = '<i class="fa-solid fa-plus"></i>';
          resetSearch();
        }
      }

      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleOpen();
        });
      }

      if (headerCard) {
        headerCard.addEventListener('click', () => {
          toggleOpen();
        });
        headerCard.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.trim().toLowerCase();
          if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

          let visible = 0;
          items.forEach(item => {
            const name = item.getAttribute('data-name') || '';
            const num = item.getAttribute('data-num-str') || '';
            if (!q || name.includes(q) || num.includes(q)) {
              item.style.display = 'flex';
              visible++;
            } else {
              item.style.display = 'none';
            }
          });

          if (counterEl) counterEl.textContent = visible;
          if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          resetSearch();
          searchInput.focus();
        });
      }
    });

    // Observe all new release cards for particle burst
    const newCards = document.querySelectorAll('.section-gyzenn-modpacks .tag-new-pulse');
    if (newCards.length && 'IntersectionObserver' in window) {
      const newObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            spawnNewReleaseParticles(entry.target);
            newObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      newCards.forEach((badge) => newObserver.observe(badge));
    }

    // GSAP ScrollTrigger Entrance Animation for Strips
    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
      gsap.utils.toArray('.section-gyzenn-modpacks .modpack-editorial-strip').forEach((strip) => {
        gsap.from(strip, {
          scrollTrigger: { trigger: strip, start: 'top 90%' },
          duration: 0.55,
          y: 20,
          opacity: 0,
          ease: 'power2.out'
        });
      });
    }
  }

  renderGyzennModpacks();

  // --------------------------------------------------------------------------
  // 10. Interactive Gaming Mode Toggle
  // --------------------------------------------------------------------------
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

      showToast(`Gaming Mode: ${isGamingMode ? 'ON (Bold Shadow Glow)' : 'OFF (Standard Mode)'}`);
    });
  }

  // --------------------------------------------------------------------------
  // 11. Saweria Support Campaign (Micro Particle Burst & Editorial Entrance)
  // --------------------------------------------------------------------------
  function createRetroBurst(element, options = {}) {
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

  // Attach micro-burst to Saweria CTA buttons
  const saweriaBurstBtns = document.querySelectorAll('.btn-saweria-burst');
  saweriaBurstBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      createRetroBurst(btn, { count: 8 });
    });
  });

  // GSAP Editorial ScrollTrigger Entrance for Support Campaign Section
  const supportSection = document.getElementById('support');
  if (supportSection && typeof gsap !== 'undefined' && !prefersReducedMotion) {
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
      .from('#support .support-meta-tags .tag-badge', { duration: 0.35, scale: 0.8, opacity: 0, stagger: 0.08, ease: 'back.out(2)' }, '-=0.15')
      .from('#support .saweria-editorial-poster', { duration: 0.6, y: 35, rotation: 6, opacity: 0, ease: 'back.out(1.5)' }, '-=0.35')
      .from('#support .support-sticker-physical', { duration: 0.45, scale: 0, rotation: -18, opacity: 0, ease: 'back.out(2.2)' }, '-=0.2')
      .from('#support .campaign-shape', { duration: 0.5, scale: 0, opacity: 0, stagger: 0.1, ease: 'power2.out' }, '-=0.3');
  }

  // --------------------------------------------------------------------------
  // 12. Global Dark Mode / Light Mode Theme Controller
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');

  function updateThemeUI(theme) {
    if (!themeToggle) return;
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', isDark);
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
      if (!localStorage.getItem('gyzenn-theme')) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }
});


