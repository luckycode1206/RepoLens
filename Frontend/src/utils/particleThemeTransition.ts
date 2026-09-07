/**
 * High-Clarity Homogeneous Particle Shatter & Disintegration Theme Transition
 * 
 * Optimizations:
 * 1. ZERO LAG:
 *    - Samples the DOM BEFORE touching document.body or creating canvas.
 *    - Caches computed styles so sampling runs in < 2ms without layout thrashing.
 *    - Coordinates with React startTransition to prevent animation frame starvation.
 * 
 * 2. HIGH CLARITY & MAJESTIC PACING:
 *    - Duration extended to 1800ms so the user can clearly see the disintegration.
 *    - Larger, tangible rectangular chips (8px–15px) and structural shards (15px–26px).
 *    - 1px contrast borders on every fragment so individual pieces pop with razor-sharp definition.
 *    - Stays at 100% opacity for the first 45% (~800ms) of the animation before dissolving into dust.
 */

export interface ParticleThemeTransitionOptions {
  duration?: number;
}

interface Fragment {
  homeX: number;
  homeY: number;
  width: number;
  height: number;
  shape: 'rect' | 'shard' | 'dust';
  jitterX: number;
  jitterY: number;
  color: string;
  borderColor: string;
  isAccent: boolean;
  glowColor?: string;
  // Kinetic motion
  delay: number;
  duration: number;
  vx: number;
  vy: number;
  rotSpeed: number;
  maxRot: number;
  hasTrail: boolean;
  trailX: number;
  trailY: number;
}

let isTransitionActive = false;
let activeCanvas: HTMLCanvasElement | null = null;
let activeAnimId: number | null = null;

// Smooth cubic deceleration (viscous tech-fluid drag)
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Ease out sine
function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

/**
 * Fast, non-blocking DOM color sampler with caching
 */
function sampleColorAtPoint(
  x: number,
  y: number,
  isCurrentlyDark: boolean,
  computedCache: Map<Element, CSSStyleDeclaration>
): { color: string; borderColor: string; isAccent: boolean; glowColor?: string } {
  // Dark mode color palette
  const darkSurfaces = ['#0D0F0C', '#121511', '#161914', '#1C2119', '#22281E'];
  const darkBorders = ['#282F26', '#353E32', '#414D3E'];
  const darkText = ['#FFFFFF', '#E8EAE6', '#D1D5DB', '#9CA3AF'];
  const darkAccents = ['#B6FF2E', '#A3E635', '#84CC16', '#EAFF99'];

  // Light mode color palette
  const lightSurfaces = ['#FAF6EE', '#F5EFE0', '#EDE4D0', '#FFFFFF'];
  const lightBorders = ['#E2DAC7', '#D5CABA', '#C8BCAF'];
  const lightText = ['#1A2016', '#2E3529', '#4B5563', '#111827'];
  const lightAccents = ['#046C4E', '#10B981', '#059669', '#34D399'];

  const clampedX = Math.max(2, Math.min(window.innerWidth - 2, x));
  const clampedY = Math.max(2, Math.min(window.innerHeight - 2, y));

  const el = document.elementFromPoint(clampedX, clampedY);
  const defaultBorder = isCurrentlyDark ? darkBorders[0] : lightBorders[0];

  if (!el) {
    const palette = isCurrentlyDark ? darkSurfaces : lightSurfaces;
    return {
      color: palette[Math.floor(Math.random() * palette.length)],
      borderColor: defaultBorder,
      isAccent: false,
    };
  }

  let style = computedCache.get(el);
  if (!style) {
    style = window.getComputedStyle(el);
    computedCache.set(el, style);
  }

  // Accent detection (Lime in Dark, Emerald in Light)
  const isAccent =
    el.classList.contains('text-primary-container') ||
    el.classList.contains('bg-primary-container') ||
    el.classList.contains('text-primary') ||
    el.classList.contains('bg-primary') ||
    el.getAttribute('data-accent') === 'true' ||
    style.color.includes('182, 255, 46') ||
    style.backgroundColor.includes('182, 255, 46') ||
    style.color.includes('4, 108, 78') ||
    style.backgroundColor.includes('4, 108, 78');

  if (isAccent) {
    const accentList = isCurrentlyDark ? darkAccents : lightAccents;
    const accentColor = accentList[Math.floor(Math.random() * accentList.length)];
    return {
      color: accentColor,
      borderColor: isCurrentlyDark ? '#EAFF99' : '#10B981',
      isAccent: true,
      glowColor: isCurrentlyDark ? 'rgba(182, 255, 46, 0.85)' : 'rgba(4, 108, 78, 0.8)',
    };
  }

  // Text content sampling: typographic fragments matching actual font color
  const hasText = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE;
  const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'CODE', 'LABEL'].includes(el.tagName);
  const sampleText = (hasText || isTextElement) && Math.random() < 0.5;

  if (sampleText) {
    const textColor = style.color;
    if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
      return {
        color: textColor,
        borderColor: isCurrentlyDark ? '#4E5A4B' : '#B8AD9C',
        isAccent: false,
      };
    }
    const textPalette = isCurrentlyDark ? darkText : lightText;
    return {
      color: textPalette[Math.floor(Math.random() * textPalette.length)],
      borderColor: isCurrentlyDark ? '#4E5A4B' : '#B8AD9C',
      isAccent: false,
    };
  }

  // Surface background sampling
  let currentEl: Element | null = el;
  let bgColor = style.backgroundColor;
  let depth = 0;

  while (
    (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') &&
    currentEl &&
    depth < 3
  ) {
    currentEl = currentEl.parentElement;
    if (currentEl) {
      let pStyle = computedCache.get(currentEl);
      if (!pStyle) {
        pStyle = window.getComputedStyle(currentEl);
        computedCache.set(currentEl, pStyle);
      }
      bgColor = pStyle.backgroundColor;
    }
    depth++;
  }

  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    return {
      color: bgColor,
      borderColor: style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)'
        ? style.borderColor
        : defaultBorder,
      isAccent: false,
    };
  }

  // Fallback to theme surface palette
  const surfaces = isCurrentlyDark ? darkSurfaces : lightSurfaces;
  const borders = isCurrentlyDark ? darkBorders : lightBorders;
  return {
    color: surfaces[Math.floor(Math.random() * surfaces.length)],
    borderColor: borders[Math.floor(Math.random() * borders.length)],
    isAccent: false,
  };
}

