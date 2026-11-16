/**
 * CREATIVE VISUAL COMMUNICATION PORTFOLIO ENGINE
 * Inspired by Rohith Manikkoth (2.5D Multi-Plane Parallax, Dot-Matrix, Neo-Brutalism)
 * & Spencer Gabor (Awwwards SOTD Bouncy Elastic Physics, Curved Carousel, Radial Themes)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSitePreloader();
  initCursor();
  initSmartNav();
  initStickerPhysics();
  initCurvedCarousel();
  initCardDecks();
  initThemeEngine();
  initCaseStudyModal();
  initGiantFooter();
  initSoundEngine();
  initLiveClock();
  initBirthdayClock();
});

/* ==========================================================================
   0. SITE PRELOADER & ANIMATED ARTIST LOGO (Clean White Background)
   ========================================================================== */
function initSitePreloader() {
  const loader = document.getElementById('siteLoader');
  if (!loader) return;

  let isDismissed = false;
  let autoTimer = null;

  function dismissLoader() {
    if (isDismissed) return;
    isDismissed = true;
    if (autoTimer) clearTimeout(autoTimer);

    try {
      playThemeChime?.();
    } catch (e) { }

    loader.classList.add('dismissed');
    document.documentElement.classList.remove('loading-locked');
    document.body.classList.remove('loading-locked');

    setTimeout(() => {
      loader.style.display = 'none';
    }, 700);
  }

  // Prevent background scroll while loader is visible
  document.documentElement.classList.add('loading-locked');
  document.body.classList.add('loading-locked');

  // Automatic dismiss timer aligned to complete risograph logo animation cycle (~2.3s)
  autoTimer = setTimeout(dismissLoader, 2300);

  // Fast skip: click/tap anywhere or press Escape / Space / Enter
  loader.addEventListener('click', () => {
    dismissLoader();
  });

  window.addEventListener('keydown', (e) => {
    if (!isDismissed && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) {
      dismissLoader();
    }
  });

  // Expose replay function for debugging or manual trigger
  window.replayLoaderAnimation = function () {
    isDismissed = false;
    if (autoTimer) clearTimeout(autoTimer);
    loader.style.display = 'flex';
    // Force reflow for restart
    void loader.offsetWidth;
    loader.classList.remove('dismissed');
    document.documentElement.classList.add('loading-locked');
    document.body.classList.add('loading-locked');
    autoTimer = setTimeout(dismissLoader, 3800);
  };
}

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const fineHoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

/**
 * Shared accessible activator for interactive card and deck elements.
 * Supports click, Enter/Space keyboard activation, and optional drag suppression.
 */
function bindInteractiveActivation(element, label, onActivate, shouldSuppressClick) {
  if (!element) return;
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');
  if (!element.hasAttribute('role')) element.setAttribute('role', 'button');
  if (!element.hasAttribute('aria-haspopup')) element.setAttribute('aria-haspopup', 'dialog');
  if (label && !element.hasAttribute('aria-label')) {
    element.setAttribute('aria-label', `${label} — Open case study`);
  }

  element.addEventListener('click', (e) => {
    if (shouldSuppressClick && shouldSuppressClick(e)) return;
    onActivate(e);
  });

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate(e);
    }
  });
}

/* ==========================================================================
   1. CUSTOM MAGNETIC & ELASTIC CURSOR
   ========================================================================== */
function initCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor || !fineHoverQuery.matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  // Hide custom cursor dynamically if user switches to touch on hybrid devices (e.g. iPad / Surface)
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      cursor.style.opacity = '0';
    } else {
      cursor.style.opacity = '1';
    }
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1';
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Smooth GPU transform lerp loop (Zero layout reflow)
  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.22;
    cursorY += (mouseY - cursorY) * 0.22;
    cursor.style.transform = `translate3d(${cursorX.toFixed(1)}px, ${cursorY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states on interactive elements (Event delegation for dynamic & cloned elements)
  const hoverTargets = 'a, button, .carousel-card, .deck-container, .sticker-badge, .swatch-btn, .footer-copy-email-pill, .artdir-text-wrap, .onair-sticker-wrap, .bomb-sticker-wrap, .notebook-sticker-wrap, .tv-sticker-chassis';
  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest(hoverTargets)) {
      cursor.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(hoverTargets)) {
      cursor.classList.remove('hovering');
    }
  });
}

/* ==========================================================================
   2. HERO 3D FLOATING STICKER CLUSTER (Rohith 2.5D Parallax + Spencer Elastic Inertia)
   ========================================================================== */
function initStickerPhysics() {
  const container = document.getElementById('stickerStageContainer');
  const stage = document.getElementById('stickerStage');
  const stickers = document.querySelectorAll('.sticker-item');
  if (!container || !stage || !stickers.length) return;

  if (reducedMotionQuery.matches) {
    stickers.forEach((sticker) => {
      const baseRot = parseFloat(sticker.getAttribute('data-base-rot') || '0');
      sticker.style.transform = `rotate(${baseRot}deg)`;
    });
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  const updatePointerRatio = (clientX, clientY, scale = 1) => {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const rawX = ((clientX - rect.left) / rect.width - 0.5) * scale;
    const rawY = ((clientY - rect.top) / rect.height - 0.5) * scale;
    mouseX = Math.max(-0.5, Math.min(0.5, rawX));
    mouseY = Math.max(-0.5, Math.min(0.5, rawY));
  };

  container.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    updatePointerRatio(e.clientX, e.clientY, 1);
  });

  container.addEventListener('pointerleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  // Touch support clamped safely inside container bounds
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updatePointerRatio(e.touches[0].clientX, e.touches[0].clientY, 1.25);
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    mouseX = 0;
    mouseY = 0;
  }, { passive: true });

  let floatTime = 0;
  let isHeroVisible = true;
  let heroAnimId = null;

  function updateStickers() {
    if (!isHeroVisible) {
      heroAnimId = null;
      return;
    }

    floatTime += 0.018;
    currentRotX += (-mouseY * 26 - currentRotX) * 0.1;
    currentRotY += (mouseX * 34 - currentRotY) * 0.1;

    stage.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;

    const compactViewport = window.innerWidth <= 600;
    const amplitude = compactViewport ? 0.55 : 1;

    stickers.forEach((sticker, i) => {
      const depth = parseFloat(sticker.getAttribute('data-depth') || '1');
      const baseRot = parseFloat(sticker.getAttribute('data-base-rot') || '0');
      const idleFloatY = Math.sin(floatTime + i * 1.25) * 8 * depth * amplitude;
      const idleFloatRot = Math.cos(floatTime + i * 0.95) * 1.5;

      const moveX = mouseX * 50 * depth * amplitude;
      const moveY = mouseY * 45 * depth * amplitude + idleFloatY;
      const tilt = mouseX * 15 * depth + idleFloatRot;

      const isPopped = sticker.classList.contains('is-popped');
      const popExtraZ = isPopped ? (compactViewport ? 70 : 100) : 0;
      const popExtraY = isPopped ? (compactViewport ? -8 : -14) : 0;
      const popScale = isPopped ? (compactViewport ? 1.12 : 1.16) : 1;

      sticker.style.transform = `translate3d(${moveX.toFixed(2)}px, ${(moveY + popExtraY).toFixed(2)}px, ${(depth * 40 + popExtraZ).toFixed(1)}px) rotate(${(baseRot + tilt).toFixed(2)}deg) scale(${popScale})`;
    });

    // Dynamic Cartoon Eyes Tracking Mouse Cursor / Autonomous Gaze
    const eyeLayer = document.querySelector('.cartoon-eyes-container');
    if (eyeLayer) {
      const isMobile = window.innerWidth <= 900;
      const maxEyeShift = isMobile ? 0.6 : 1.4;
      const eyeTrackingX = Math.max(-maxEyeShift, Math.min(maxEyeShift, mouseX * (isMobile ? 1.5 : 4) * amplitude)).toFixed(2);
      const eyeTrackingY = Math.max(-maxEyeShift, Math.min(maxEyeShift, mouseY * (isMobile ? 1.2 : 3) * amplitude)).toFixed(2);
      eyeLayer.style.setProperty('--mouse-eye-x', `${eyeTrackingX}px`);
      eyeLayer.style.setProperty('--mouse-eye-y', `${eyeTrackingY}px`);
    }

    heroAnimId = requestAnimationFrame(updateStickers);
  }

  // Interactive Design & Art Direction Card: Click / Tap to Pop Up Above
  const artDirCard = document.querySelector('.sticker-artdir-item');
  if (artDirCard) {
    artDirCard.setAttribute('role', 'button');
    artDirCard.setAttribute('tabindex', '0');
    artDirCard.setAttribute('aria-label', 'Design & Art Direction — Tap to pop up');

    const handlePopToggle = (e) => {
      e.stopPropagation();
      const willBePopped = !artDirCard.classList.contains('is-popped');
      artDirCard.classList.toggle('is-popped', willBePopped);
      if (willBePopped && typeof playTactileClick === 'function') {
        playTactileClick();
      }
    };

    artDirCard.addEventListener('click', handlePopToggle);
    artDirCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePopToggle(e);
      }
    });

    document.addEventListener('click', (e) => {
      if (artDirCard.classList.contains('is-popped') && !artDirCard.contains(e.target)) {
        artDirCard.classList.remove('is-popped');
      }
    });
  }

  // Smart Visibility Observer: Pause hero sticker loop when scrolled out of view to preserve 60/120fps scrolling
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && !heroAnimId) {
          heroAnimId = requestAnimationFrame(updateStickers);
        }
      });
    }, { threshold: 0.05 });
    heroObserver.observe(container);
  } else {
    heroAnimId = requestAnimationFrame(updateStickers);
  }
}

/* ==========================================================================
   3. CURVED ARC CAROUSEL (Infinite Continuous Swipe Engine + Spencer Gabor Radial Physics)
   ========================================================================== */
function initCurvedCarousel() {
  const viewport = document.getElementById('curvedCarouselViewport');
  const track = document.getElementById('curvedCarouselTrack');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  if (!viewport || !track) return;

  const originalCards = Array.from(track.querySelectorAll('.carousel-card'));
  const count = originalCards.length;
  if (!count) return;

  // Build a 5-set infinite buffer (2 sets before, central original set, 2 sets after -> 20 cards total)
  // Indices: 0..3 (Set -2), 4..7 (Set -1), 8..11 (Set 0 - base originals), 12..15 (Set +1), 16..19 (Set +2)
  const setsBefore = 2;
  const setsAfter = 2;

  // Prepend clones before original set
  for (let s = 0; s < setsBefore; s++) {
    for (let i = 0; i < count; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      clone.classList.add('is-clone');
      track.insertBefore(clone, originalCards[0]);
    }
  }

  // Append clones after original set
  for (let s = 0; s < setsAfter; s++) {
    for (let i = 0; i < count; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      clone.classList.add('is-clone');
      track.appendChild(clone);
    }
  }

  const allCards = Array.from(track.querySelectorAll('.carousel-card'));

  function getStepWidth() {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 24;
    return allCards[0].offsetWidth + gap;
  }

  let cachedStepWidth = getStepWidth();
  let cachedViewportWidth = viewport.offsetWidth;

  function refreshCarouselDimensions() {
    cachedStepWidth = getStepWidth();
    cachedViewportWidth = viewport.offsetWidth;
  }

  const baseIndex = setsBefore * count; // Index 8: Card 0 of the original set (Akkarakkavu)
  let baseTranslateX = -baseIndex * cachedStepWidth;
  let currentTranslateX = baseTranslateX;
  let targetTranslateX = baseTranslateX;

  let isPointerDown = false;
  let hasDragged = false;
  let suppressClickUntil = 0;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastTime = performance.now();
  let velocity = 0;

  // Infinite wrapping bounds: silently wraps coordinate space by cycleWidth without visual jump
  function wrapBounds() {
    const stepW = cachedStepWidth || getStepWidth();
    const cycleW = count * stepW;
    const halfCycle = cycleW * 0.5;

    while (targetTranslateX < baseTranslateX - halfCycle) {
      targetTranslateX += cycleW;
      currentTranslateX += cycleW;
    }
    while (targetTranslateX > baseTranslateX + halfCycle) {
      targetTranslateX -= cycleW;
      currentTranslateX -= cycleW;
    }
  }

  function snapToNearest(stepOffset = 0) {
    const stepW = cachedStepWidth || getStepWidth();
    const cycleW = count * stepW;
    const rel = targetTranslateX - baseTranslateX;
    let nearestStep = Math.round(rel / stepW) + stepOffset;
    targetTranslateX = baseTranslateX + nearestStep * stepW;
    while (targetTranslateX < baseTranslateX - cycleW * 0.5) {
      targetTranslateX += cycleW;
      currentTranslateX += cycleW;
    }
    while (targetTranslateX > baseTranslateX + cycleW * 0.5) {
      targetTranslateX -= cycleW;
      currentTranslateX -= cycleW;
    }
  }

  // Handle window resize dynamically without abrupt position jumps
  let lastStepW = cachedStepWidth;
  window.addEventListener('resize', () => {
    refreshCarouselDimensions();
    const newStepW = cachedStepWidth;
    if (newStepW && newStepW !== lastStepW) {
      const activeStep = Math.round((targetTranslateX - baseTranslateX) / lastStepW);
      baseTranslateX = -baseIndex * newStepW;
      targetTranslateX = baseTranslateX + activeStep * newStepW;
      currentTranslateX = targetTranslateX;
      lastStepW = newStepW;
      wrapBounds();
    }
  }, { passive: true });

  // Touch & Mouse Pointer Drag Swiping
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button && e.button !== 0) return;
    isPointerDown = true;
    hasDragged = false;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastTime = performance.now();
    velocity = 0;
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!hasDragged) {
      // If user is intentionally scrolling vertically, cancel drag and allow native page scroll
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        isPointerDown = false;
        return;
      }
      if (Math.abs(dx) > 7) {
        hasDragged = true;
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch (_) { }
        viewport.classList.add('is-dragging');
        document.getElementById('customCursor')?.classList.add('dragging');
      }
    }

    if (!hasDragged) return;

    const diff = e.clientX - lastX;
    targetTranslateX += diff;
    // Immediate physical feedback for high responsiveness
    currentTranslateX += diff * 0.75;

    const now = performance.now();
    const dt = now - lastTime || 16;
    velocity = diff / dt;
    lastX = e.clientX;
    lastTime = now;

    wrapBounds();
  });

  const endDrag = (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    viewport.classList.remove('is-dragging');
    document.getElementById('customCursor')?.classList.remove('dragging');

    if (hasDragged) {
      suppressClickUntil = Date.now() + 280;
      // Kinetic momentum glide based on fling velocity
      const flick = Math.max(-1.8, Math.min(1.8, velocity));
      targetTranslateX += flick * 220;
      snapToNearest();
    }

    if (e && e.pointerId !== undefined) {
      try {
        if (viewport.hasPointerCapture(e.pointerId)) {
          viewport.releasePointerCapture(e.pointerId);
        }
      } catch (_) { }
    }
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // Click suppression for cards during drag
  viewport._shouldSuppressClick = () => Date.now() < suppressClickUntil;

  // Prev / Next Navigation Buttons (Infinite stepping)
  prevBtn?.addEventListener('click', () => {
    playTactileClick();
    snapToNearest(1);
  });

  nextBtn?.addEventListener('click', () => {
    playTactileClick();
    snapToNearest(-1);
  });

  // Keyboard navigation (ArrowLeft / ArrowRight)
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      snapToNearest(1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      snapToNearest(-1);
    }
  });

  // Trackpad / Horizontal Wheel Support
  let wheelTimeout = null;
  viewport.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (Math.abs(delta) > 3) {
      e.preventDefault();
      targetTranslateX -= delta * 0.9;
      wrapBounds();
      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        snapToNearest();
      }, 140);
    }
  }, { passive: false });

  // 60/120 FPS Spencer Gabor Radial Curved Arc Render Loop
  let isCarouselVisible = true;
  let carouselAnimId = null;

  function renderCarousel() {
    if (!isCarouselVisible) {
      carouselAnimId = null;
      return;
    }

    wrapBounds();

    // Smooth elastic spring lerp
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.14;
    track.style.transform = `translate3d(${currentTranslateX.toFixed(2)}px, 0, 0)`;

    const viewportWidth = cachedViewportWidth || viewport.offsetWidth;
    const stepW = cachedStepWidth || getStepWidth();
    const isReduced = reducedMotionQuery.matches;
    const canHover = fineHoverQuery.matches;
    const isDragging = hasDragged || isPointerDown;
    const maxAngle = window.innerWidth <= 600 ? 8 : 14;
    const maxDip = window.innerWidth <= 600 ? 14 : 28;

    allCards.forEach((card, i) => {
      if (isReduced) {
        card.style.transform = '';
        card.style.zIndex = '';
        return;
      }
      // Exact physical distance from viewport center (Zero DOM layout reflows)
      const cardOffset = i * stepW + currentTranslateX;
      const distanceFromCenter = cardOffset / (viewportWidth * 0.5);

      const baseAngle = distanceFromCenter * maxAngle;
      const baseTranslateY = Math.pow(Math.abs(distanceFromCenter), 2) * maxDip;

      // Smooth magnetic hover interpolation per card (no abrupt snapping or rotation jumps)
      const isCardHovered = !isDragging && canHover && (card.matches(':hover') || card.matches(':focus-visible'));
      const targetHover = isCardHovered ? 1 : 0;

      if (card._hoverProgress === undefined) {
        card._hoverProgress = 0;
      }

      // Smooth lerp: 0.16 gives an ultra-smooth, responsive ~160ms ease-out glide
      card._hoverProgress += (targetHover - card._hoverProgress) * 0.16;
      if (Math.abs(targetHover - card._hoverProgress) < 0.001) {
        card._hoverProgress = targetHover;
      }

      const hp = card._hoverProgress;

      // Gentle elevation: lift up smoothly by up to 10px
      const liftY = hp * 10;
      // Gentle scale: up to 1.025 (refined, non-jarring breathing scale)
      const scale = 1 + hp * 0.025;
      // Gently soften the radial angle by 20% on hover while preserving the curve
      const angle = baseAngle * (1 - hp * 0.2);
      const translateY = baseTranslateY - liftY;

      card.style.transform = `rotate(${angle.toFixed(2)}deg) translateY(${translateY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      card.style.zIndex = hp > 0.02 ? '10' : '';
    });

    carouselAnimId = requestAnimationFrame(renderCarousel);
  }

  // IntersectionObserver: Pause carousel arc loop when scrolled away to ensure zero idle overhead
  if ('IntersectionObserver' in window) {
    const carouselObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isCarouselVisible = entry.isIntersecting;
        if (isCarouselVisible && !carouselAnimId) {
          refreshCarouselDimensions();
          carouselAnimId = requestAnimationFrame(renderCarousel);
        }
      });
    }, { threshold: 0.05 });
    carouselObserver.observe(viewport);
  } else {
    carouselAnimId = requestAnimationFrame(renderCarousel);
  }
}

