import { useContext } from 'react';
import { ZoomTransitionContext } from './waterTransitionDefinition';

export const useZoomNavigate = () => {
  const context = useContext(ZoomTransitionContext);
  if (!context) {
    throw new Error('useZoomNavigate must be used within a ZoomTransitionProvider');
  }
  return context;
};
