// ===== Menu burger (mobile) =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

function setNavOpen(open) {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.innerHTML = open
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
}

navToggle.setAttribute('aria-expanded', 'false');
navToggle.setAttribute('aria-controls', 'nav-links');

navToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  setNavOpen(!navLinks.classList.contains('open'));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setNavOpen(false));
});

document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)) {
    setNavOpen(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    setNavOpen(false);
  }
});

// ===== Apparition douce du parcours et des valeurs au scroll =====
const revealTargets = document.querySelectorAll('.timeline-item, .valeur-item');

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 4) * 70 + 'ms';
});

if (revealTargets.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));
}

// ===== Curseur en anneau + traînée de particules =====
const canvas = document.getElementById('particle-canvas');
const cursorRing = document.getElementById('cursor-ring');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

if (canvas && cursorRing) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle(x, y) {
    particles.push({
      x, y,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
      life: 1
    });
  }

  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    createParticle(e.clientX, e.clientY);
  }

  function handleHoverStart() {
    cursorRing.classList.add('hovering');
  }

  function handleHoverEnd() {
    cursorRing.classList.remove('hovering');
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= 0.025;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.8})`;
      ctx.fill();
    }

    if (particles.length > 200) {
      particles = particles.slice(-200);
    }

    animationId = requestAnimationFrame(animate);
  }

  function startCursorEffect() {
    if (animationId !== null) return;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', handleMouseMove);
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });
    animate();
  }

  function stopCursorEffect() {
    if (animationId === null) return;
    cancelAnimationFrame(animationId);
    animationId = null;
    window.removeEventListener('resize', resizeCanvas);
    document.removeEventListener('mousemove', handleMouseMove);
    document.querySelectorAll('a, button').forEach(el => {
      el.removeEventListener('mouseenter', handleHoverStart);
      el.removeEventListener('mouseleave', handleHoverEnd);
    });
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function syncCursorEffect() {
    if (finePointerQuery.matches) {
      startCursorEffect();
    } else {
      stopCursorEffect();
    }
  }

  syncCursorEffect();
  finePointerQuery.addEventListener('change', syncCursorEffect);
}