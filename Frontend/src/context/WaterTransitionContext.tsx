import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ZoomTransitionContext,
  ZoomOrigin,
  OriginRect,
} from './waterTransitionDefinition';

type TransitionPhase = 'idle' | 'expanding' | 'settling';

function extractOrigin(origin?: ZoomOrigin | null): OriginRect {
  const fallbackWidth = Math.min(
    typeof window !== 'undefined' ? window.innerWidth * 0.45 : 360,
    380
  );
  const fallbackHeight = 56;
  const defaultRect: OriginRect = {
    top: typeof window !== 'undefined' ? (window.innerHeight - fallbackHeight) / 2 : 200,
    left: typeof window !== 'undefined' ? (window.innerWidth - fallbackWidth) / 2 : 200,
    width: fallbackWidth,
    height: fallbackHeight,
    borderRadius: '12px',
    title: 'RepoLens',
  };

  if (!origin) return defaultRect;

  // If already an OriginRect with coordinates
  if (
    'top' in origin &&
    'left' in origin &&
    'width' in origin &&
    'height' in origin &&
    typeof origin.top === 'number'
  ) {
    return {
      top: origin.top,
      left: origin.left,
      width: origin.width,
      height: origin.height,
      borderRadius: origin.borderRadius || '12px',
      title: origin.title,
      subtitle: origin.subtitle,
      badge: origin.badge,
    };
  }

  // If it's a mouse event or DOM element
  let el: HTMLElement | null = null;
  if ('currentTarget' in origin && origin.currentTarget instanceof HTMLElement) {
    el = origin.currentTarget;
  } else if ('target' in origin && origin.target instanceof HTMLElement) {
    el = origin.target;
  } else if (origin instanceof HTMLElement) {
    el = origin;
  }

  if (el) {
    // Locate the closest interactive card, table row, nav button, or link
    const container =
      (el.closest(
        '[data-zoom-origin], .group, a, button, tr, [role="button"], .cursor-pointer'
      ) as HTMLElement) || el;

    const r = container.getBoundingClientRect();
    const style = window.getComputedStyle(container);

    // Extract title / label
    const titleEl = container.querySelector(
      'h1, h2, h3, .font-heading, .font-mono.font-semibold, .font-code-md, .truncate, strong'
    );
    const rawTitle =
      container.getAttribute('data-zoom-label') ||
      container.getAttribute('title') ||
      titleEl?.textContent?.trim() ||
      container.textContent?.slice(0, 36)?.trim();

    // Extract subtitle
    const subEl = container.querySelector(
      '.text-xs, .font-body-sm, .font-code-sm, p'
    );
    const rawSub = subEl?.textContent?.trim();

    // Extract badge
    const badgeEl = container.querySelector(
      '.font-label-caps, [class*="uppercase"], [class*="badge"], [class*="rounded"]'
    );
    const rawBadge = badgeEl?.textContent?.trim();

    return {
      top: Math.max(0, r.top),
      left: Math.max(0, r.left),
      width: Math.max(24, r.width),
      height: Math.max(24, r.height),
      borderRadius: style.borderRadius || '12px',
      title: rawTitle && rawTitle.length < 50 ? rawTitle : undefined,
      subtitle: rawSub && rawSub.length < 60 ? rawSub : undefined,
      badge: rawBadge && rawBadge.length < 24 ? rawBadge : undefined,
    };
  }

  // If only clientX, clientY are provided
  if ('clientX' in origin && typeof origin.clientX === 'number') {
    const w = 180;
    const h = 48;
    return {
      top: Math.max(0, origin.clientY - h / 2),
      left: Math.max(0, origin.clientX - w / 2),
      width: w,
      height: h,
      borderRadius: '24px',
    };
  }

  return defaultRect;
}

export const ZoomTransitionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [origin, setOrigin] = useState<OriginRect>(() => extractOrigin(null));
  const targetPathRef = useRef<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Synchronize route commit with zoom completion
  useEffect(() => {
    if (
      phase === 'expanding' &&
      targetPathRef.current &&
      (location.pathname === targetPathRef.current ||
        location.pathname.startsWith(targetPathRef.current))
    ) {
      targetPathRef.current = null;
    }
  }, [location.pathname, phase]);

  const zoomNavigate = useCallback(
    (to: string, originInput?: ZoomOrigin) => {
      // If already transitioning, don't overlap
      if (phase !== 'idle') return;

      const extracted = extractOrigin(originInput);
      setOrigin(extracted);
      clearTimers();
      targetPathRef.current = to;
      setPhase('expanding');

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        navigate(to);
        setPhase('settling');
        const t = window.setTimeout(() => setPhase('idle'), 120);
        timersRef.current.push(t);
        return;
      }

      // 1. Halfway through zoom expansion (130ms), navigate to destination route
      // This allows the destination page to mount while the expanding surface is scaling
      const navTimer = window.setTimeout(() => {
        navigate(to);
      }, 130);

      // 2. At 270ms, the card reaches full viewport dimensions (Apple ease-out completed)
      // Enter settling phase for a smooth 60ms dissolve reveal
      const settleTimer = window.setTimeout(() => {
        setPhase('settling');
      }, 270);

      // 3. At 330ms, completely finish transition and return to idle
      const endTimer = window.setTimeout(() => {
        setPhase('idle');
      }, 330);

      // Fallback timer in case of unexpected delays
      const fallbackTimer = window.setTimeout(() => {
        setPhase('idle');
      }, 700);

      timersRef.current.push(navTimer, settleTimer, endTimer, fallbackTimer);
    },
    [phase, navigate, clearTimers]
  );

  const isTransitioning = phase !== 'idle';

  return (
    <ZoomTransitionContext.Provider
      value={{
        zoomNavigate,
        waterNavigate: zoomNavigate,
        isTransitioning,
      }}
    >
      {children}
      {isTransitioning && (
        <div
          className={`apple-zoom-portal is-${phase}`}
          style={
            {
              '--origin-top': `${origin.top}px`,
              '--origin-left': `${origin.left}px`,
              '--origin-width': `${origin.width}px`,
              '--origin-height': `${origin.height}px`,
              '--origin-radius': origin.borderRadius || '12px',
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          <div className="apple-zoom-card">
            {/* Apple Dynamic Blur & High-Contrast Backdrop Surface */}
            <div className="apple-zoom-surface" />

            {/* Shared Element Origin Snapshot Capsule */}
            <div className="apple-zoom-header">
              <div className="apple-zoom-header-inner">
                <div className="apple-zoom-icon-capsule">
                  <span className="apple-zoom-dot" />
                </div>
                <div className="apple-zoom-titles">
                  {origin.title && (
                    <span className="apple-zoom-title">{origin.title}</span>
                  )}
                  {origin.subtitle && (
                    <span className="apple-zoom-subtitle">
                      {origin.subtitle}
                    </span>
                  )}
                </div>
                {origin.badge && (
                  <span className="apple-zoom-badge">{origin.badge}</span>
                )}
              </div>
            </div>

            {/* Apple Elevation Ambient Rim Glow */}
            <div className="apple-zoom-ambient-glow" />
          </div>
        </div>
      )}
    </ZoomTransitionContext.Provider>
  );
};

// Backwards-compatibility alias
export const WaterTransitionProvider = ZoomTransitionProvider;
