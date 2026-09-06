/**
 * Pixel Theme Transition
 * Spectacular full-screen 8-bit / cyber square pixel particle explosion
 * blasting outwards from the theme toggle switch button across the entire viewport.
 */

interface PixelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  alpha: number;
  decay: number;
  drag: number;
  gravity: number;
  isGlitch?: boolean;
}

interface PixelWave {
  radius: number;
  maxRadius: number;
  speed: number;
  blockSize: number;
  color: string;
  alpha: number;
  decay: number;
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

  // Max distance from origin to viewport corners
  const maxDistance = Math.hypot(
    Math.max(originX, width - originX),
    Math.max(originY, height - originY)
  );

  // Clean, cohesive minimalist palette: Signature Lime + Crisp White + Deep Charcoal
  const palette = targetTheme === 'light'
    ? ['#B6FF2E', '#FFFFFF', '#191C1D', 'rgba(182, 255, 46, 0.85)']
    : ['#B6FF2E', '#FFFFFF', '#111318', 'rgba(182, 255, 46, 0.85)'];

  // Generate 220-280 clean square pixel particles
  const particleCount = Math.min(260, Math.floor(Math.max(width, height) / 4.5));
  const particles: PixelParticle[] = [];

  const possibleSizes = [4, 6, 8, 12, 16, 20, 28];

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() < 0.35 
      ? Math.random() * 24 + 12 // Fast primary blast
      : Math.random() * 14 + 4; // Ambient wave

    const size = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];
    const color = palette[Math.floor(Math.random() * palette.length)];

    particles.push({
      x: originX + (Math.random() - 0.5) * 16,
      y: originY + (Math.random() - 0.5) * 16,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      rotation: 0, // Clean axis-aligned digital pixels, no tilted confetti
      vRot: 0,
      color,
      alpha: 1.0,
      decay: Math.random() * 0.018 + 0.014,
      drag: 0.965,
      gravity: 0, // Zero gravity for crisp radial digital blast
      isGlitch: Math.random() < 0.12,
    });
  }

  // Expanding digital pixel shockwaves in unified signature lime
  const waves: PixelWave[] = [
    {
      radius: 0,
      maxRadius: maxDistance + 80,
      speed: 40,
      blockSize: 16,
      color: '#B6FF2E',
      alpha: 0.8,
      decay: 0.02,
    },
    {
      radius: -45, // slight delay
      maxRadius: maxDistance + 80,
      speed: 48,
      blockSize: 20,
      color: '#FFFFFF',
      alpha: 0.7,
      decay: 0.018,
    },
  ];

  let frame = 0;
  let themeSwitched = false;
  const startTime = performance.now();

  function animate(now: number) {
    frame++;

    // Switch theme at frame 3 (~50ms) right as the explosion blankets the switch
    if (!themeSwitched && frame >= 3) {
      onThemeSwitch();
      themeSwitched = true;
    }

    renderCtx.clearRect(0, 0, width, height);

    let hasActiveElements = false;

    // 1. Draw and update expanding pixelated shockwaves
    for (const wave of waves) {
      wave.radius += wave.speed;
      if (wave.radius > 0 && wave.radius < wave.maxRadius && wave.alpha > 0.02) {
        hasActiveElements = true;
        renderCtx.fillStyle = wave.color;

        const circumference = 2 * Math.PI * wave.radius;
        const stepCount = Math.max(16, Math.floor(circumference / (wave.blockSize * 1.6)));
        const angleStep = (Math.PI * 2) / stepCount;

        for (let i = 0; i < stepCount; i++) {
          // Pixelate to discrete grid
          const angle = i * angleStep;
          const rawX = originX + Math.cos(angle) * wave.radius;
          const rawY = originY + Math.sin(angle) * wave.radius;

          const gridX = Math.round(rawX / wave.blockSize) * wave.blockSize;
          const gridY = Math.round(rawY / wave.blockSize) * wave.blockSize;

          // Pseudo-random stutter for authentic cyber pixel breakup
          if ((i + frame) % 5 === 0) continue;

          renderCtx.globalAlpha = Math.max(0, wave.alpha * (1 - wave.radius / wave.maxRadius));
          renderCtx.fillRect(gridX, gridY, wave.blockSize, wave.blockSize);
        }

        wave.alpha -= wave.decay;
      }
    }

    // 2. Draw and update pixel particles (square shards)
    for (const p of particles) {
      if (p.alpha > 0.02) {
        hasActiveElements = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        // Snap to nearest integer pixel for razor-sharp retro rendering
        const drawSize = Math.max(2, Math.round(p.size * Math.max(0.2, p.alpha)));
        const drawX = Math.round(p.x - drawSize / 2);
        const drawY = Math.round(p.y - drawSize / 2);

        renderCtx.fillStyle = p.color;
        // Glitch flicker effect on select particles
        renderCtx.globalAlpha = p.isGlitch && frame % 2 === 0 ? p.alpha * 0.4 : Math.max(0, p.alpha);

        // Crisp square pixel drawing
        renderCtx.fillRect(drawX, drawY, drawSize, drawSize);

        // Subtle clean luminous accent on medium/large pixels
        if (drawSize >= 12) {
          renderCtx.strokeStyle = 'rgba(182, 255, 46, 0.5)';
          renderCtx.lineWidth = 1;
          renderCtx.strokeRect(drawX + 0.5, drawY + 0.5, drawSize - 1, drawSize - 1);
        }
      }
    }

    // Max 1200ms hard stop or finish when particles have dissolved
    const elapsed = now - startTime;
    if (hasActiveElements && elapsed < 1200) {
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
