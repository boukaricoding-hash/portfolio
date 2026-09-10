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

// ===== Remplissage des jauges de compétence =====
document.querySelectorAll('.skill__jauge').forEach(jauge => {
  const niveau = parseInt(jauge.dataset.niveau, 10) || 0;
  const points = jauge.querySelectorAll('i');
  points.forEach((point, i) => {
    if (i < niveau) point.classList.add('actif');
  });
});

// ===== Apparition orchestrée, calée sur le tracé lumineux =====
// La ligne se dessine puis "allume" un noeud au-dessus de chaque colonne ;
// chaque colonne et ses compétences se révèlent au passage de son noeud.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const entete = document.querySelector('.competences__entete');
const colonnes = document.querySelectorAll('.competences__colonne');

const DELAI_NOEUDS = [300, 700, 1100, 1500]; // ms, synchronisé avec .trace__noeud dans le CSS

if (entete) entete.style.transitionDelay = prefersReducedMotion ? '0ms' : '0ms';

colonnes.forEach((colonne, colIndex) => {
  const delaiColonne = prefersReducedMotion ? 0 : (DELAI_NOEUDS[colIndex] ?? 300 + colIndex * 400);
  colonne.style.transitionDelay = delaiColonne + 'ms';

  const lignes = colonne.querySelectorAll('.skill-row');
  lignes.forEach((ligne, rowIndex) => {
    const delaiLigne = prefersReducedMotion ? 0 : delaiColonne + 150 + rowIndex * 60;
    ligne.style.transitionDelay = delaiLigne + 'ms';
  });
});

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    if (entete) entete.classList.add('visible');
    colonnes.forEach(el => el.classList.add('visible'));
    document.querySelectorAll('.skill-row').forEach(el => el.classList.add('visible'));
  });
});

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