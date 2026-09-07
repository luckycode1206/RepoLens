/**
 * Homogeneous Particle Shatter & Disintegration Theme Transition
 * 
 * Solves:
 * 1. Homogeneous Shatter: Particles are uniformly distributed across the entire screen
 *    (top, bottom, left, right, center, corners) and shatter outward in all directions.
 * 2. Zero Sudden Jump: At t=40ms, a seamless canvas veil masks the DOM theme switch,
 *    and dissolves as fragments break away, revealing the new theme smoothly through the cracks.
 * 3. High Performance: High-DPI canvas, requestAnimationFrame, zero external dependencies,
 *    subtle kinetic trails, independent rotation, and micro-dust.
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

// Smooth ease out cubic
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Ease out quad
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Samples the visual color and element nature at a given screen coordinate.
 */
function sampleColorAtPoint(
  x: number,
  y: number,
  isCurrentlyDark: boolean,
  computedCache: Map<Element, CSSStyleDeclaration>
): { color: string; isAccent: boolean; glowColor?: string } {
  // Dark mode color palette
  const darkSurfaces = ['#0D0F0C', '#121511', '#161914', '#1B2018', '#20261C'];
  const darkBorders = ['#282F26', '#353E32'];
  const darkText = ['#E8EAE6', '#D1D5DB', '#9CA3AF', '#F3F4F6'];
  const darkAccents = ['#B6FF2E', '#A3E635', '#84CC16', '#EAFF99'];

  // Light mode color palette
  const lightSurfaces = ['#FAF6EE', '#F5EFE0', '#EFE7D4', '#FFFFFF'];
  const lightBorders = ['#E2DAC7', '#D5CABA'];
  const lightText = ['#1A2016', '#2E3529', '#4B5563', '#111827'];
  const lightAccents = ['#046C4E', '#10B981', '#059669', '#34D399'];

  const clampedX = Math.max(2, Math.min(window.innerWidth - 2, x));
  const clampedY = Math.max(2, Math.min(window.innerHeight - 2, y));

  const el = document.elementFromPoint(clampedX, clampedY);
  if (!el) {
    const palette = isCurrentlyDark ? darkSurfaces : lightSurfaces;
    return {
      color: palette[Math.floor(Math.random() * palette.length)],
      isAccent: false,
    };
  }

  let style = computedCache.get(el);
  if (!style) {
    style = window.getComputedStyle(el);
    computedCache.set(el, style);
  }

  // Check if element has accent cues (Lime in Dark, Emerald in Light)
  const isAccentElement =
    el.classList.contains('text-primary-container') ||
    el.classList.contains('bg-primary-container') ||
    el.classList.contains('text-primary') ||
    el.classList.contains('bg-primary') ||
    el.getAttribute('data-accent') === 'true' ||
    style.color.includes('182, 255, 46') ||
    style.backgroundColor.includes('182, 255, 46') ||
    style.color.includes('4, 108, 78') ||
    style.backgroundColor.includes('4, 108, 78');

  if (isAccentElement) {
    const accentList = isCurrentlyDark ? darkAccents : lightAccents;
    const accentColor = accentList[Math.floor(Math.random() * accentList.length)];
    return {
      color: accentColor,
      isAccent: true,
      glowColor: isCurrentlyDark ? 'rgba(182, 255, 46, 0.7)' : 'rgba(4, 108, 78, 0.65)',
    };
  }

  // Check if particle lands on text content or icon
  const hasText = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE;
  const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'CODE', 'LABEL'].includes(el.tagName);
  const sampleText = (hasText || isTextElement) && Math.random() < 0.45;

  if (sampleText) {
    const textColor = style.color;
    if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
      return {
        color: textColor,
        isAccent: false,
      };
    }
    const textPalette = isCurrentlyDark ? darkText : lightText;
    return {
      color: textPalette[Math.floor(Math.random() * textPalette.length)],
      isAccent: false,
    };
  }

  // Check background color, climbing parents if transparent
  let currentEl: Element | null = el;
  let bgColor = style.backgroundColor;
  let depth = 0;

  while (
    (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') &&
    currentEl &&
    depth < 4
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
      isAccent: false,
    };
  }

  // Check border color with small probability
  if (Math.random() < 0.12 && style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)') {
    return {
      color: style.borderColor,
      isAccent: false,
    };
  }

  // Fallback to surface color palette
  const surfaces = isCurrentlyDark ? darkSurfaces : lightSurfaces;
  const borders = isCurrentlyDark ? darkBorders : lightBorders;
  const useBorder = Math.random() < 0.15;
  const selected = useBorder
    ? borders[Math.floor(Math.random() * borders.length)]
    : surfaces[Math.floor(Math.random() * surfaces.length)];

  return {
    color: selected,
    isAccent: false,
  };
}

