import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InkTransitionContext } from './inkTransitionDefinition';

export const InkTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [origin, setOrigin] = useState<{ x: string; y: string }>({ x: '85%', y: '5%' });
  const timersRef = useRef<number[]>([]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const inkNavigate = useCallback(
    (to: string, event?: React.MouseEvent | { clientX: number; clientY: number }) => {
      // Prevent multiple transitions simultaneously
      if (isTransitioning) return;

      // Extract coordinates if provided
      if (event && 'clientX' in event && typeof event.clientX === 'number') {
        const xPct = Math.round((event.clientX / window.innerWidth) * 100);
        const yPct = Math.round((event.clientY / window.innerHeight) * 100);
        setOrigin({ x: `${xPct}%`, y: `${yPct}%` });
      } else {
        setOrigin({ x: '50%', y: '50%' });
      }

      setIsTransitioning(true);

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const swapDelay = prefersReduced ? 80 : 420;
      const endDelay = prefersReduced ? 170 : 920;

      // Clear any pending timers
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];

      // Route change occurs while ink fully covers the screen
      const swapTimer = window.setTimeout(() => {
        navigate(to);
      }, swapDelay);

      // Transition completes and overlay dissolves
      const endTimer = window.setTimeout(() => {
        setIsTransitioning(false);
      }, endDelay);

      timersRef.current.push(swapTimer, endTimer);
    },
    [isTransitioning, navigate]
  );

  return (
    <InkTransitionContext.Provider value={{ inkNavigate, isTransitioning }}>
      {children}
      {isTransitioning && (
        <div
          className="repolens-ink-overlay is-active"
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