/* ==========================================================================
   4. INTERACTIVE CARD DECKS (Spencer Gabor Stack Fan-Out Physics)
   ========================================================================== */
function initCardDecks() {
  const deckContainers = document.querySelectorAll('.deck-container');
  const viewport = document.getElementById('curvedCarouselViewport');

  deckContainers.forEach((deck) => {
    const layerBack = deck.querySelector('.card-deck__layer--back');
    const layerMid = deck.querySelector('.card-deck__layer--mid');
    const layerFront = deck.querySelector('.card-deck__layer--front');

    deck.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || reducedMotionQuery.matches) return;
      const rect = deck.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (layerBack && layerMid && layerFront) {
        layerBack.style.transform = `rotate(${x * -18 - 6}deg) translate(${x * -24 - 14}px, ${y * 12 - 8}px) scale(0.98)`;
        layerMid.style.transform = `rotate(${x * 16 + 5}deg) translate(${x * 24 + 14}px, ${y * -10 - 4}px) scale(1.01)`;
        layerFront.style.transform = `translate(${x * 12}px, ${y * 12 - 8}px) scale(1.02)`;
      }
    });

    deck.addEventListener('pointerleave', () => {
      if (layerBack && layerMid && layerFront) {
        layerBack.style.transform = '';
        layerMid.style.transform = '';
        layerFront.style.transform = '';
      }
    });

    const title = deck.querySelector('.deck-title')?.textContent.replace('→', '').trim();
    bindInteractiveActivation(deck, title, () => {
      playTactileClick();
      const projectId = deck.getAttribute('data-project-id');
      if (projectId) openProjectModal(projectId, deck);
    });
  });

  // Carousel card pointer movement & activation
  document.querySelectorAll('.carousel-card').forEach((card) => {
    const layerBack = card.querySelector('.carousel-card__layer--back');
    const layerMid = card.querySelector('.carousel-card__layer--mid');
    const layerFront = card.querySelector('.carousel-card__layer--front');

    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || reducedMotionQuery.matches) return;
      if (viewport && viewport.classList.contains('is-dragging')) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (layerBack && layerMid && layerFront) {
        layerBack.style.transform = `rotate(${x * -18 - 6}deg) translate(${x * -24 - 14}px, ${y * 12 - 8}px) scale(0.98)`;
        layerMid.style.transform = `rotate(${x * 16 + 5}deg) translate(${x * 24 + 14}px, ${y * -10 - 4}px) scale(1.01)`;
        layerFront.style.transform = `translate(${x * 12}px, ${y * 12 - 8}px) scale(1.02)`;
      }
    });

    card.addEventListener('pointerleave', () => {
      if (layerBack && layerMid && layerFront) {
        layerBack.style.transform = '';
        layerMid.style.transform = '';
        layerFront.style.transform = '';
      }
    });

    const title = card.querySelector('.card-title')?.textContent.trim();
    bindInteractiveActivation(
      card,
      title,
      () => {
        playTactileClick();
        const projectId = card.getAttribute('data-project-id');
        if (projectId) openProjectModal(projectId, card);
      },
      () => Boolean(card.closest('#curvedCarouselViewport') && viewport?._shouldSuppressClick && viewport._shouldSuppressClick())
    );
  });
}

/* ==========================================================================
   5. RADIAL PALETTE FAN-OUT THEME SWITCHER (Spencer Gabor Radial Engine)
   ========================================================================== */
function initThemeEngine() {
  const widget = document.getElementById('radialPaletteWidget');
  const toggleBtn = document.getElementById('radialToggleBtn');
  const swatchBtns = document.querySelectorAll('.swatch-btn');
  if (!widget || !toggleBtn) return;

  // Restore saved theme or default to 'void' (Rohith aesthetic)
  const validThemes = ['void', 'cream', 'solar'];
  const storedTheme = localStorage.getItem('portfolio_theme');
  const savedTheme = validThemes.includes(storedTheme) ? storedTheme : 'void';
  setTheme(savedTheme, false);

  let lastToggleTime = 0;

  const toggleWidget = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = Date.now();
    if (now - lastToggleTime < 80) return;
    lastToggleTime = now;

    const isOpen = widget.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    playWhooshSound();
  };

  toggleBtn.addEventListener('click', toggleWidget);

  // Close when clicking or tapping outside or pressing Escape
  const closeIfOutside = (e) => {
    if (!widget.contains(e.target) && widget.classList.contains('open')) {
      widget.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  };

  document.addEventListener('click', closeIfOutside);
  document.addEventListener('touchstart', closeIfOutside, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widget.classList.contains('open')) {
      widget.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.focus();
    }
  });

  swatchBtns.forEach((btn) => {
    const handleSwatch = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const theme = btn.getAttribute('data-set-theme');
      if (theme) {
        setTheme(theme, true);
        widget.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    };
    btn.addEventListener('click', handleSwatch);
  });
}

