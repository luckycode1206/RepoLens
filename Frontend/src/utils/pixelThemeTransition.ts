/**
 * Pixel Theme Transition
 * Stationary digital pixel dissolve wave expanding outward from the theme switch button.
 * 
 * - Strictly Black & White:
 *   • Switching to Light Mode -> Black pixel matrix blocks (#000000 / #111318)
 *   • Switching to Dark Mode  -> White pixel matrix blocks (#FFFFFF / #E2E2E9)
 * - Zero kinetic energy / physics: pixels are stationary on the screen grid,
 *   scaling and dissolving in place as the digital wave sweeps across the entire page.
 */

interface GridCell {
  x: number;
  y: number;
  size: number;
  delay: number;
}

let activeCanvas: HTMLCanvasElement | null = null;
let activeAnimId: number | null = null;

export function triggerPixelThemeTransition(
  originX: number,
  originY: number,
  targetTheme: 'light' | 'dark',
  onThemeSwitch: () => void
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    onThemeSwitch();
    return;
  }

  // Clean up any previous animation gracefully
  if (activeAnimId !== null) {
    cancelAnimationFrame(activeAnimId);
    activeAnimId = null;
  }
  if (activeCanvas && activeCanvas.parentNode) {
    activeCanvas.parentNode.removeChild(activeCanvas);
    activeCanvas = null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  canvas.style.imageRendering = 'pixelated';

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    onThemeSwitch();
    return;
  }

  const renderCtx: CanvasRenderingContext2D = ctx;
  renderCtx.scale(dpr, dpr);
  renderCtx.imageSmoothingEnabled = false;
  document.body.appendChild(canvas);
  activeCanvas = canvas;

  // Grid configuration for stationary digital pixels
  const GRID_SIZE = 24;
  const cols = Math.ceil(width / GRID_SIZE) + 1;
  const rows = Math.ceil(height / GRID_SIZE) + 1;

  // Colors: Strictly Black & White based on theme transition
  // • Switching to Light: Black pixels
  // • Switching to Dark: White pixels
  const isTargetLight = targetTheme === 'light';
  const primaryColor = isTargetLight ? '#000000' : '#FFFFFF';
  const accentColor = isTargetLight ? '#191C1D' : '#F0F0F5';

  const waveSpeed = 2.4; // px per millisecond sweep speed
  const cellDuration = 240; // ms duration each stationary pixel stays active

  // Precompute grid cells and their activation delay based on distance from button
  const cells: GridCell[] = [];
  let maxDelay = 0;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * GRID_SIZE;
      const y = r * GRID_SIZE;
      const centerX = x + GRID_SIZE / 2;
      const centerY = y + GRID_SIZE / 2;

      const dist = Math.hypot(centerX - originX, centerY - originY);
      // Dithered pseudo-random jitter for an authentic organic digital matrix wave
      const jitter = ((c * 43 + r * 79) % 25) * 4;
      const delay = dist / waveSpeed + jitter;

      if (delay > maxDelay) {
        maxDelay = delay;
      }

      cells.push({ x, y, size: GRID_SIZE, delay });
    }
  }

  let themeSwitched = false;
  const startTime = performance.now();

  function animate(now: number) {
    const elapsed = now - startTime;

    // Switch the underlying theme at 100ms as the wave front washes over the button
    if (!themeSwitched && elapsed >= 100) {
      onThemeSwitch();
      themeSwitched = true;
    }

    renderCtx.clearRect(0, 0, width, height);

    let hasActiveCells = false;

    // Draw stationary grid cells active at current timestamp
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const timeSinceActivation = elapsed - cell.delay;

      if (timeSinceActivation >= 0 && timeSinceActivation <= cellDuration) {
        hasActiveCells = true;
        const progress = timeSinceActivation / cellDuration;

        // Smooth pulse: ramp up quickly, then dissolve away
        let alpha: number;
        let scale: number;

        if (progress < 0.35) {
          const t = progress / 0.35;
          alpha = t;
          scale = t;
        } else {
          const t = (progress - 0.35) / 0.65;
          alpha = 1 - t;
          scale = 1 - t * 0.4;
        }

        const currentSize = Math.max(2, Math.round(cell.size * scale));
        // Stationary: perfectly centered at the cell's fixed grid position
        const drawX = Math.round(cell.x + (cell.size - currentSize) / 2);
        const drawY = Math.round(cell.y + (cell.size - currentSize) / 2);

        // Subtly alternate between pure black/white and slight depth contrast
        renderCtx.fillStyle = (i % 5 === 0) ? accentColor : primaryColor;
        renderCtx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.95));

        // Sharp axis-aligned square pixel block
        renderCtx.fillRect(drawX, drawY, currentSize, currentSize);
      }
    }

    // Continue animation until all cells have dissolved
    if (elapsed < maxDelay + cellDuration + 60 && (hasActiveCells || elapsed < maxDelay)) {
      activeAnimId = requestAnimationFrame(animate);
    } else {
      // Clean up canvas
      if (!themeSwitched) {
        onThemeSwitch();
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      activeCanvas = null;
      activeAnimId = null;
    }
  }

  activeAnimId = requestAnimationFrame(animate);
}
