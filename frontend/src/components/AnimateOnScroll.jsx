import React from 'react';
import { useInView } from '../hooks/useInView';

const AnimateOnScroll = ({ 
  children, 
  className = '', 
  animation = 'fade-up', 
  delay = 0 
}) => {
  const [ref, isInView] = useInView();

  const animations = {
    'fade-up': 'translate-y-10 opacity-0',
    'fade-down': '-translate-y-10 opacity-0',
    'fade-left': 'translate-x-10 opacity-0',
    'fade-right': '-translate-x-10 opacity-0',
    'zoom-in': 'scale-90 opacity-0',
    'rotate-in': 'rotate-12 opacity-0',
  };

  const activeAnimation = animations[animation] || animations['fade-up'];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isInView ? 'translate-x-0 translate-y-0 scale-100 rotate-0 opacity-100' : activeAnimation
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;