function setTheme(themeName, playSound = true) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('portfolio_theme', themeName);

  // Update active indicator
  document.querySelectorAll('.swatch-btn').forEach((btn) => {
    if (btn.getAttribute('data-set-theme') === themeName) {
      btn.style.outline = '3px solid #ffffff';
    } else {
      btn.style.outline = 'none';
    }
  });

  // Update theme toggle accessibility and tooltips
  const toggleBtn = document.getElementById('radialToggleBtn');
  if (toggleBtn) {
    if (themeName === 'cream') {
      toggleBtn.setAttribute('title', 'Theme: Cream & Orange (Day Sun). Click to switch');
      toggleBtn.setAttribute('aria-label', 'Theme is Cream and Orange (Sun). Click to change');
    } else if (themeName === 'solar') {
      toggleBtn.setAttribute('title', 'Theme: Solar Amber & Dark (Night Moon). Click to switch');
      toggleBtn.setAttribute('aria-label', 'Theme is Solar Amber (Moon). Click to change');
    } else {
      toggleBtn.setAttribute('title', 'Theme: Void Acid & Black (Night Moon). Click to switch');
      toggleBtn.setAttribute('aria-label', 'Theme is Void Neon (Moon). Click to change');
    }
  }

  if (playSound) {
    playThemeChime();
  }
}

/* ==========================================================================
   6. CASE STUDY MODAL (Full Native Work Showcase — Complete Plates & Media)
   ========================================================================== */
