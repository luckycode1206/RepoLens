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

  // Curated theme-specific palettes
  const lightPalette = [
    '#AFF825', // Lime Spark
    '#97DA00', // Vivid Lime
    '#064E3B', // Deep Emerald
    '#0B634D', // Mid Emerald
    '#FFFFFF', // Crisp White
    '#F8E7E9', // Champagne
    '#0284C7', // Cyber Cyan
    '#191C1D', // Charcoal Dark
  ];

  const darkPalette = [
    '#AFF825', // Lime Spark
    '#B6FF2E', // Electric Neon Lime
    '#FFFFFF', // Crisp White
    '#7BD0FF', // Vivid Cyan
    '#111318', // Obsidian
    '#1E2025', // Surface Charcoal
    '#FFB4AB', // Neon Coral
    '#38BDF8', // Sky Light
  ];

  const palette = targetTheme === 'light' ? lightPalette : darkPalette;

  // Generate 260-320 square pixel particles
  const particleCount = Math.min(320, Math.floor(Math.max(width, height) / 4));
  const particles: PixelParticle[] = [];

  const possibleSizes = [5, 8, 10, 14, 18, 24, 32, 40];

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Varying speeds: core burst (fast) + outer drifts
    const speed = Math.random() < 0.35 
      ? Math.random() * 26 + 14 // Ultra-fast blast particles
      : Math.random() * 16 + 5; // Ambient scatter

    const size = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];
    const color = palette[Math.floor(Math.random() * palette.length)];

    particles.push({
      x: originX + (Math.random() - 0.5) * 24,
      y: originY + (Math.random() - 0.5) * 24,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      rotation: (Math.floor(Math.random() * 4) * Math.PI) / 2, // 90-degree pixel turns or free
      vRot: (Math.random() - 0.5) * 0.15,
      color,
      alpha: 1.0,
      decay: Math.random() * 0.016 + 0.012,
      drag: 0.965,
      gravity: (Math.random() - 0.5) * 0.12, // subtle drift
      isGlitch: Math.random() < 0.15,
    });
  }

  // Generate expanding pixel wave shockwaves
  const waves: PixelWave[] = [
    {
      radius: 0,
      maxRadius: maxDistance + 100,
      speed: 38,
      blockSize: 16,
      color: targetTheme === 'light' ? '#064E3B' : '#AFF825',
      alpha: 0.9,
      decay: 0.018,
    },
    {
      radius: -40, // slight delay
      maxRadius: maxDistance + 100,
      speed: 46,
      blockSize: 24,
      color: targetTheme === 'light' ? '#AFF825' : '#7BD0FF',
      alpha: 0.85,
      decay: 0.016,
    },
    {
      radius: -90, // second delayed wave
      maxRadius: maxDistance + 100,
      speed: 54,
      blockSize: 32,
      color: targetTheme === 'light' ? '#FFFFFF' : '#B6FF2E',
      alpha: 0.75,
      decay: 0.015,
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
        const drawX = Math.round(p.x);
        const drawY = Math.round(p.y);
        const drawSize = Math.max(2, Math.round(p.size * Math.max(0.2, p.alpha)));

        renderCtx.save();
        renderCtx.translate(drawX, drawY);
        renderCtx.rotate(p.rotation);

        renderCtx.fillStyle = p.color;
        // Glitch flicker effect on select particles
        renderCtx.globalAlpha = p.isGlitch && frame % 2 === 0 ? p.alpha * 0.4 : Math.max(0, p.alpha);

        // Crisp square pixel drawing
        renderCtx.fillRect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);

        // Inner glowing core on larger particles
        if (drawSize >= 14) {
          renderCtx.fillStyle = '#FFFFFF';
          renderCtx.globalAlpha = p.alpha * 0.7;
          renderCtx.fillRect(-drawSize / 4, -drawSize / 4, drawSize / 2, drawSize / 2);
        }

        renderCtx.restore();
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
