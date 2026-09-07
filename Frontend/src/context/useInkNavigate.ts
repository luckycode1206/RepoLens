import { useContext } from 'react';
import { InkTransitionContext } from './inkTransitionDefinition';

export const useInkNavigate = () => {
  const context = useContext(InkTransitionContext);
  if (!context) {
    throw new Error('useInkNavigate must be used within an InkTransitionProvider');
  }
  return context;
};