const CASE_STUDIES = {
  'project-01': {
    title: 'Akkarakkavu — Comic Series (Chapter One)',
    category: 'Comic Series • Visual Storytelling • Graphic Narrative',
    client: 'Independent Comic Publication',
    year: '2025',
    role: 'Comic Artist, Character Designer & Illustrator',
    image: 'img/projects/akkarakkavu.jpg',
    mobileImage: 'img/projects/akkarakkavu-mobile.jpg',
    badge: 'COMIC SERIES // CHAPTER ONE',
    summary: 'Set in the mystical landscapes of Kerala, Akkarakkavu is an illustrated continuous scroll story following young Kannan as he wanders deeper into a sacred grove. Guided by a supernatural fox, he is led into a world beyond the familiar—a tale exploring ancient legends and the supernatural charms that he begins to uncover within the mythical grove on the other side of an astral world.',
    challenge: 'Translating living Kerala folklore, twilight sacred grove (kaavu) rituals, and vernacular astral mysticism into an intimate, continuous-scroll graphic narrative with rich atmospheric depth and authentic rural childhood innocence.',
    solution: 'Engineered lush painterly forest environments with dappled volumetric sunbeams, expressive character dynamics (rough sketch studies to final rolling-tyre boy design), a luminous sacred pond sequence, and custom bilingual Malayalam (അക്കരക്കാവ്) and English title typography rooted in Malabar oral traditions.',
    swatches: ['#0D2818', '#04471C', '#E9C46A', '#FF9F1C', '#FAF8F5'],
    deliverables: ['Original Comic Series Chapter One (6 Story Panels)', 'Interactive 3D Digital Flipbook Edition', 'Character & Companion Fox Design System', 'Atmospheric Environmental Backgrounds', 'Custom Malayalam & English Lettering'],
    plates: [
      {
        type: 'series',
        badge: 'PLATE 01 // ILLUSTRATED COMIC SERIES',
        panelCount: '06 PANELS',
        title: 'Plate 01 // Akkarakkavu Chapter One — Illustrated Narrative Storyboard (6 Story Panels)',
        desc: 'Official high-resolution illustrated graphic sequence of Akkarakkavu Chapter One: from young Kannan venturing into the misty forest alongside the spirit fox, through the volumetric sunbeams, luminous sacred pond, supernatural underwater transition, and discovering the floating mystical stones.',
        images: [
          {
            src: 'img/projects/akkarakkavu-panel-01-cover.jpg',
            title: 'Akkarakkavu Title Banner & Cover Artwork',
            panelBadge: 'COVER',
            caption: 'Akkarakkavu (അക്കരക്കാവ്) Official Title Artwork — Young Kannan and the Spirit Fox entering the enchanted forest grove.'
          },
          {
            src: 'img/projects/akkarakkavu-panel-02-synopsis.png',
            title: 'Title Typography & Story Narrative',
            panelBadge: 'SYNOPSIS',
            caption: 'Narrative Introduction & Custom Malayalam Calligraphy (അക്കരക്കാവ്).'
          },
          {
            src: 'img/projects/akkarakkavu-panel-03-meadow.jpg',
            title: 'Illustrated Panel 01 — The Misty Forest',
            panelBadge: '01',
            caption: '“Kannan stood there looking into the misty forest, remembering the myths his mother once whispered.”'
          },
          {
            src: 'img/projects/akkarakkavu-panel-04-sunlight.jpg',
            title: 'Illustrated Panel 02 — Welcoming Sunbeams',
            panelBadge: '02',
            caption: '“As Kannan walked on, sunlight broke through the rain— like the forest was welcoming him. Something magical.”'
          },
          {
            src: 'img/projects/akkarakkavu-panel-05-pond.jpg',
            title: 'Illustrated Panel 03 — The Luminous Pond',
            panelBadge: '03',
            caption: '“Kannan stumbled upon a sight unreal... mystical lights, bright and alive, rising from the waters before him.”'
          },
          {
            src: 'img/projects/akkarakkavu-panel-06-water.jpg',
            title: 'Illustrated Panel 04 — The Supernatural Descent',
            panelBadge: '04',
            caption: '“Kannan is suddenly pushed into the water... by something supernatural.”'
          },
          {
            src: 'img/projects/akkarakkavu-panel-07-rocks.jpg',
            title: 'Illustrated Panel 05 — The Three Floating Rocks',
            panelBadge: '05',
            caption: '“The moment Kannan sinks beneath the water, reality shatters... and he awakens in a parallel world, staring at three rocks suspended in the air.”'
          },
          {
            src: 'img/projects/akkarakkavu-panel-08-light.jpg',
            title: 'Illustrated Panel 06 — Radiant Light Awakening',
            panelBadge: '06',
            caption: '“As Kannan reaches out to the floating rocks, beams of radiant light burst from them... rushing straight into him.”'
          }
        ]
      },
      {
        type: 'iframe',
        iframeUrl: 'https://heyzine.com/flip-book/4122c28ec5.html',
        badge: '3D DIGITAL FLIPBOOK',
        title: 'Plate 02 // Akkarakkavu Chapter One — Interactive 3D Digital Flipbook',
        desc: 'Interactive 3D digital reader edition. Click or drag page corners to flip through the illustrated comic book pages in real-time 3D simulation with authentic page-turn physics, sound effects, thumbnail navigation, and full-screen reading mode.'
      }
    ]
  },
  'project-02': {
    title: 'Walkkaro Walkathon — Key Visual Illustration',
    category: 'Campaign Key Visual • Illustration • Event Branding',
    client: 'Curious Cat Ideas • Walkkaro (Kozhikode Walkathon)',
    year: '2026',
    role: 'Illustration Intern & Key Visual Artist',
    image: 'img/projects/walkkaro.jpg',
    badge: 'KEY VISUAL // CAMPAIGN ART',
    summary: 'The official flagship key visual illustration created for the Kozhikode Walkathon (Powered by Walkkaro) during an 8-week illustration internship at Curious Cat Ideas in Kozhikode.',
    challenge: 'Encapsulating Kozhikode’s distinct coastal landmarks—the beach waves, historic lighthouse, Mananchira, street culture, and community spirit—within a dynamic, runner-focused key visual.',
    solution: 'Constructed an energetic panoramic focal illustration weaving vibrant ocean waves, iconic Malabar architecture, spirited diverse walkers, and a telescopic horizon celebrating fitness and community.',
    swatches: ['#36C3D9', '#0D5C75', '#E63946', '#F4A261', '#E76F51'],
    deliverables: ['Flagship Campaign Key Visual', 'Large-Format Event Backdrop & Billboards', 'Event T-Shirts, Bibs & Medals Assets', 'Social Media Launch Campaign Kit'],
    plates: [
      {
        src: 'img/projects/walkkaro-case-study-opt.jpg',
        mobileSrc: 'img/projects/walkkaro-case-study-mobile.jpg',
        title: 'Complete Kozhikode Walkathon Project Board & Final Key Art (Ultra-Res 1420 × 8861)',
        desc: 'Full-resolution master project board detailing: Design Process, Primary Brand Colors & Supporting Accent Colors, Reference Illustrations & Urban Moodboards (Mananchira Square, Kozhikode Beach, Kuttichira Mosque, Thikkodi Lighthouse, S.K. Pottekkatt statue, street food carts), Composition & Sketching variations, the 6-stage Vector Rendering Process, and the complete Final Key Art with official project narrative.'
      }
    ]
  },
  'project-03': {
    title: 'The Drip Codex — (Fashion Glossary)',
    category: 'Editorial Design • Fashion Communication • Visual Research',
    client: 'Youth Culture & Style Taxonomy',
    year: '2025',
    role: 'Visual Researcher, Editorial Designer & Typographer',
    image: 'img/projects/drip-codex.jpg',
    badge: 'EDITORIAL // FASHION GLOSSARY',
    summary: 'A bold, hyper-stylized illustrated glossary decoding Gen-Z fashion vernacular, streetwear aesthetics, thrift subcultures, and internet-native micro-trends into an editorial compendium.',
    challenge: 'Gen-Z fashion terminology and aesthetic micro-trends evolve rapidly online, resulting in fragmented and ephemeral visual records without cohesive physical documentation.',
    solution: 'Curated and categorized over 100 subcultural style terms. Paired technical flat sketches and expressive character illustrations with a modular, neo-brutalist typographic grid that mirrors digital feed culture in physical print form.',
    swatches: ['#B91C1C', '#EAB308', '#1D4ED8', '#18181B', '#F4F4F5'],
    deliverables: ['Illustrated Fashion Lexicon & Publication', 'Interactive 3D Digital Flipbook Edition', 'Custom Streetwear Icon & Vector Set', 'Modular Neo-Brutalist Grid System', 'Micro-Trend Sociological Analysis'],
    plates: [
      {
        type: 'image',
        src: 'img/projects/drip-codex-case-study-opt.jpg',
        mobileSrc: 'img/projects/drip-codex-case-study-mobile.jpg',
        title: 'Plate 01 // Complete Drip Codex Project Board (Ultra-Res 1420×7140)',
        desc: 'Crisp master project board covering: Target Ring Cover Art, Vinyl LP Record analog branding, 3D Book Mockups, and 7 interior spread layouts exploring Gen-Z street fashion vocabulary, thrift terminology, and subculture taxonomy.'
      },
      {
        type: 'iframe',
        iframeUrl: 'https://heyzine.com/flip-book/d4e1783396.html',
        badge: '3D DIGITAL FLIPBOOK',
        title: 'Plate 02 // The Drip Codex — Interactive 3D Digital Flipbook Reader',
        desc: 'Interactive 3D digital reader publication. Flip through the complete editorial spreads and subculture glossary entries with authentic page-turning physics, realistic paper sound effects, high-res zoom, and full-screen reading mode.'
      }
    ]
  },
  'project-04': {
    title: 'One Way Vision — Illustrated Graphic Panels',
    category: 'Environmental Graphics • Spatial Mural • Large Format',
    client: 'National Institute of Fashion Technology (NIFT), Kannur',
    year: '2025',
    role: 'Head Illustrator & Large-Format Production Lead',
    image: 'img/projects/one-way-vision.jpg',
    badge: 'SPATIAL INSTALLATION // NIFT KANNUR',
    summary: 'Site-specific large-scale illustrated graphic panels executed in perforated one-way vision film across the prominent entrance gates and facade architecture of NIFT Kannur.',
    challenge: 'Creating an imposing, vibrant cultural and artistic welcome at the institutional campus gates while ensuring security visibility and optical one-way transparency from within the security cabins.',
    solution: 'Crafted a vibrant, story-rich illustrated graffiti panel series celebrating fashion craftsmanship, indigenous Kerala flora, weaving textures, and avant-garde student creativity.',
    swatches: ['#DC2626', '#0284C7', '#F59E0B', '#10B981', '#1E293B'],
    deliverables: ['Large-Scale Architectural Vector Murals', 'Perforated One-Way Vision Film Spec', 'On-Site Gate Alignment & Installation', 'Campus Spatial Transformation Showcase'],
    plates: [
      {
        src: 'img/projects/one-way-vision-case-study-opt.jpg',
        mobileSrc: 'img/projects/one-way-vision-case-study-mobile.jpg',
        title: 'Complete One Way Vision Project Board (Ultra-Res 1420 × 4919)',
        desc: 'Comprehensive project board covering: National Institute of Fashion Technology main entrance, 3 Illustrated Graffiti Panels (Panel 1: Kerala heritage & sewing machine elephant, Panel 2: Fashion art student portrait with circular amphitheatre hair, Panel 3: Hornbill scissors & tropical biodiversity), Ideation Process, and Final Installed Gate Photographs.'
      }
    ]
  },
  'project-05': {
    title: 'Brand Visual Study — (PUMA)',
    category: 'Brand Visual Study • Art Direction • Athletic Apparel',
    client: 'PUMA Concept Study',
    year: '2025',
    role: 'Art Director, Visual Designer & Brand Strategist (Soorya Kiran)',
    image: 'img/projects/puma-study.jpg',
    badge: 'BRAND STUDY // PUMA ARCHIVE',
    summary: 'A comprehensive brand visual study and dynamic art direction exploration for PUMA athletic footwear and apparel. Explores kinetic speed lines, high-contrast sportswear typography, modular campaign layouts, and aggressive street-level aesthetic direction.',
    challenge: 'Translating PUMA\'s athletic legacy into a youth-centric, instinct-driven commercial narrative that emphasizes spontaneous everyday movement rather than rigid competitive performance.',
    solution: 'Developed an action-driven visual language anchored by the tagline "CHASE THE FUN". Combined dark high-intensity tones with soft natural lighting, dynamic camera pacing, a 12-panel kinetic storyboard, and outdoor lifestyle moodboards.',
    swatches: ['#0A0A0C', '#4F6F52', '#E9C46A', '#FFFFFF', '#18181F'],
    deliverables: [
      'Brand Visual Study & Motion Framework',
      '12-Panel Kinetic Commercial Storyboard',
      'Concept Note & "Chase The Fun" Campaign Tagline',
      'Target Audience (16–25) & Visual Language Archetypes',
      'Comprehensive Moodboard & Automotive Inspiration Board'
    ],
    mediaEmbed: {
      type: 'youtube',
      videoId: '7R2l4Ctmg20',
      videoUrl: 'https://www.youtube.com/watch?v=7R2l4Ctmg20',
      title: 'PUMA COMMERCIAL // OFFICIAL AD FILM',
      badge: 'YOUTUBE 4K / 1080P',
      html: '<iframe src="https://www.youtube-nocookie.com/embed/7R2l4Ctmg20?rel=0&amp;modestbranding=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    plates: [
      {
        src: 'img/projects/puma-case-study-opt.jpg',
        mobileSrc: 'img/projects/puma-case-study-mobile.jpg',
        title: 'Complete Brand Visual Study Board (Ultra-Res 1420×5780)',
        desc: 'Complete high-resolution brand analysis board featuring About the Brand, Visual Language guidelines, Concept Note, Target Audience breakdown, "Chase the Fun" Key Message, 12-panel commercial storyboard, lifestyle moodboard, and automotive inspiration board.'
      }
    ]
  },
  'project-06': {
    title: 'Somewhere Between Us — (Short Film)',
    category: 'Short Film • Direction • Cinematography',
    client: 'Independent Short Film • Pazhampori Studios',
    year: '2025',
    role: 'Director, Story & Co-DOP (Soorya Kiran)',
    image: 'img/projects/somewhere-between-us.jpg',
    badge: 'SHORT FILM // DIRECTION',
    summary: 'An independent narrative short film directed by Soorya Kiran. Follows two close friends, Varun and Dhea, during a late-night drive on the eve of graduation. When their journey takes an unexpected turn, the screenplay utilizes a looping narrative structure where unspoken emotions, recurring choices, and shadowy revelations collide.',
    challenge: 'Executing a high-tension car accident sequence and recurring narrative loops on a micro-budget (approx. ₹10,000) within a strict 2-day production window, relying on camera positioning, framing, and sound design rather than expensive visual effects.',
    solution: 'Engineered a looping screenplay with minimal atmospheric night locations (the cemetery bridge, nearby supermarket, and Alto K10 car interior). Utilized 2.39:1 widescreen framing, moody chiaroscuro lighting, subtle POV car rigging, and an original emotional score by Aiswarya & Meha.',
    swatches: ['#0B0B0E', '#E63946', '#1D3557', '#F4A261', '#FAF8F5'],
    deliverables: [
      'Directorial Vision & Original Looping Screenplay',
      '2-Day Micro-Budget Production & Night Recce Scouting',
      'Character Staging & Cast Direction (Dhea Babu & Amokh Sayanth)',
      'Post-Production Editing (Suraj), Sound Design & VFX (Hariprakash)',
      '12-Frame Cinematic Widescreen Color & Lighting Script'
    ],
    mediaEmbed: {
      type: 'youtube',
      videoId: 'taKswh1m2uE',
      videoUrl: 'https://www.youtube.com/watch?v=taKswh1m2uE',
      title: 'SOMEWHERE BETWEEN US // OFFICIAL SHORT FILM',
      badge: 'YOUTUBE CINEMA STREAM',
      html: '<iframe src="https://www.youtube-nocookie.com/embed/taKswh1m2uE?rel=0&amp;modestbranding=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    plates: [
      {
        src: 'img/projects/somewhere-between-us-case-study-opt.jpg',
        mobileSrc: 'img/projects/somewhere-between-us-case-study-mobile.jpg',
        title: 'Complete Production & Directorial Master Board (Ultra-Res 1420 × 12030)',
        desc: 'Complete high-resolution master case study detailing the creative crew credits, looping screenplay analysis, minimal night recce locations, character profiles for Dhea & Varun, camera rigging on moving car, accident sequence pacing, micro-budget production, and 12 atmospheric widescreen keyframes.'
      }
    ]
  },
  'project-07': {
    title: 'Happylicious Styling Project',
    category: 'Fashion Styling • Art Direction • Youth Culture',
    client: 'Editorial Fashion & Creative Styling',
    year: '2025',
    role: 'Fashion Stylist, Visual Concept Artist & Creative Director (Soorya Kiran)',
    image: 'img/projects/happylicious.jpg',
    badge: 'FASHION STYLING // EDITORIAL',
    summary: 'A vibrant, joyful fashion styling and editorial visual project exploring how changing perspectives influence how young people express themselves and how fashion becomes an extension of emotion, spontaneity, and identity.',
    challenge: 'Crafting a high-energy, authentic youth fashion editorial that explores parallel experiences of happiness across contrasting styling aesthetics without feeling staged or commercialized.',
    solution: 'Curated parallel styling aesthetics fusing 70s retro warmth with Y2K eclectic street culture: Look 01 (tomato red chunky knit sweater with yellow plaid miniskirt) and Look 02 (apricot ribbed front-tie cardigan with lavender neck scarf and pink denim). Paired with retro bubble typography and pastel floral branding.',
    swatches: ['#FF6B8B', '#F97316', '#FBBF24', '#8B5CF6', '#FDF2F8'],
    deliverables: [
      'Youth Fashion Wardrobe Styling & Parallel Looks',
      'Concept Board: Joy & Emotional Fashion Taxonomy',
      'Custom Retro Bubble Typography & Floral Branding',
      'Urban Location Photoshoot & Creative Direction',
      'Color-Blocked Editorial Styling Compendium'
    ],
    mediaEmbed: {
      type: 'instagram',
      videoUrl: 'https://www.instagram.com/reel/DeOzR5VPcZn/',
      title: 'HAPPYLICIOUS // OFFICIAL FASHION REEL',
      badge: 'INSTAGRAM REEL',
      html: '<iframe src="https://www.instagram.com/reel/DeOzR5VPcZn/embed/" scrolling="no" allowfullscreen frameborder="0"></iframe>'
    },
    plates: [
      {
        src: 'img/projects/happylicious-case-study-opt.jpg',
        mobileSrc: 'img/projects/happylicious-case-study-mobile.jpg',
        title: 'Complete Happylicious Concept & Styling Board (Ultra-Res 1920 × 5400)',
        desc: 'Complete high-resolution master project board featuring floral border branding, the official Concept Board philosophy, and multi-angle photoshoot sets exploring Look 01 (tomato red knit + yellow plaid) and Look 02 (apricot cardigan + pink denim).'
      }
    ]
  }
};

