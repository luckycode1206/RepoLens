import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InkTransitionContext } from './inkTransitionDefinition';

type TransitionPhase = 'idle' | 'entering' | 'holding' | 'exiting';

export const InkTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [origin, setOrigin] = useState<{ x: string; y: string }>({ x: '85%', y: '5%' });
  const targetPathRef = useRef<string | null>(null);
  const timersRef = useRef<number[]>([]);

  // Clear pending timers helper
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Synchronize exit transition: once the new page is rendered and painted, dissolve the wave
  useEffect(() => {
    if (
      (phase === 'entering' || phase === 'holding') &&
      targetPathRef.current &&
      (location.pathname === targetPathRef.current || location.pathname.startsWith(targetPathRef.current))
    ) {
      targetPathRef.current = null;

      // Two animation frames guarantee the browser has committed and painted the new page
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('exiting');
          const exitTimer = window.setTimeout(() => {
            setPhase('idle');
          }, 320);
          timersRef.current.push(exitTimer);
        });
      });
    }
  }, [location.pathname, phase]);

  const inkNavigate = useCallback(
    (to: string, event?: React.MouseEvent | { clientX: number; clientY: number }) => {
      // Prevent multiple transitions simultaneously
      if (phase !== 'idle') return;

      // Extract coordinates if provided, otherwise default to screen center
      if (event && 'clientX' in event && typeof event.clientX === 'number') {
        const xPct = Math.round((event.clientX / window.innerWidth) * 100);
        const yPct = Math.round((event.clientY / window.innerHeight) * 100);
        setOrigin({ x: `${xPct}%`, y: `${yPct}%` });
      } else {
        setOrigin({ x: '50%', y: '50%' });
      }

      clearTimers();
      targetPathRef.current = to;
      setPhase('entering');

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        navigate(to);
        setPhase('exiting');
        const t = window.setTimeout(() => setPhase('idle'), 150);
        timersRef.current.push(t);
        return;
      }

      // Route change is triggered as the limespark wave reaches full screen coverage
      const navTimer = window.setTimeout(() => {
        setPhase('holding');
        navigate(to);
      }, 260);

      // Safety fallback: if for any reason route listener didn't fire, dissolve cleanly
      const fallbackTimer = window.setTimeout(() => {
        setPhase('exiting');
        const cleanupTimer = window.setTimeout(() => {
          setPhase('idle');
        }, 320);
        timersRef.current.push(cleanupTimer);
      }, 750);

      timersRef.current.push(navTimer, fallbackTimer);
    },
    [phase, navigate, clearTimers]
  );

  const isTransitioning = phase !== 'idle';

  return (
    <InkTransitionContext.Provider value={{ inkNavigate, isTransitioning }}>
      {children}
      {isTransitioning && (
        <div
          className={`repolens-ink-overlay is-${phase}`}
          style={
            {
              '--ink-origin-x': origin.x,
              '--ink-origin-y': origin.y,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      )}
    </InkTransitionContext.Provider>
  );
};
