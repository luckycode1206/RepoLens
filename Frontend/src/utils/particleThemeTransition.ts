/**
 * Particle Disintegration & Reassembly Theme Transition
 * 
 * Inspired by cinematic particle disintegration:
 * • DARK → LIGHT:
 *   - Dark interface breaks apart into 500–1400 small rectangular/irregular fragments
 *   - Fragments sample the visible dark UI elements (near-black surfaces, borders, text, lime accents)
 *   - Over ~1.2s, fragments tear away, rotate independently, scale down, and disperse outward (↘ ↓ ↙)
 *   - White/light page underneath becomes increasingly visible as dark flakes dissolve
 * 
 * • LIGHT → DARK:
 *   - Reverse transition: particles fly inward (↗ ↑ ↖) from dispersed positions
 *   - Rotate back toward alignment, increase opacity and scale, and converge/reconstruct the dark interface
 *   - Locks seamlessly into the fully rendered dark-mode page
 */

export interface ParticleThemeTransitionOptions {
  duration?: number;
  particleCount?: number;
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
  // Dynamic motion properties
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  startRot: number;
  targetRot: number;
  spinSpeed: number;
  startScale: number;
  targetScale: number;
  hasTrail: boolean;
  trailX: number;
  trailY: number;
}

let isTransitionActive = false;
let activeCanvas: HTMLCanvasElement | null = null;
let activeAnimId: number | null = null;

// Ease out cubic
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}