/**
 * Triggers the Homogeneous Particle Shatter Theme Transition
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
  // Desktop: 42 x 28 = ~1176 fragments
  // Tablet:  30 x 22 = ~660 fragments
  // Mobile:  22 x 18 = ~396 fragments
  let cols: number;
  let rows: number;

  if (width >= 1024) {
    cols = 42;
    rows = 28;
  } else if (width >= 768) {
    cols = 30;
    rows = 22;
  } else {
    cols = 22;
    rows = 18;
  }

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxDist = Math.hypot(width, height);

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

  const computedCache = new Map<Element, CSSStyleDeclaration>();
  const fragments: Fragment[] = [];

  // Generate particles evenly across every part of the screen
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // Position within each cell with subtle natural jitter
      const jitterOffsetX = (Math.random() - 0.5) * cellWidth * 0.7;
      const jitterOffsetY = (Math.random() - 0.5) * cellHeight * 0.7;
      const homeX = c * cellWidth + cellWidth / 2 + jitterOffsetX;
      const homeY = r * cellHeight + cellHeight / 2 + jitterOffsetY;

      // Sample color directly from the visible DOM at this spot
      const sampled = sampleColorAtPoint(homeX, homeY, isCurrentlyDark, computedCache);

      // Particle size distribution:
      // ~35% tiny dust (2-3.5px)
      // ~45% medium chips (5-8px)
      // ~20% larger UI fragments (9-14px)
      const sizeRand = Math.random();
      let pWidth: number;
      let pHeight: number;
      let shape: 'rect' | 'shard' | 'dust';

      if (sizeRand < 0.35) {
        const s = 2 + Math.random() * 1.5;
        pWidth = s;
        pHeight = s;
        shape = 'dust';
      } else if (sizeRand < 0.8) {
        const base = 4.5 + Math.random() * 3.5;
        const aspect = 0.8 + Math.random() * 1.2;
        pWidth = base * aspect;
        pHeight = base;
        shape = Math.random() < 0.5 ? 'rect' : 'shard';
      } else {
        const base = 8 + Math.random() * 5;
        const aspect = 0.7 + Math.random() * 1.4;
        pWidth = base * aspect;
        pHeight = base;
        shape = 'shard';
      }

      // Distance from theme toggle trigger button for subtle ripple timing
      const distFromOrigin = Math.hypot(homeX - originX, homeY - originY);
      const originNorm = distFromOrigin / maxDist;
      const delay = originNorm * 120 + Math.random() * 70; // 0 to 190ms subtle wave

      // Homogeneous shatter vectors:
      // 1. Omnidirectional 360-degree local explosion (every particle shatters in its own direction)
      // 2. Subtle radial push outward from click origin
      // 3. Gentle vertical drift
      const randomAngle = Math.random() * Math.PI * 2;
      const angleFromOrigin = Math.atan2(homeY - originY, homeX - originX);

      const localSpeed = 50 + Math.random() * 130;
      const pushSpeed = 15 + Math.random() * 45;

      const vx = Math.cos(randomAngle) * localSpeed + Math.cos(angleFromOrigin) * pushSpeed;
      const vy = Math.sin(randomAngle) * localSpeed + Math.sin(angleFromOrigin) * pushSpeed + (Math.random() * 40);

      const rotSpeed = (Math.random() - 0.5) * 4.5;
      const maxRot = (Math.random() - 0.5) * Math.PI * 2;

      fragments.push({
        homeX,
        homeY,
        width: pWidth,
        height: pHeight,
        shape,
        jitterX: (Math.random() - 0.5) * pWidth * 0.4,
        jitterY: (Math.random() - 0.5) * pHeight * 0.4,
        color: sampled.color,
        isAccent: sampled.isAccent,
        glowColor: sampled.glowColor,
        delay,
        duration: 900 + Math.random() * 250,
        vx,
        vy,
        rotSpeed,
        maxRot,
        hasTrail: Math.random() < 0.12,
        trailX: homeX,
        trailY: homeY,
      });
    }
  }

  // Clear sampling cache
  computedCache.clear();

  const totalDuration = 1150; // ms
  const startTime = performance.now();
  let themeSwitched = false;

  function animate(now: number) {
    const elapsed = now - startTime;
    const progressTotal = Math.min(1, elapsed / totalDuration);

    // ZERO JUMP: Switch the underlying DOM at 40ms while the canvas completely covers the screen.
    // The user never sees a sudden page change; the new theme is revealed purely through the cracks.
    if (!themeSwitched && elapsed >= 40) {
      onThemeSwitch();
      themeSwitched = true;
    }

    renderCtx.clearRect(0, 0, width, height);

    // Initial veil: Fades out smoothly from t=40ms to t=240ms as cracks widen
    if (elapsed < 240) {
      const veilAlpha = elapsed < 40 ? 0.98 : Math.max(0, 0.98 * (1 - (elapsed - 40) / 200));
      renderCtx.fillStyle = veilColor;
      renderCtx.globalAlpha = veilAlpha;
      renderCtx.fillRect(0, 0, width, height);
    }

    // Render each fragment
    for (let i = 0; i < fragments.length; i++) {
      const f = fragments[i];
      const localElapsed = elapsed - f.delay;

      if (localElapsed <= 0) {
        // Fragment at rest at its home position before shattering
        renderCtx.save();
        renderCtx.translate(f.homeX, f.homeY);
        renderCtx.fillStyle = f.color;
        renderCtx.globalAlpha = 1.0;
        if (f.isAccent && f.glowColor) {
          renderCtx.shadowColor = f.glowColor;
          renderCtx.shadowBlur = 4;
        }
        renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
        renderCtx.restore();
        continue;
      }

      const p = Math.min(1, localElapsed / f.duration);
      const moveEase = easeOutCubic(p);
      const alphaEase = easeOutQuad(p);

      const currentX = f.homeX + f.vx * moveEase;
      const currentY = f.homeY + f.vy * moveEase;
      const currentRot = f.maxRot * moveEase + (p * f.rotSpeed);
      const currentScale = Math.max(0.2, 1.0 - moveEase * 0.7);

      // Smooth opacity fade: stays solid initially, then dissolves cleanly into dust
      let currentAlpha: number;
      if (p < 0.25) {
        currentAlpha = 1.0;
      } else if (p < 0.75) {
        currentAlpha = 1.0 - (p - 0.25) / 0.5 * 0.65; // down to 0.35
      } else {
        currentAlpha = 0.35 * (1 - (p - 0.75) / 0.25);
      }
      currentAlpha = Math.max(0, Math.min(1, currentAlpha * (1 - alphaEase * 0.1)));

      if (currentAlpha <= 0.005) {
        continue;
      }

      // Draw faint kinetic streak for fast-moving particles
      if (f.hasTrail && p > 0.06 && p < 0.7 && currentAlpha > 0.15) {
        renderCtx.beginPath();
        renderCtx.strokeStyle = f.color;
        renderCtx.globalAlpha = currentAlpha * 0.3;
        renderCtx.lineWidth = Math.max(1, f.width * 0.6);
        renderCtx.moveTo(f.trailX, f.trailY);
        renderCtx.lineTo(currentX, currentY);
        renderCtx.stroke();
      }
      f.trailX = currentX;
      f.trailY = currentY;

      // Draw fragment
      renderCtx.save();
      renderCtx.translate(currentX, currentY);
      renderCtx.rotate(currentRot);
      renderCtx.scale(currentScale, currentScale);
      renderCtx.fillStyle = f.color;
      renderCtx.globalAlpha = currentAlpha;

      if (f.isAccent && f.glowColor) {
        renderCtx.shadowColor = f.glowColor;
        renderCtx.shadowBlur = 5;
      }

      if (f.shape === 'rect' || f.shape === 'dust') {
        renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
      } else {
        renderCtx.beginPath();
        renderCtx.moveTo(-f.width / 2, -f.height / 2);
        renderCtx.lineTo(f.width / 2, -f.height / 2 + f.jitterY);
        renderCtx.lineTo(f.width / 2 + f.jitterX, f.height / 2);
        renderCtx.lineTo(-f.width / 2, f.height / 2 - f.jitterY);
        renderCtx.closePath();
        renderCtx.fill();
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