let lastFocusedTrigger = null;

function initCaseStudyModal() {
  const modalBackdrop = document.getElementById('caseModalBackdrop');
  const closeBtn = document.getElementById('modalCloseBtn');
  const dismissBtn = document.getElementById('modalDismissBtn');
  if (!modalBackdrop) return;

  closeBtn?.addEventListener('click', closeModal);
  dismissBtn?.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (!modalBackdrop.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = modalBackdrop.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  function closeModal() {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    playTactileClick();

    // Immediately stop active video / media playback to prevent background audio continuation
    const mediaContainer = document.getElementById('modalMediaEmbed');
    if (mediaContainer) {
      mediaContainer.innerHTML = '';
      mediaContainer.style.display = 'none';
    }

    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }
}

function openProjectModal(projectId, triggerEl = null) {
  const modalBackdrop = document.getElementById('caseModalBackdrop');
  const data = CASE_STUDIES[projectId];
  if (!modalBackdrop || !data) return;

  if (triggerEl) {
    triggerEl.classList.add('card-activating');
    setTimeout(() => {
      triggerEl.classList.remove('card-activating');
    }, 450);
  }

  lastFocusedTrigger = triggerEl || document.activeElement;

  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = data.title;

  const catEl = document.getElementById('modalCategory');
  if (catEl) catEl.textContent = data.category;

  const clientEl = document.getElementById('modalClient');
  if (clientEl) clientEl.textContent = data.client;

  const yearEl = document.getElementById('modalYear');
  if (yearEl) yearEl.textContent = data.year;

  const roleEl = document.getElementById('modalRole');
  if (roleEl) roleEl.textContent = data.role;

  const sumEl = document.getElementById('modalSummary');
  if (sumEl) sumEl.textContent = data.summary;

  // Challenge & Solution Blocks
  const challengeEl = document.getElementById('modalChallenge');
  if (challengeEl) {
    challengeEl.textContent = data.challenge || '';
    challengeEl.closest('.modal-section-block')?.style.setProperty('display', data.challenge ? 'block' : 'none');
  }

  const solutionEl = document.getElementById('modalSolution');
  if (solutionEl) {
    solutionEl.textContent = data.solution || '';
    solutionEl.closest('.modal-section-block')?.style.setProperty('display', data.solution ? 'block' : 'none');
  }

  // Populate Color Palette Matrix
  const swatchesContainer = document.getElementById('modalSwatches');
  if (swatchesContainer) {
    swatchesContainer.innerHTML = '';
    if (Array.isArray(data.swatches) && data.swatches.length > 0) {
      swatchesContainer.closest('.modal-section-block')?.style.setProperty('display', 'block');
      data.swatches.forEach((hex) => {
        const chip = document.createElement('div');
        chip.className = 'modal-swatch-chip';
        chip.style.backgroundColor = hex;
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
        const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
        const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        chip.style.color = brightness > 150 ? '#111116' : '#FAF8F5';
        chip.textContent = hex.toUpperCase();
        swatchesContainer.appendChild(chip);
      });
    } else {
      swatchesContainer.closest('.modal-section-block')?.style.setProperty('display', 'none');
    }
  }

  // Hero Image & Badge
  const heroImg = document.getElementById('modalHeroImg');
  if (heroImg && data.image) {
    const isMobileViewport = window.innerWidth <= 768;
    heroImg.src = (isMobileViewport && data.mobileImage) ? data.mobileImage : data.image;
    heroImg.alt = data.title;
    heroImg.decoding = 'async';
    if (projectId === 'project-02') {
      heroImg.style.objectPosition = '50% 64%';
    } else {
      heroImg.style.objectPosition = '';
    }
  }

  const heroBadge = document.getElementById('modalHeroBadge');
  if (heroBadge) {
    heroBadge.textContent = data.badge || 'PROJECT SHOWCASE';
  }

  // Handle Embedded Media (Ad Film, Short Film, Fashion Film)
  const mediaContainer = document.getElementById('modalMediaEmbed');
  if (mediaContainer) {
    if (data.mediaEmbed) {
      mediaContainer.style.display = 'block';

      const isYoutube = data.mediaEmbed.type === 'youtube';
      const videoUrl = data.mediaEmbed.videoUrl || (isYoutube ? `https://www.youtube.com/watch?v=${data.mediaEmbed.videoId}` : null);

      let playerHtml = '';
      if (isYoutube) {
        playerHtml = `
          <div class="modal-video-fallback" style="background-image: url('${data.image || ''}');">
            <div class="modal-video-fallback-overlay">
              <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="modal-video-fallback-play">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span>Watch on YouTube</span>
              </a>
            </div>
          </div>
        `;
      } else {
        playerHtml = `
          <div class="modal-video-player-wrap ${data.mediaEmbed.type === 'instagram' ? 'instagram-aspect' : 'youtube-aspect'}">
            ${data.mediaEmbed.html}
          </div>
        `;
      }

      mediaContainer.innerHTML = `
        <div class="modal-video-card">
          <div class="modal-video-header">
            <div class="modal-video-title-group">
              <span class="modal-video-dot"></span>
              <span class="modal-video-title">${data.mediaEmbed.title || 'OFFICIAL FILM SHOWCASE'}</span>
            </div>
            <div class="modal-video-header-right">
              ${videoUrl ? `<a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="modal-video-external-btn">${data.mediaEmbed.type === 'instagram' ? 'VIEW ON INSTAGRAM ↗' : 'WATCH ON YOUTUBE ↗'}</a>` : ''}
              <span class="modal-video-badge">${data.mediaEmbed.badge || 'CINEMA STREAM'}</span>
            </div>
          </div>
          ${playerHtml}
        </div>
      `;
    } else {
      mediaContainer.style.display = 'none';
      mediaContainer.innerHTML = '';
    }
  }

  // Visibility of Complete Work Showcase section (header + plates + media)
  const showcaseSection = modalBackdrop.querySelector('.modal-showcase-section');
  const hasPlates = Array.isArray(data.plates) && data.plates.length > 0;
  const hasMedia = !!data.mediaEmbed;
  if (showcaseSection) {
    showcaseSection.style.display = (hasPlates || hasMedia) ? '' : 'none';
  }

  // Populate Artwork Plates Gallery
  const platesContainer = document.getElementById('modalPlatesGallery');
  const platesCountEl = document.getElementById('modalPlatesCount');
  if (platesContainer) {
    platesContainer.innerHTML = '';
    if (hasPlates) {
      if (platesCountEl) {
        if (data.mediaEmbed) {
          platesCountEl.textContent = '01 FILM + 01 CASE STUDY BOARD';
        } else if (data.plates.some(p => p.type === 'series' || Array.isArray(p.images))) {
          const seriesPlate = data.plates.find(p => p.type === 'series' || Array.isArray(p.images));
          const numImages = seriesPlate.panelCount
            ? seriesPlate.panelCount.replace(/[^0-9]/g, '')
            : (seriesPlate.images ? seriesPlate.images.filter(img => typeof img === 'object' && img.panelBadge ? /^\d+$/.test(img.panelBadge) : true).length : 6);
          platesCountEl.textContent = `01 STORYBOARD (${String(numImages).padStart(2, '0')} PANELS) + 01 3D FLIPBOOK`;
        } else if (data.plates.some(p => p.type === 'iframe' || p.iframeUrl)) {
          platesCountEl.textContent = '01 BOARD + 01 3D FLIPBOOK';
        } else {
          platesCountEl.textContent = data.plates.length === 1 ? '01 PLATE' : `${String(data.plates.length).padStart(2, '0')} PLATES`;
        }
      }
      data.plates.forEach((plate) => {
        const plateEl = document.createElement('article');
        plateEl.className = 'modal-plate-item';

        if (plate.type === 'iframe' || plate.iframeUrl) {
          plateEl.classList.add('modal-plate-iframe-item');
          const iframeSrc = plate.iframeUrl || plate.src;
          plateEl.innerHTML = `
            <div class="modal-plate-iframe-header">
              <div class="modal-plate-iframe-title-group">
                <span class="modal-plate-glow-dot"></span>
                <span class="modal-plate-iframe-title">${plate.badge || 'INTERACTIVE 3D FLIPBOOK'}</span>
              </div>
              <div class="modal-plate-iframe-controls">
                <a href="${iframeSrc}" target="_blank" rel="noopener noreferrer" class="modal-plate-fullscreen-btn" title="Open in fullscreen new tab">
                  <span>FULLSCREEN ↗</span>
                </a>
              </div>
            </div>
            <div class="modal-plate-iframe-wrap">
              <iframe 
                src="${iframeSrc}" 
                class="modal-plate-iframe"
                allowfullscreen="true" 
                allow="autoplay; fullscreen; clipboard-write" 
                scrolling="no" 
                title="${plate.title || 'Interactive 3D Flipbook'}"
                loading="lazy">
              </iframe>
            </div>
          `;
        } else if (plate.type === 'series' || Array.isArray(plate.images)) {
          plateEl.classList.add('modal-plate-series-item');
          const imagesList = Array.isArray(plate.images) ? plate.images : [];
          const storyPanelsCount = imagesList.filter(img => {
            const badge = typeof img === 'object' && img.panelBadge;
            return !badge || /^\d+$/.test(badge);
          }).length || imagesList.length;

          let autoIdx = 0;
          const imagesHtml = imagesList.map((imgObj, idx) => {
            const src = typeof imgObj === 'string' ? imgObj : imgObj.src;
            const caption = typeof imgObj === 'object' && imgObj.caption ? imgObj.caption : '';
            const title = typeof imgObj === 'object' && imgObj.title ? imgObj.title : `Panel ${String(idx + 1).padStart(2, '0')}`;

            let badgeText = '';
            if (typeof imgObj === 'object' && imgObj.panelBadge) {
              badgeText = imgObj.panelBadge;
            } else {
              autoIdx++;
              badgeText = String(autoIdx).padStart(2, '0');
            }

            return `
              <div class="modal-series-panel-wrap">
                <div class="modal-plate-img-wrap">
                  <img src="${src}" alt="${title}" class="modal-plate-img" loading="lazy" decoding="async" />
                </div>
                ${caption ? `
                <div class="modal-series-panel-caption">
                  <span class="modal-series-panel-num">${badgeText}</span>
                  <p class="modal-series-panel-text">${caption}</p>
                </div>` : ''}
              </div>
            `;
          }).join('');

          const countPillText = plate.panelCount || `${storyPanelsCount} PANELS`;

          plateEl.innerHTML = `
            <div class="modal-plate-series-header">
              <div class="modal-plate-iframe-title-group">
                <span class="modal-plate-glow-dot"></span>
                <span class="modal-plate-iframe-title">${plate.badge || 'PLATE 01 // ILLUSTRATED COMIC SERIES'}</span>
              </div>
              <span class="modal-series-count-pill">${countPillText}</span>
            </div>
            <div class="modal-plate-series-stream">
              ${imagesHtml}
            </div>
          `;
        } else {
          plateEl.innerHTML = `
            <div class="modal-plate-img-wrap">
              <picture>
                ${plate.mobileSrc ? `<source media="(max-width: 768px)" srcset="${plate.mobileSrc}">` : ''}
                <img src="${plate.src}" alt="${plate.title || 'Project Plate'}" class="modal-plate-img" loading="lazy" decoding="async" />
              </picture>
            </div>
          `;
        }
        platesContainer.appendChild(plateEl);
      });
    }
  }

  // Populate Deliverables List
  const deliverablesList = document.getElementById('modalDeliverablesList');
  if (deliverablesList && Array.isArray(data.deliverables)) {
    deliverablesList.innerHTML = '';
    data.deliverables.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      deliverablesList.appendChild(li);
    });
  }

  const card = modalBackdrop.querySelector('.case-modal-card');
  if (card) {
    card.scrollTop = 0;
  }

  modalBackdrop.classList.remove('open');
  void modalBackdrop.offsetWidth;
  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) {
    requestAnimationFrame(() => closeBtn.focus());
  }
}