// Ease out back for snapping into alignment
function easeOutBack(t: number): number {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Samples the visual color and element nature at a given screen coordinate.
 */
function sampleColorAtPoint(
  x: number,
  y: number,
  isTargetLight: boolean,
  computedCache: Map<Element, CSSStyleDeclaration>
): { color: string; isAccent: boolean; glowColor?: string } {
  // Dark mode fallback palette
  const darkSurfaces = ['#0D0F0C', '#121511', '#161914', '#1B2018', '#1F251C'];
  const darkBorders = ['#282F26', '#353E32'];
  const darkText = ['#E8EAE6', '#D1D5DB', '#9CA3AF', '#F3F4F6'];
  const darkAccents = ['#B6FF2E', '#A3E635', '#84CC16', '#EAFF99'];

  // Light mode fallback palette
  const lightSurfaces = ['#FAF6EE', '#F5EFE0', '#EFE7D4', '#FFFFFF'];
  const lightBorders = ['#E2DAC7', '#D5CABA'];
  const lightText = ['#1A2016', '#2E3529', '#4B5563', '#111827'];
  const lightAccents = ['#046C4E', '#10B981', '#059669', '#34D399'];

  const clampedX = Math.max(2, Math.min(window.innerWidth - 2, x));
  const clampedY = Math.max(2, Math.min(window.innerHeight - 2, y));

  const el = document.elementFromPoint(clampedX, clampedY);
  if (!el) {
    const palette = isTargetLight ? darkSurfaces : lightSurfaces;
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
    const accentColor = isTargetLight
      ? darkAccents[Math.floor(Math.random() * darkAccents.length)]
      : (Math.random() < 0.75 ? darkAccents[0] : lightAccents[0]);
    return {
      color: accentColor,
      isAccent: true,
      glowColor: isTargetLight ? 'rgba(182, 255, 46, 0.7)' : 'rgba(182, 255, 46, 0.85)',
    };
  }

  // If particle lands on text content or icon
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
    const textPalette = isTargetLight ? darkText : lightText;
    return {
      color: textPalette[Math.floor(Math.random() * textPalette.length)],
      isAccent: false,
    };
  }

  // Check background color, climbing up parent if transparent
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
  const surfaces = isTargetLight ? darkSurfaces : lightSurfaces;
  const borders = isTargetLight ? darkBorders : lightBorders;
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
 * Triggers the Particle Disintegration & Reassembly Theme Transition
 * 
 * @param originX Horizontal center of click event
 * @param originY Vertical center of click event
 * @param targetTheme 'light' or 'dark'
 * @param onThemeSwitch Callback invoked to apply new theme to DOM
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

  // Transition safety: prevent concurrent animations
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

  // Responsive particle counts
  // Desktop: 800–1400 | Tablet: 500–800 | Mobile: 250–450
  let cols: number;
  let rows: number;

  if (width >= 1024) {
    cols = 38;
    rows = 28; // ~1064 particles
  } else if (width >= 768) {
    cols = 28;
    rows = 22; // ~616 particles
  } else {
    cols = 18;
    rows = 18; // ~324 particles
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

  const isTargetLight = targetTheme === 'light';
  const computedCache = new Map<Element, CSSStyleDeclaration>();
  const fragments: Fragment[] = [];

  // Generate particles across the viewport
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // Jittered position within the cell for natural organic fragmentation
      const jitterOffsetX = (Math.random() - 0.5) * cellWidth * 0.85;
      const jitterOffsetY = (Math.random() - 0.5) * cellHeight * 0.85;
      const homeX = c * cellWidth + cellWidth / 2 + jitterOffsetX;
      const homeY = r * cellHeight + cellHeight / 2 + jitterOffsetY;

      // Sample color directly from the visible DOM at this point
      const sampled = sampleColorAtPoint(homeX, homeY, isTargetLight, computedCache);

      // Particle size distribution:
      // ~45% tiny dust (2-4px)
      // ~40% medium chips (5-8px)
      // ~15% larger UI flakes (9-15px)
      const sizeRand = Math.random();
      let pWidth: number;
      let pHeight: number;
      let shape: 'rect' | 'shard' | 'dust';

      if (sizeRand < 0.45) {
        // Tiny dust
        const s = 2 + Math.random() * 2;
        pWidth = s;
        pHeight = s;
        shape = 'dust';
      } else if (sizeRand < 0.85) {
        // Medium rectangular chip
        const base = 4.5 + Math.random() * 3.5;
        const aspect = 0.8 + Math.random() * 1.4; // 1:1 up to 2:1
        pWidth = base * aspect;
        pHeight = base;
        shape = Math.random() < 0.5 ? 'rect' : 'shard';
      } else {
        // Larger UI fragment / flake
        const base = 8 + Math.random() * 6;
        const aspect = 0.7 + Math.random() * 1.6;
        pWidth = base * aspect;
        pHeight = base;
        shape = 'shard';
      }

      // Distance from theme toggle trigger button
      const distFromOrigin = Math.hypot(homeX - originX, homeY - originY);
      const originNorm = distFromOrigin / maxDist;

      // Trajectory parameters
      // Random angle with directional bias
      // DARK → LIGHT: Dispersal outward and downward (↘ ↓ ↙)
      // LIGHT → DARK: Inward convergence from outer dispersed positions (↗ ↑ ↖)
      const angleBias = Math.PI / 2 + (Math.random() - 0.5) * 1.2; // downward with tilt
      const travelDist = 90 + Math.random() * 260 + originNorm * 80;
      const moveX = Math.cos(angleBias) * travelDist + (homeX - originX) * 0.25;
      const moveY = Math.sin(angleBias) * travelDist + (Math.random() * 80);

      const rot = (Math.random() - 0.5) * Math.PI * 2.8; // -250° to +250°
      const spin = (Math.random() - 0.5) * 4;

      if (isTargetLight) {
        // DARK → LIGHT: Fragments start at home and break away (disintegrate)
        const delay = originNorm * 130 + Math.random() * 90; // 0 to 220ms wave
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
          startX: homeX,
          startY: homeY,
          targetX: homeX + moveX,
          targetY: homeY + moveY,
          startRot: 0,
          targetRot: rot,
          spinSpeed: spin,
          startScale: 1.0,
          targetScale: 0.25 + Math.random() * 0.2,
          hasTrail: Math.random() < 0.12,
          trailX: homeX,
          trailY: homeY,
        });
      } else {
        // LIGHT → DARK: Fragments fly inward from dispersed positions to reconstruct
        // Starts with light mode visible; dark flakes swarm inward (↗ ↑ ↖)
        const delay = (1 - originNorm) * 120 + Math.random() * 90;
        const scatterOffsetX = -moveX * 1.1 + (Math.random() - 0.5) * 60;
        const scatterOffsetY = moveY * 1.1 + (Math.random() * 60); // from lower/outer perimeter

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
          duration: 880 + Math.random() * 240,
          startX: homeX + scatterOffsetX,
          startY: homeY + scatterOffsetY,
          targetX: homeX,
          targetY: homeY,
          startRot: rot,
          targetRot: 0,
          spinSpeed: spin,
          startScale: 0.35 + Math.random() * 0.2,
          targetScale: 1.0,
          hasTrail: Math.random() < 0.12,
          trailX: homeX + scatterOffsetX,
          trailY: homeY + scatterOffsetY,
        });
      }
    }
  }

  // Clear sampling cache
  computedCache.clear();

  const totalDuration = 1200; // ms
  const startTime = performance.now();
  let themeSwitched = false;

  function animate(now: number) {
    const elapsed = now - startTime;
    const progressTotal = Math.min(1, elapsed / totalDuration);

    // Theme Switch Orchestration:
    // • Dark → Light: Switch underlying DOM at ~90ms as flakes start tearing apart,
    //   revealing the light page underneath as the dark pieces fly away.
    // • Light → Dark: Switch underlying DOM at ~720ms (60%) as converging fragments
    //   swarm together over the light page, locking into the reconstructed dark mode.
    if (!themeSwitched) {
      if (isTargetLight && elapsed >= 90) {
        onThemeSwitch();
        themeSwitched = true;
      } else if (!isTargetLight && elapsed >= 720) {
        onThemeSwitch();
        themeSwitched = true;
      }
    }

    renderCtx.clearRect(0, 0, width, height);

    for (let i = 0; i < fragments.length; i++) {
      const f = fragments[i];
      const localElapsed = elapsed - f.delay;

      if (localElapsed <= 0) {
        // Not yet active:
        if (isTargetLight) {
          // Dark → Light: Draw fragment resting at home before it tears away
          renderCtx.save();
          renderCtx.translate(f.homeX, f.homeY);
          renderCtx.fillStyle = f.color;
          renderCtx.globalAlpha = 1;
          if (f.isAccent && f.glowColor) {
            renderCtx.shadowColor = f.glowColor;
            renderCtx.shadowBlur = 4;
          }
          renderCtx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
          renderCtx.restore();
        }
        // For Light → Dark, particles don't show before their inward journey
        continue;
      }

      const p = Math.min(1, localElapsed / f.duration);

      let currentX: number;
      let currentY: number;
      let currentRot: number;
      let currentScale: number;
      let currentAlpha: number;

      if (isTargetLight) {
        // DARK → LIGHT (Disintegration):
        // 0–15%: subtle micro-jitter / tear
        // 15–75%: strong outward dispersal and scale down
        // 75–100%: fade away into dust
        const moveEase = easeOutCubic(p);
        currentX = f.startX + (f.targetX - f.startX) * moveEase;
        currentY = f.startY + (f.targetY - f.startY) * moveEase;
        currentRot = f.startRot + f.targetRot * moveEase + (p * f.spinSpeed);
        currentScale = f.startScale + (f.targetScale - f.startScale) * moveEase;

        if (p < 0.2) {
          currentAlpha = 1.0;
        } else if (p < 0.75) {
          currentAlpha = 1.0 - (p - 0.2) / 0.55 * 0.7; // down to 0.3
        } else {
          currentAlpha = 0.3 * (1 - (p - 0.75) / 0.25);
        }
      } else {
        // LIGHT → DARK (Reassembly / Convergence):
        // 0–65%: flying inward toward home positions
        // 65–85%: locking into alignment (easeOutBack)
        // 85–100%: seamlessly fusing into the dark background
        const moveEase = p < 0.85 ? easeOutCubic(p / 0.85) : 1.0;
        currentX = f.startX + (f.targetX - f.startX) * moveEase;
        currentY = f.startY + (f.targetY - f.startY) * moveEase;
        currentRot = f.startRot * (1 - easeOutBack(Math.min(1, p * 1.15)));
        currentScale = f.startScale + (f.targetScale - f.startScale) * moveEase;

        if (p < 0.2) {
          currentAlpha = p / 0.2 * 0.8;
        } else if (p < 0.8) {
          currentAlpha = 0.8 + (p - 0.2) / 0.6 * 0.2; // up to 1.0
        } else {
          // Softly fuse into the page as dark theme is now fully active underneath
          currentAlpha = 1.0 - (p - 0.8) / 0.2 * 0.95;
        }
      }

      currentAlpha = Math.max(0, Math.min(1, currentAlpha));

      // Draw faint kinetic trail for high-speed particles
      if (f.hasTrail && p > 0.08 && p < 0.75 && currentAlpha > 0.15) {
        renderCtx.beginPath();
        renderCtx.strokeStyle = f.color;
        renderCtx.globalAlpha = currentAlpha * 0.25;
        renderCtx.lineWidth = Math.max(1, f.width * 0.6);
        renderCtx.moveTo(f.trailX, f.trailY);
        renderCtx.lineTo(currentX, currentY);
        renderCtx.stroke();
      }
      f.trailX = currentX;
      f.trailY = currentY;

      // Draw particle fragment
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
        // Irregular faceted shard polygon
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
      // Ensure theme switch is applied if anything fell through
      if (!themeSwitched) {
        onThemeSwitch();
      }
      // Clean up canvas
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
