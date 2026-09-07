import React from 'react';
import { useLocation } from 'react-router-dom';

interface FountainRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FountainReveal:
 * Implements a premium, fast left-to-right flowing burst page transition.
 * When the destination page opens, elements enter from the left side with
 * subtle vertical offsets (-10px to +10px fan shape) and propagate with
 * smooth rhythm (0ms, 45ms, 90ms, 135ms, 180ms...) across the viewport.
 */
export const FountainReveal: React.FC<FountainRevealProps> = ({
  children,
  className = '',
}) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`fountain-reveal-viewport ${className}`}
      data-fountain-route={location.pathname}
    >
      {children}
    </div>
  );
};