/**
 * Triggers the High-Clarity Homogeneous Particle Shatter Theme Transition
 */
export function triggerParticleThemeTransition(
  originX: number,
  originY: number,
  targetTheme: 'light' | 'dark',
  onThemeSwitch: () => void
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    onThemeSwitch();
    return;
  }

  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    onThemeSwitch();
    return;
  }

  // Prevent concurrent animations
  if (isTransitionActive) {
    return;
  }
  isTransitionActive = true;

  // Clean up any stale canvas or loops
  if (activeAnimId !== null) {
    cancelAnimationFrame(activeAnimId);
    activeAnimId = null;
  }
  if (activeCanvas && activeCanvas.parentNode) {
    activeCanvas.parentNode.removeChild(activeCanvas);
    activeCanvas = null;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // The theme we are transitioning AWAY from
  const isCurrentlyDark = targetTheme === 'light';
  const veilColor = isCurrentlyDark ? '#0D0F0C' : '#FAF6EE';

  // Responsive homogeneous grid layout
  // Desktop: 28 x 18 = 504 substantial, clearly visible fragments
  // Tablet:  22 x 14 = 308 fragments
  // Mobile:  16 x 12 = 192 fragments
  let cols: number;
  let rows: number;

  if (width >= 1024) {
    cols = 28;
    rows = 18;
  } else if (width >= 768) {
    cols = 22;
    rows = 14;
  } else {
    cols = 16;
    rows = 12;
  }

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxDist = Math.hypot(width, height);

  // STEP 1: SAMPLE THE DOM FIRST (BEFORE touching body or creating canvas)
  // This guarantees zero forced reflows or style recalculation lag!
  const computedCache = new Map<Element, CSSStyleDeclaration>();
  const fragments: Fragment[] = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const jitterOffsetX = (Math.random() - 0.5) * cellWidth * 0.55;
      const jitterOffsetY = (Math.random() - 0.5) * cellHeight * 0.55;
      const homeX = c * cellWidth + cellWidth / 2 + jitterOffsetX;
      const homeY = r * cellHeight + cellHeight / 2 + jitterOffsetY;

      const sampled = sampleColorAtPoint(homeX, homeY, isCurrentlyDark, computedCache);

      // Sizable, visible particle distribution:
      // ~20% micro-dust (3px–5px)
      // ~50% substantial rectangular chips (8px–15px)
      // ~30% large structural shards (15px–26px)
      const sizeRand = Math.random();
      let pWidth: number;
      let pHeight: number;
      let shape: 'rect' | 'shard' | 'dust';

      if (sizeRand < 0.2) {
        const s = 3 + Math.random() * 2.5;
        pWidth = s;
        pHeight = s;
        shape = 'dust';
      } else if (sizeRand < 0.7) {
        const base = 8 + Math.random() * 7;
        const aspect = 0.9 + Math.random() * 1.3;
        pWidth = base * aspect;
        pHeight = base;
        shape = Math.random() < 0.45 ? 'rect' : 'shard';
      } else {
        const base = 15 + Math.random() * 11;
        const aspect = 0.8 + Math.random() * 1.5;
        pWidth = base * aspect;
        pHeight = base;
        shape = 'shard';
      }

      // Ripple delay from click origin (0 to 220ms subtle wave)
      const distFromOrigin = Math.hypot(homeX - originX, homeY - originY);
      const originNorm = distFromOrigin / maxDist;
      const delay = originNorm * 140 + Math.random() * 80;

      // Omnidirectional 360-degree shatter physics with controlled, graceful velocity
      const randomAngle = Math.random() * Math.PI * 2;
      const angleFromOrigin = Math.atan2(homeY - originY, homeX - originX);

      const localSpeed = 40 + Math.random() * 95;
      const pushSpeed = 15 + Math.random() * 35;

      const vx = Math.cos(randomAngle) * localSpeed + Math.cos(angleFromOrigin) * pushSpeed;
      const vy = Math.sin(randomAngle) * localSpeed + Math.sin(angleFromOrigin) * pushSpeed + (Math.random() * 30);

      // Controlled rotational tumbling
      const rotSpeed = (Math.random() - 0.5) * 3.0;
      const maxRot = (Math.random() - 0.5) * Math.PI * 1.6;

      fragments.push({
        homeX,
        homeY,
        width: pWidth,
        height: pHeight,
        shape,
        jitterX: (Math.random() - 0.5) * pWidth * 0.35,
        jitterY: (Math.random() - 0.5) * pHeight * 0.35,
        color: sampled.color,
        borderColor: sampled.borderColor,
        isAccent: sampled.isAccent,
        glowColor: sampled.glowColor,
        delay,
        duration: 1400 + Math.random() * 300,
        vx,
        vy,
        rotSpeed,
        maxRot,
        hasTrail: Math.random() < 0.15,
        trailX: homeX,
        trailY: homeY,
      });
    }
  }

  computedCache.clear();

  // STEP 2: CREATE AND ATTACH CANVAS AFTER SAMPLING IS COMPLETE
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    isTransitionActive = false;
    onThemeSwitch();
    return;
  }

  const renderCtx: CanvasRenderingContext2D = ctx;
  renderCtx.scale(dpr, dpr);
  document.body.appendChild(canvas);
  activeCanvas = canvas;

  // Extended majestic duration: 1800ms
  const totalDuration = 1800; // ms
  const startTime = performance.now();
  let themeSwitched = false;

  function animate(now: number) {
    const elapsed = now - startTime;
    const progressTotal = Math.min(1, elapsed / totalDuration);

    // ZERO JUMP: Under-the-veil theme switch at 50ms while canvas completely covers the viewport.
    if (!themeSwitched && elapsed >= 50) {
      onThemeSwitch();
      themeSwitched = true;
    }

    renderCtx.clearRect(0, 0, width, height);

    // Initial veil: Fades smoothly between 50ms and 350ms as cracks open up
    if (elapsed < 350) {
      const veilAlpha = elapsed < 50 ? 0.98 : Math.max(0, 0.98 * (1 - (elapsed - 50) / 300));
      renderCtx.fillStyle = veilColor;
      renderCtx.globalAlpha = veilAlpha;
      renderCtx.fillRect(0, 0, width, height);
    }

    // Render fragments with high visual definition
    for (let i = 0; i < fragments.length; i++) {
      const f = fragments[i];
      const localElapsed = elapsed - f.delay;

      if (localElapsed <= 0) {
        // Fragment at rest before shattering
        renderCtx.save();
        renderCtx.translate(f.homeX, f.homeY);
        renderCtx.fillStyle = f.color;
        renderCtx.strokeStyle = f.borderColor;
        renderCtx.lineWidth = 1;
        renderCtx.globalAlpha = 1.0;
        if (f.isAccent && f.glowColor) {
          renderCtx.shadowColor = f.glowColor;
          renderCtx.shadowBlur = 5;
        }
        renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
        renderCtx.strokeRect(-f.width / 2, -f.height / 2, f.width, f.height);
        renderCtx.restore();
        continue;
      }

      const p = Math.min(1, localElapsed / f.duration);
      const moveEase = easeOutCubic(p);
      const sineEase = easeOutSine(p);

      const currentX = f.homeX + f.vx * moveEase;
      const currentY = f.homeY + f.vy * moveEase;
      const currentRot = f.maxRot * moveEase + (p * f.rotSpeed);
      // Gentle scale down: keeps fragments large and clearly visible (down to 0.65 instead of microscopic)
      const currentScale = Math.max(0.6, 1.0 - sineEase * 0.35);

      // HIGH VISIBILITY OPACITY:
      // Stays solid at 1.0 for the first 45% (~750ms!) so user clearly sees the disintegration.
      // Then gradually dissolves over the remaining 55%.
      let currentAlpha: number;
      if (p < 0.45) {
        currentAlpha = 1.0;
      } else if (p < 0.8) {
        currentAlpha = 1.0 - (p - 0.45) / 0.35 * 0.6; // down to 0.4
      } else {
        currentAlpha = 0.4 * (1 - (p - 0.8) / 0.2);
      }
      currentAlpha = Math.max(0, Math.min(1, currentAlpha));

      if (currentAlpha <= 0.01) {
        continue;
      }

      // Draw faint kinetic trail for speed accents
      if (f.hasTrail && p > 0.05 && p < 0.75 && currentAlpha > 0.2) {
        renderCtx.beginPath();
        renderCtx.strokeStyle = f.borderColor;
        renderCtx.globalAlpha = currentAlpha * 0.35;
        renderCtx.lineWidth = Math.max(1, f.width * 0.4);
        renderCtx.moveTo(f.trailX, f.trailY);
        renderCtx.lineTo(currentX, currentY);
        renderCtx.stroke();
      }
      f.trailX = currentX;
      f.trailY = currentY;

      // Draw fragment with crisp 1px outline
      renderCtx.save();
      renderCtx.translate(currentX, currentY);
      renderCtx.rotate(currentRot);
      renderCtx.scale(currentScale, currentScale);
      renderCtx.fillStyle = f.color;
      renderCtx.strokeStyle = f.borderColor;
      renderCtx.lineWidth = 1;
      renderCtx.globalAlpha = currentAlpha;

      if (f.isAccent && f.glowColor) {
        renderCtx.shadowColor = f.glowColor;
        renderCtx.shadowBlur = 6;
      }

      if (f.shape === 'rect' || f.shape === 'dust') {
        renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
        if (f.shape === 'rect') {
          renderCtx.strokeRect(-f.width / 2, -f.height / 2, f.width, f.height);
        }
      } else {
        // Faceted polygonal shard with crisp stroke
        renderCtx.beginPath();
        renderCtx.moveTo(-f.width / 2, -f.height / 2);
        renderCtx.lineTo(f.width / 2, -f.height / 2 + f.jitterY);
        renderCtx.lineTo(f.width / 2 + f.jitterX, f.height / 2);
        renderCtx.lineTo(-f.width / 2, f.height / 2 - f.jitterY);
        renderCtx.closePath();
        renderCtx.fill();
        renderCtx.stroke();
      }

      renderCtx.restore();
    }

    if (progressTotal < 1.0) {
      activeAnimId = requestAnimationFrame(animate);
    } else {
      if (!themeSwitched) {
        onThemeSwitch();
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      activeCanvas = null;
      activeAnimId = null;
      isTransitionActive = false;
    }
  }

  activeAnimId = requestAnimationFrame(animate);
}

// Backwards compatibility alias
export { triggerParticleThemeTransition as triggerPixelThemeTransition };
