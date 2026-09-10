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

// ===== Aides génériques pour un fondu propre entre deux images =====

// Une image peut finir de charger avant que ce script n'attache son
// écouteur (cache navigateur) : dans ce cas "load" ne se déclenche jamais.
// On vérifie donc "complete" en plus d'écouter "load".
function fadeInWhenReady(img) {
  if (img.complete && img.naturalWidth > 0) {
    requestAnimationFrame(() => img.classList.add('loaded'));
  } else {
    img.addEventListener('load', () => {
      requestAnimationFrame(() => img.classList.add('loaded'));
    }, { once: true });
  }
}

// Change la source d'une image en douceur : on attend la fin du
// fondu de sortie (via l'évènement transitionend, avec un filet de
// sécurité) avant de changer le "src", puis on refait le fondu d'entrée.
// "onSwap" sert aussi à resynchroniser un fond flouté au moment exact
// où la nouvelle image prend la place de l'ancienne.
function crossfadeImage(imgEl, newSrc, newAlt, onSwap) {
  const doSwap = () => {
    imgEl.src = newSrc;
    if (newAlt !== undefined) imgEl.alt = newAlt;
    if (onSwap) onSwap();
    fadeInWhenReady(imgEl);
  };

  if (!imgEl.classList.contains('loaded')) {
    doSwap();
    return;
  }

  let swapped = false;
  function onEnd(e) {
    if (e.target !== imgEl || e.propertyName !== 'opacity') return;
    if (swapped) return;
    swapped = true;
    imgEl.removeEventListener('transitionend', onEnd);
    doSwap();
  }

  imgEl.addEventListener('transitionend', onEnd);
  imgEl.classList.remove('loaded');

  // Filet de sécurité si transitionend ne se déclenche pas
  // (onglet en arrière-plan, etc.)
  window.setTimeout(() => {
    if (swapped) return;
    swapped = true;
    imgEl.removeEventListener('transitionend', onEnd);
    doSwap();
  }, 420);
}

// ===== WiFi Togo : les miniatures remplacent la vidéo dans le même cadre =====
const slotVideo = document.getElementById('slotVideo');
const slotImage = document.getElementById('slotImage');
const phoneImage = document.getElementById('phoneImage');
const phoneImageBg = document.getElementById('phoneImageBg');
const phoneBack = document.getElementById('phoneBack');
const phoneExpand = document.getElementById('phoneExpand');
const projetVideo = document.getElementById('projetVideo');
const videoFullscreen = document.getElementById('videoFullscreen');
const wifiThumbs = document.querySelectorAll('#wifiThumbs img');

function showWifiImage(thumb) {
  // Le fond flouté est mis à jour exactement au moment où l'image
  // nette change, pour que les deux restent toujours synchronisés.
  crossfadeImage(phoneImage, thumb.src, thumb.alt, () => {
    phoneImageBg.style.backgroundImage = `url("${thumb.src}")`;
  });

  slotVideo.classList.remove('active');
  slotImage.classList.add('active');
  if (!projetVideo.paused) projetVideo.pause();

  wifiThumbs.forEach(t => t.setAttribute('data-active', String(t === thumb)));
}

function showWifiVideo() {
  slotImage.classList.remove('active');
  slotVideo.classList.add('active');
  wifiThumbs.forEach(t => t.setAttribute('data-active', 'false'));
}

wifiThumbs.forEach(thumb => {
  thumb.addEventListener('click', () => showWifiImage(thumb));
});

phoneBack.addEventListener('click', showWifiVideo);
phoneImage.addEventListener('click', showWifiVideo);

// Plein écran natif pour la vidéo (surtout utile en mobile, où la
// vidéo peut ainsi occuper tout l'écran au lieu de rester dans le
// petit cadre du téléphone).
videoFullscreen.addEventListener('click', (e) => {
  e.stopPropagation();
  if (projetVideo.requestFullscreen) {
    projetVideo.requestFullscreen().catch(() => {});
  } else if (projetVideo.webkitEnterFullscreen) {
    // Safari iOS : plein écran natif du lecteur vidéo
    projetVideo.webkitEnterFullscreen();
  } else if (projetVideo.webkitRequestFullscreen) {
    projetVideo.webkitRequestFullscreen();
  }
});

