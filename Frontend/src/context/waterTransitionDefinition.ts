import React, { createContext } from 'react';

export interface OriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export type ZoomOrigin =
  | React.MouseEvent
  | HTMLElement
  | { clientX: number; clientY: number }
  | OriginRect;

export interface ZoomTransitionContextType {
  zoomNavigate: (to: string, origin?: ZoomOrigin) => void;
  waterNavigate: (to: string, origin?: ZoomOrigin) => void;
  isTransitioning: boolean;
}

export type WaterTransitionContextType = ZoomTransitionContextType;

export const ZoomTransitionContext = createContext<ZoomTransitionContextType>({
  zoomNavigate: () => {},
  waterNavigate: () => {},
  isTransitioning: false,
});

export const WaterTransitionContext = ZoomTransitionContext;
