/**
 * Fracture Cracks & Disintegration Theme Transition
 * 
 * 1. CRACKING PHASE (0ms – 320ms):
 *    - High-energy fracture fault lines spiderweb outward across the interface from click origin.
 *    - Particles display internal stress cracks and micro-tremors as the tension propagates.
 *    - Neon electric crack glow (#B6FF2E in Dark mode, #046C4E/#34D399 in Light mode).
 * 
 * 2. SHATTER BURST & RAPID TRANSITION (320ms – 850ms):
 *    - At 320ms, after the cracks spread across the screen, the theme transitions seamlessly underneath.
 *    - The cracked fragments burst outward along fracture fault lines.
 *    - Particles briskly disperse and vaporize into fine dust without lingering on the screen.
 *    - Clean, crisp completion by 900ms.
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
  // Internal crack fracture lines
  crackX1: number;
  crackY1: number;
  crackX2: number;
  crackY2: number;
  distFromOrigin: number;
  // Kinetic motion
  burstDelay: number;
  vx: number;
  vy: number;
  rotSpeed: number;
  maxRot: number;
}

interface CrackLine {
  x1: number;
  y1: number;
  midX: number;
  midY: number;
  x2: number;
  y2: number;
  distFromOrigin: number;
}

let isTransitionActive = false;
let activeCanvas: HTMLCanvasElement | null = null;
let activeAnimId: number | null = null;

// Smooth cubic deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Ease out quad
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
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
      glowColor: isCurrentlyDark ? 'rgba(182, 255, 46, 0.9)' : 'rgba(4, 108, 78, 0.85)',
    };
  }

  // Text content sampling
  const hasText = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE;
  const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'CODE', 'LABEL'].includes(el.tagName);
  const sampleText = (hasText || isTextElement) && Math.random() < 0.45;

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
 * Triggers the Fracture Cracks & Disintegration Theme Transition
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
  const crackGlowColor = isCurrentlyDark ? '#B6FF2E' : '#046C4E';
  const crackCoreColor = isCurrentlyDark ? '#FFFFFF' : '#34D399';

  // Responsive homogeneous grid layout
  // Desktop: 30 x 20 = 600 fragments
  // Tablet:  24 x 16 = 384 fragments
  // Mobile:  18 x 14 = 252 fragments
  let cols: number;
  let rows: number;

  if (width >= 1024) {
    cols = 30;
    rows = 20;
  } else if (width >= 768) {
    cols = 24;
    rows = 16;
  } else {
    cols = 18;
    rows = 14;
  }

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxDist = Math.hypot(width, height);

  // STEP 1: SAMPLE THE DOM BEFORE TOUCHING THE BODY (ZERO LAG)
  const computedCache = new Map<Element, CSSStyleDeclaration>();
  const fragments: Fragment[] = [];
  const gridMap: Fragment[][] = Array.from({ length: cols }, () => []);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const jitterOffsetX = (Math.random() - 0.5) * cellWidth * 0.55;
      const jitterOffsetY = (Math.random() - 0.5) * cellHeight * 0.55;
      const homeX = c * cellWidth + cellWidth / 2 + jitterOffsetX;
      const homeY = r * cellHeight + cellHeight / 2 + jitterOffsetY;

      const sampled = sampleColorAtPoint(homeX, homeY, isCurrentlyDark, computedCache);

      // Particle size distribution:
      // ~20% micro-dust (3px–5px)
      // ~50% rectangular chips (8px–14px)
      // ~30% structural shards (14px–24px)
      const sizeRand = Math.random();
      let pWidth: number;
      let pHeight: number;
      let shape: 'rect' | 'shard' | 'dust';

      if (sizeRand < 0.2) {
        const s = 3 + Math.random() * 2;
        pWidth = s;
        pHeight = s;
        shape = 'dust';
      } else if (sizeRand < 0.7) {
        const base = 8 + Math.random() * 6;
        const aspect = 0.9 + Math.random() * 1.3;
        pWidth = base * aspect;
        pHeight = base;
        shape = Math.random() < 0.5 ? 'rect' : 'shard';
      } else {
        const base = 14 + Math.random() * 10;
        const aspect = 0.8 + Math.random() * 1.4;
        pWidth = base * aspect;
        pHeight = base;
        shape = 'shard';
      }

      const distFromOrigin = Math.hypot(homeX - originX, homeY - originY);
      const originNorm = distFromOrigin / maxDist;

      // Crack burst wave timing
      const burstDelay = originNorm * 80 + Math.random() * 50;

      // Shatter velocity vectors
      const randomAngle = Math.random() * Math.PI * 2;
      const angleFromOrigin = Math.atan2(homeY - originY, homeX - originX);
      const localSpeed = 60 + Math.random() * 120;
      const pushSpeed = 20 + Math.random() * 50;

      const vx = Math.cos(randomAngle) * localSpeed + Math.cos(angleFromOrigin) * pushSpeed;
      const vy = Math.sin(randomAngle) * localSpeed + Math.sin(angleFromOrigin) * pushSpeed + (Math.random() * 40);

      const rotSpeed = (Math.random() - 0.5) * 4.0;
      const maxRot = (Math.random() - 0.5) * Math.PI * 1.8;

      // Internal crack fault line inside the particle
      const crackAngle = Math.random() * Math.PI;
      const crackLen = Math.max(pWidth, pHeight) * 0.8;
      const crackX1 = -Math.cos(crackAngle) * crackLen * 0.5;
      const crackY1 = -Math.sin(crackAngle) * crackLen * 0.5;
      const crackX2 = Math.cos(crackAngle) * crackLen * 0.5;
      const crackY2 = Math.sin(crackAngle) * crackLen * 0.5;

      const frag: Fragment = {
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
        crackX1,
        crackY1,
        crackX2,
        crackY2,
        distFromOrigin,
        burstDelay,
        vx,
        vy,
        rotSpeed,
        maxRot,
      };

      fragments.push(frag);
      gridMap[c][r] = frag;
    }
  }

  // Precompute crack fracture network between adjacent cells
  const crackLines: CrackLine[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const f1 = gridMap[c][r];
      if (!f1) continue;

      // Horizontal connection
      if (c + 1 < cols && gridMap[c + 1][r]) {
        const f2 = gridMap[c + 1][r];
        const midX = (f1.homeX + f2.homeX) / 2 + (Math.random() - 0.5) * cellWidth * 0.35;
        const midY = (f1.homeY + f2.homeY) / 2 + (Math.random() - 0.5) * cellHeight * 0.35;
        const distFromOrigin = Math.hypot(midX - originX, midY - originY);
        crackLines.push({ x1: f1.homeX, y1: f1.homeY, midX, midY, x2: f2.homeX, y2: f2.homeY, distFromOrigin });
      }

      // Vertical connection
      if (r + 1 < rows && gridMap[c][r + 1]) {
        const f2 = gridMap[c][r + 1];
        const midX = (f1.homeX + f2.homeX) / 2 + (Math.random() - 0.5) * cellWidth * 0.35;
        const midY = (f1.homeY + f2.homeY) / 2 + (Math.random() - 0.5) * cellHeight * 0.35;
        const distFromOrigin = Math.hypot(midX - originX, midY - originY);
        crackLines.push({ x1: f1.homeX, y1: f1.homeY, midX, midY, x2: f2.homeX, y2: f2.homeY, distFromOrigin });
      }

      // Diagonal branching (40% probability for natural branching look)
      if (c + 1 < cols && r + 1 < rows && Math.random() < 0.4 && gridMap[c + 1][r + 1]) {
        const f2 = gridMap[c + 1][r + 1];
        const midX = (f1.homeX + f2.homeX) / 2 + (Math.random() - 0.5) * cellWidth * 0.4;
        const midY = (f1.homeY + f2.homeY) / 2 + (Math.random() - 0.5) * cellHeight * 0.4;
        const distFromOrigin = Math.hypot(midX - originX, midY - originY);
        crackLines.push({ x1: f1.homeX, y1: f1.homeY, midX, midY, x2: f2.homeX, y2: f2.homeY, distFromOrigin });
      }
    }
  }

  computedCache.clear();

  // STEP 2: CREATE AND MOUNT CANVAS
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

  // CHOREOGRAPHY TIMELINE (900ms TOTAL - NO LINGERING PARTICLES):
  // 0ms - 320ms:   Cracks spiderweb across the screen and stress-fracture particles
  // 320ms:         Fracture point -> theme switches underneath
  // 320ms - 850ms: Shatter burst -> particles rapidly disperse and vaporize into dust
  // 900ms:         Clean finish
  const CRACK_DURATION = 320; // ms
  const TOTAL_DURATION = 920; // ms
  const startTime = performance.now();
  let themeSwitched = false;

  function animate(now: number) {
    const elapsed = now - startTime;
    const progressTotal = Math.min(1, elapsed / TOTAL_DURATION);

    // Switch theme under the cracked veil right at the fracture point (320ms)
    if (!themeSwitched && elapsed >= CRACK_DURATION) {
      onThemeSwitch();
      themeSwitched = true;
    }

    renderCtx.clearRect(0, 0, width, height);

    // Solid veil during cracking phase, dissolving smoothly between 320ms and 500ms
    if (elapsed < 500) {
      const veilAlpha = elapsed < CRACK_DURATION
        ? 0.98
        : Math.max(0, 0.98 * (1 - (elapsed - CRACK_DURATION) / 180));
      renderCtx.fillStyle = veilColor;
      renderCtx.globalAlpha = veilAlpha;
      renderCtx.fillRect(0, 0, width, height);
    }

    // ==========================================
    // PHASE 1: RENDER CRACK FRACTURE NETWORK
    // ==========================================
    // Crack wave spreads from origin outward across the screen
    const crackWaveRadius = Math.min(maxDist * 1.15, (elapsed / (CRACK_DURATION * 0.85)) * maxDist);

    if (elapsed < CRACK_DURATION + 180) {
      const crackFade = elapsed > CRACK_DURATION
        ? Math.max(0, 1 - (elapsed - CRACK_DURATION) / 180)
        : 1.0;

      renderCtx.save();
      renderCtx.lineWidth = 1.5;

      for (let i = 0; i < crackLines.length; i++) {
        const line = crackLines[i];
        if (line.distFromOrigin <= crackWaveRadius) {
          // Line intensity peaks right as wave passes
          const waveDelta = crackWaveRadius - line.distFromOrigin;
          const lineAlpha = Math.min(1, waveDelta / 80) * crackFade;

          if (lineAlpha > 0.05) {
            // Neon crack glow pass
            renderCtx.strokeStyle = crackGlowColor;
            renderCtx.shadowColor = crackGlowColor;
            renderCtx.shadowBlur = 6;
            renderCtx.globalAlpha = lineAlpha * 0.85;

            renderCtx.beginPath();
            renderCtx.moveTo(line.x1, line.y1);
            renderCtx.lineTo(line.midX, line.midY);
            renderCtx.lineTo(line.x2, line.y2);
            renderCtx.stroke();

            // Bright core hairline
            renderCtx.strokeStyle = crackCoreColor;
            renderCtx.shadowBlur = 0;
            renderCtx.globalAlpha = lineAlpha * 0.95;
            renderCtx.lineWidth = 1;
            renderCtx.beginPath();
            renderCtx.moveTo(line.x1, line.y1);
            renderCtx.lineTo(line.midX, line.midY);
            renderCtx.lineTo(line.x2, line.y2);
            renderCtx.stroke();
          }
        }
      }
      renderCtx.restore();
    }

    // ==========================================
    // PHASE 2: RENDER PARTICLES & SHATTER
    // ==========================================
    const isShattered = elapsed >= CRACK_DURATION;

    for (let i = 0; i < fragments.length; i++) {
      const f = fragments[i];

      if (!isShattered) {
        // --- CRACKING STAGE ---
        // Particle is resting in place.
        // If crack wave has reached it, show micro-tremor and internal crack cut!
        const hasCrackReached = f.distFromOrigin <= crackWaveRadius;
        const tremorX = hasCrackReached ? (Math.random() - 0.5) * 1.8 : 0;
        const tremorY = hasCrackReached ? (Math.random() - 0.5) * 1.8 : 0;

        renderCtx.save();
        renderCtx.translate(f.homeX + tremorX, f.homeY + tremorY);

        renderCtx.fillStyle = f.color;
        renderCtx.strokeStyle = hasCrackReached ? crackGlowColor : f.borderColor;
        renderCtx.lineWidth = hasCrackReached ? 1.5 : 1;
        renderCtx.globalAlpha = 1.0;

        if (hasCrackReached) {
          renderCtx.shadowColor = crackGlowColor;
          renderCtx.shadowBlur = 4;
        }

        renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
        renderCtx.strokeRect(-f.width / 2, -f.height / 2, f.width, f.height);

        // Draw internal fracture line through the particle
        if (hasCrackReached) {
          renderCtx.strokeStyle = crackCoreColor;
          renderCtx.lineWidth = 1;
          renderCtx.globalAlpha = 0.9;
          renderCtx.beginPath();
          renderCtx.moveTo(f.crackX1, f.crackY1);
          renderCtx.lineTo(f.crackX2, f.crackY2);
          renderCtx.stroke();
        }

        renderCtx.restore();
      } else {
        // --- SHATTER BURST STAGE ---
        // Rapid, punchy dispersal: fragments burst outward and quickly vaporize
        const burstElapsed = (elapsed - CRACK_DURATION) - f.burstDelay;
        if (burstElapsed <= 0) {
          // Still at home right before burst
          renderCtx.save();
          renderCtx.translate(f.homeX, f.homeY);
          renderCtx.fillStyle = f.color;
          renderCtx.strokeStyle = f.borderColor;
          renderCtx.lineWidth = 1;
          renderCtx.globalAlpha = 1.0;
          renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
          renderCtx.strokeRect(-f.width / 2, -f.height / 2, f.width, f.height);
          renderCtx.restore();
          continue;
        }

        const burstDuration = 480; // ms: fast, clean dispersal (does NOT linger!)
        const p = Math.min(1, burstElapsed / burstDuration);
        const moveEase = easeOutCubic(p);
        const alphaEase = easeOutQuad(p);

        const currentX = f.homeX + f.vx * moveEase;
        const currentY = f.homeY + f.vy * moveEase;
        const currentRot = f.maxRot * moveEase + (p * f.rotSpeed);
        const currentScale = Math.max(0.3, 1.0 - moveEase * 0.6);

        // Fast clean fade out: no lingering particles on screen!
        let currentAlpha: number;
        if (p < 0.2) {
          currentAlpha = 1.0;
        } else if (p < 0.65) {
          currentAlpha = 1.0 - (p - 0.2) / 0.45 * 0.7; // down to 0.3
        } else {
          currentAlpha = 0.3 * (1 - (p - 0.65) / 0.35);
        }
        currentAlpha = Math.max(0, Math.min(1, currentAlpha * (1 - alphaEase * 0.15)));

        if (currentAlpha <= 0.01) {
          continue;
        }

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
          renderCtx.shadowBlur = 5;
        }

        if (f.shape === 'rect' || f.shape === 'dust') {
          renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
          if (f.shape === 'rect') {
            renderCtx.strokeRect(-f.width / 2, -f.height / 2, f.width, f.height);
          }
        } else {
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