/* ==========================================================================
   7. GIANT KINETIC FOOTER (Spencer Gabor ScaleY Stretch on Scroll & Email Copy)
   ========================================================================== */
function initGiantFooter() {
  const footerTitle = document.getElementById('footerKineticTitle');
  const copyBtn = document.getElementById('footerEmailBtn');
  const copyToast = document.getElementById('copyToast');
  const footerSignboard = document.getElementById('footerSignboard');
  const footerSection = document.getElementById('contact');

  // Highway Signboard Mechanical Rise-Up Entrance Observer
  if (footerSignboard) {
    if ('IntersectionObserver' in window && !reducedMotionQuery.matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footerSignboard.classList.add('is-risen');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(footerSection || footerSignboard);
    } else {
      footerSignboard.classList.add('is-risen');
    }
  }

  if (footerTitle) {
    footerTitle.addEventListener('click', () => {
      playTactileClick();
    });
  }

  if (copyBtn && copyToast) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email') || 'sooryakiran605@gmail.com';
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          copied = true;
        }
      } catch (_) { }

      if (!copied) {
        const helper = document.createElement('textarea');
        helper.value = email;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        try {
          copied = document.execCommand('copy');
        } catch (_) { }
        helper.remove();
      }

      playTactileClick();
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 2200);
    });
  }

  // Nav & Social Links Click Feedback
  document.querySelectorAll('.nav-link-btn, .nav-dropdown-item, .footer-links-list a').forEach((link) => {
    link.addEventListener('click', () => {
      playTactileClick();
    });
  });

  // Works Navigation Dropdown Toggle & Accessibility
  const worksDropdown = document.getElementById('worksDropdown');
  const worksDropdownBtn = document.getElementById('worksDropdownBtn');
  if (worksDropdown && worksDropdownBtn) {
    const closeDropdown = () => {
      worksDropdown.classList.remove('is-open');
      worksDropdownBtn.setAttribute('aria-expanded', 'false');
    };

    worksDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = worksDropdown.classList.toggle('is-open');
      worksDropdownBtn.setAttribute('aria-expanded', String(isOpen));
      if (typeof playTactileClick === 'function') playTactileClick();
    });

    document.querySelectorAll('.nav-dropdown-item').forEach((item) => {
      item.addEventListener('click', () => {
        closeDropdown();
      });
    });

    document.addEventListener('click', (e) => {
      if (!worksDropdown.contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('touchstart', (e) => {
      if (!worksDropdown.contains(e.target)) {
        closeDropdown();
      }
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && worksDropdown.classList.contains('is-open')) {
        closeDropdown();
        worksDropdownBtn.focus();
      }
    });
  }
}