// Loupe : agrandit la capture actuellement affichée dans le
// téléphone, dans la vue en grand partagée avec les projets BTS.
phoneExpand.addEventListener('click', (e) => {
  e.stopPropagation();
  const thumbsArray = Array.from(wifiThumbs);
  const activeThumb = thumbsArray.find(t => t.getAttribute('data-active') === 'true');
  const gallery = thumbsArray.map(t => ({ src: t.src, alt: t.alt }));
  const startIndex = activeThumb ? thumbsArray.indexOf(activeThumb) : 0;
  openLightbox(gallery, 'WiFi Togo', startIndex);
});

// ===== Projets BTS : une carte, un carrousel horizontal entre les projets =====
const btsShowcase = document.getElementById('btsShowcase');
const btsTrack = document.getElementById('btsTrack');
const btsSlides = document.querySelectorAll('.bts-slide');
const btsDots = document.querySelectorAll('.bts-dot');
const btsPrev = document.getElementById('btsPrev');
const btsNext = document.getElementById('btsNext');

let btsIndex = 0;

function goToBtsSlide(index) {
  btsIndex = (index + btsSlides.length) % btsSlides.length;
  btsTrack.style.transform = `translateX(-${btsIndex * 100}%)`;
  btsDots.forEach((dot, i) => dot.classList.toggle('active', i === btsIndex));
}

btsDots.forEach((dot, i) => dot.addEventListener('click', () => goToBtsSlide(i)));

btsPrev.addEventListener('click', () => goToBtsSlide(btsIndex - 1));
btsNext.addEventListener('click', () => goToBtsSlide(btsIndex + 1));
// Glissement au doigt pour changer de projet (les flèches ont été
// retirées au profit des points ci-dessous)
let btsTouchStartX = null;
btsShowcase.addEventListener('touchstart', (e) => {
  btsTouchStartX = e.touches[0].clientX;
}, { passive: true });

btsShowcase.addEventListener('touchend', (e) => {
  if (btsTouchStartX === null) return;
  const delta = e.changedTouches[0].clientX - btsTouchStartX;
  if (Math.abs(delta) > 40) goToBtsSlide(btsIndex + (delta > 0 ? -1 : 1));
  btsTouchStartX = null;
}, { passive: true });

document.addEventListener('keydown', (e) => {
  if (document.getElementById('lightbox').classList.contains('actif')) return;
  const rect = btsShowcase.getBoundingClientRect();
  const inView = rect.top < window.innerHeight && rect.bottom > 0;
  if (!inView) return;
  if (e.key === 'ArrowLeft') goToBtsSlide(btsIndex - 1);
  if (e.key === 'ArrowRight') goToBtsSlide(btsIndex + 1);
});

// Chaque projet peut avoir plusieurs images : les petites vignettes
// en haut à droite changent l'image affichée dans la carte, en fondu
// synchronisé (image nette "contain" + fond flouté qui remplit tout
// l'espace, pour ne jamais couper l'écran d'application).
btsSlides.forEach(slide => {
  const mainImg = slide.querySelector('.bts-slide__img');
  const bgEl = slide.querySelector('.bts-slide__bg');
  const thumbs = slide.querySelectorAll('.bts-slide__thumbs img');

  bgEl.style.backgroundImage = `url("${mainImg.getAttribute('src')}")`;
  fadeInWhenReady(mainImg);

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      if (thumb.getAttribute('data-active') === 'true') return;

      crossfadeImage(mainImg, thumb.src, thumb.alt, () => {
        bgEl.style.backgroundImage = `url("${thumb.src}")`;
      });

      thumbs.forEach(t => t.setAttribute('data-active', String(t === thumb)));
    });
  });
});

