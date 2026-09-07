import React, { useEffect, useState, useRef } from 'react';

export const ReactiveCursor: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const requestRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: -100, y: -100 });
  const followerPosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only activate on non-touch (fine pointer) devices
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Detect if cursor is hovering over any interactive or reactive element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, select, textarea, [role="button"], .cursor-pointer, .group, [tabindex="0"], label'
      );
      setIsHoveringInteractive(!!interactive);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth RAF physics loop for the trailing halo ring
    const animateFollower = () => {
      const dx = mousePosRef.current.x - followerPosRef.current.x;
      const dy = mousePosRef.current.y - followerPosRef.current.y;

      // 0.24 damping factor for responsive, floaty follower motion
      followerPosRef.current.x += dx * 0.24;
      followerPosRef.current.y += dy * 0.24;

      setFollowerPos({
        x: followerPosRef.current.x,
        y: followerPosRef.current.y,
      });

      requestRef.current = requestAnimationFrame(animateFollower);
    };

    requestRef.current = requestAnimationFrame(animateFollower);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="reactive-cursor-wrapper" aria-hidden="true">
      {/* Precision Core Dot */}
      <div
        className={`reactive-cursor-dot ${isHoveringInteractive ? 'is-hover' : ''} ${
          isMouseDown ? 'is-down' : ''
        }`}
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        }}
      />

      {/* Reactive Trailing Halo Ring */}
      <div
        className={`reactive-cursor-ring ${isHoveringInteractive ? 'is-hover' : ''} ${
          isMouseDown ? 'is-down' : ''
        }`}
        style={{
          transform: `translate3d(${followerPos.x}px, ${followerPos.y}px, 0)`,
        }}
      />
    </div>
  );
};