/* ==========================================================================
   8. WEB AUDIO SOUND ENGINE (Tactile Mechanical Micro-Feedback)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initSoundEngine() {
  const soundToggle = document.getElementById('soundToggleBtn');
  if (!soundToggle) return;

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('active', soundEnabled);
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    if (soundEnabled) {
      playTactileClick();
    }
  });
}

function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTactileClick() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  } catch (e) {
    // Ignore audio errors silently
  }
}

function playThemeChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    [520, 680, 880, 1040].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + i * 0.04 + 0.14);
    });
  } catch (e) { }
}

function playWhooshSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) { }
}

/* ==========================================================================
   9. LIVE STUDIO CLOCK
   ========================================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function updateTime() {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      clockEl.textContent = formatter.format(now);
    } catch (e) {
      // Fallback calculation for UTC+5:30 (India Standard Time)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));
      const hours = String(istDate.getHours()).padStart(2, '0');
      const minutes = String(istDate.getMinutes()).padStart(2, '0');
      const seconds = String(istDate.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

/* ==========================================================================
   9B. BIRTHDAY & CREATIVE UPTIME CLOCK (Born 11/11/2004)
   ========================================================================== */
function initBirthdayClock() {
  const clockYears = document.getElementById('clockYears');
  const clockDays = document.getElementById('clockDays');
  const clockTime = document.getElementById('clockTime');
  const clockDaysCard = document.getElementById('clockDaysCard');
  const clockDaysLabel = document.getElementById('clockDaysLabel');

  if (!clockYears && !clockTime) return;

  // Birthday: November 11, 2004
  const birthDate = new Date(2004, 10, 11, 0, 0, 0); // Month is 0-indexed: 10 = Nov
  let showTotalDays = false;

  if (clockDaysCard && clockDaysLabel) {
    clockDaysCard.style.cursor = 'pointer';
    clockDaysCard.addEventListener('click', () => {
      showTotalDays = !showTotalDays;
      playTactileClick();
      updateClock();
    });
  }

  function updateClock() {
    const now = new Date();

    // 1. Calculate exact completed years
    let years = now.getFullYear() - 2004;
    let prevBirthday = new Date(now.getFullYear(), 10, 11, 0, 0, 0);
    if (now < prevBirthday) {
      years--;
      prevBirthday = new Date(now.getFullYear() - 1, 10, 11, 0, 0, 0);
    }

    // 2. Days elapsed
    if (showTotalDays) {
      const totalMs = now.getTime() - birthDate.getTime();
      const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
      if (clockDays) clockDays.textContent = totalDays.toLocaleString();
      if (clockDaysLabel) clockDaysLabel.textContent = 'TOTAL DAYS ON EARTH';
    } else {
      const msDiff = now.getTime() - prevBirthday.getTime();
      const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      if (clockDays) clockDays.textContent = String(days).padStart(2, '0');
      if (clockDaysLabel) clockDaysLabel.textContent = 'DAYS SINCE BIRTHDAY';
    }

    if (clockYears) clockYears.textContent = String(years);

    // 3. Live ticking clock
    try {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      if (clockTime) clockTime.textContent = formatter.format(now);
    } catch (e) {
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      if (clockTime) clockTime.textContent = `${hrs}:${mins}:${secs}`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   10. AUTO-HIDING SMART NAVIGATION (Hide on Scroll Down, Reveal on Scroll Up)
   ========================================================================== */
function initSmartNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  let ticking = false;
  const threshold = 8; // minimum scroll delta to prevent micro-flicker

  function updateNav() {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Always keep visible when near the top of the page
    if (currentScrollY <= 60) {
      nav.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    const scrollDelta = currentScrollY - lastScrollY;

    // Only trigger if scroll delta exceeds threshold
    if (Math.abs(scrollDelta) >= threshold) {
      if (scrollDelta > 0) {
        // Scrolling downwards -> hide
        nav.classList.add('nav-hidden');
        const worksDropdown = document.getElementById('worksDropdown');
        const worksDropdownBtn = document.getElementById('worksDropdownBtn');
        if (worksDropdown && worksDropdown.classList.contains('is-open')) {
          worksDropdown.classList.remove('is-open');
          if (worksDropdownBtn) worksDropdownBtn.setAttribute('aria-expanded', 'false');
        }
      } else {
        // Scrolling upwards -> reveal
        nav.classList.remove('nav-hidden');
      }
      lastScrollY = currentScrollY;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // Accessibility: reveal header when focused with keyboard Tab navigation
  nav.addEventListener('focusin', () => {
    nav.classList.remove('nav-hidden');
  });
}