// ===== Vue en grand : partagée entre le téléphone WiFi Togo et les
// loupes des projets BTS. Chaque appel fournit sa propre galerie
// (liste de {src, alt}) et son titre. =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lbBg = document.getElementById('lbBg');
const lbCaption = document.getElementById('lbCaption');
const lbCounter = document.getElementById('lbCounter');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
const lbClose = document.getElementById('lbClose');
const lbRotate = document.getElementById('lbRotate');
const lbStage = document.getElementById('lbStage');

let lbGallery = [];
let lbTitle = '';
let lbIndex = 0;
let lbRotated = false;

function setLbRotated(state) {
  lbRotated = state;
  lightboxImg.classList.toggle('is-rotated', lbRotated);
  lbRotate.classList.toggle('active', lbRotated);
}

function renderLightbox() {
  const item = lbGallery[lbIndex];
  const src = typeof item === 'string' ? item : item.src;
  const alt = (typeof item === 'object' && item.alt) ? item.alt : `${lbTitle} — capture ${lbIndex + 1}`;

  crossfadeImage(lightboxImg, src, alt, () => {
    lbBg.style.backgroundImage = `url("${src}")`;
  });

  lbCaption.textContent = lbTitle;
  lbCounter.textContent = lbGallery.length > 1
    ? `${lbIndex + 1} / ${lbGallery.length}`
    : '';

  const multi = lbGallery.length > 1;
  lbPrev.hidden = !multi;
  lbNext.hidden = !multi;
}

// gallery : tableau de chaînes (src) ou d'objets {src, alt}
function openLightbox(gallery, title, startIndex) {
  lbGallery = gallery;
  lbTitle = title;
  lbIndex = startIndex || 0;
  setLbRotated(false);
  renderLightbox();
  lightbox.classList.add('actif');
}

function openLightboxForSlide(slide) {
  const gallery = slide.dataset.images.split(',').map(s => s.trim()).filter(Boolean);
  const title = slide.querySelector('.bts-slide__info h3').textContent;
  openLightbox(gallery, title, 0);
}

function closeLightbox() {
  lightbox.classList.remove('actif');
  setLbRotated(false);
}

function stepLightbox(delta) {
  if (lbGallery.length < 2) return;
  lbIndex = (lbIndex + delta + lbGallery.length) % lbGallery.length;
  renderLightbox();
}

document.querySelectorAll('.bts-slide__expand').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightboxForSlide(btn.closest('.bts-slide'));
  });
});

lbClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeLightbox();
});
lbRotate.addEventListener('click', (e) => {
  e.stopPropagation();
  setLbRotated(!lbRotated);
});
lbPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  stepLightbox(-1);
});
lbNext.addEventListener('click', (e) => {
  e.stopPropagation();
  stepLightbox(1);
});

// Ferme uniquement si on clique vraiment sur le fond sombre,
// jamais sur un bouton (précédent/suivant/fermer/pivoter) ou sur l'image.
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('actif')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
  if (e.key.toLowerCase() === 'r') setLbRotated(!lbRotated);
});

let lbTouchStartX = null;
lbStage.addEventListener('touchstart', (e) => {
  lbTouchStartX = e.touches[0].clientX;
}, { passive: true });

lbStage.addEventListener('touchend', (e) => {
  if (lbTouchStartX === null) return;
  const delta = e.changedTouches[0].clientX - lbTouchStartX;
  if (Math.abs(delta) > 40) stepLightbox(delta > 0 ? -1 : 1);
  lbTouchStartX = null;
}, { passive: true });

// ===== Apparition douce au scroll (surtout utile sur mobile) =====
// Les points de défilement BTS ne sont volontairement PAS inclus ici :
// ce sont des contrôles de navigation essentiels, ils doivent être
// visibles immédiatement, jamais dépendants d'un déclenchement de scroll.
const revealTargets = document.querySelectorAll(
  '.projet-vedette__media, .projet-vedette__texte, .projets-bts__entete, .bts-showcase'
);

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 6) * 60 + 'ms';
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// ===== Curseur en anneau + traînée de particules =====
// (l'inclinaison de la carte BTS au survol de la souris a été retirée :
// la carte ne bouge plus tant qu'on ne clique pas dessus)
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const canvas = document.getElementById('particle-canvas');
const cursorRing = document.getElementById('cursor-ring');

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