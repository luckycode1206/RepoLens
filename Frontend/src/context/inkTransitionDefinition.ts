import React, { createContext } from 'react';

export interface InkTransitionContextType {
  inkNavigate: (to: string, event?: React.MouseEvent | { clientX: number; clientY: number }) => void;
  isTransitioning: boolean;
}

export const InkTransitionContext = createContext<InkTransitionContextType>({
  inkNavigate: () => {},
  isTransitioning: false,
});
