import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NoHarmLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onDotPositionsReady?: (positions: { green: DOMRect; blue: DOMRect; purple: DOMRect }) => void;
}

const NoHarmLogo: React.FC<NoHarmLogoProps> = ({ 
  className, 
  size = 'md',
  onDotPositionsReady
}) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const greenDotRef = useRef<HTMLDivElement>(null);
  const blueDotRef = useRef<HTMLDivElement>(null);
  const purpleDotRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  useEffect(() => {
    if (onDotPositionsReady && greenDotRef.current && blueDotRef.current && purpleDotRef.current) {
      // Use a small timeout to ensure the refs have proper positioning after render
      const timer = setTimeout(() => {
        onDotPositionsReady({
          green: greenDotRef.current!.getBoundingClientRect(),
          blue: blueDotRef.current!.getBoundingClientRect(),
          purple: purpleDotRef.current!.getBoundingClientRect()
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [onDotPositionsReady]);

  return (
    <div 
      className={cn('relative flex items-center justify-center', sizeClasses[size], className)} 
      id="noharm-logo"
      ref={logoRef}
    >
      {/* Main Logo Image */}
      <img 
        src="/images/logos/new-favicon.png" 
        alt="NoHarm Logo" 
        className={cn('w-full h-full object-contain', sizeClasses[size])}
      />
      
      {/* Invisible dot markers for precise line connections */}
      <div 
        ref={greenDotRef}
        className="absolute w-4 h-4 rounded-full top-[5%] left-[48%] opacity-0 pointer-events-none" 
        id="green-dot-marker"
      />
      <div 
        ref={blueDotRef}
        className="absolute w-4 h-4 rounded-full bottom-[20%] left-[20%] opacity-0 pointer-events-none" 
        id="blue-dot-marker"
      />
      <div 
        ref={purpleDotRef}
        className="absolute w-4 h-4 rounded-full bottom-[20%] right-[20%] opacity-0 pointer-events-none" 
        id="purple-dot-marker"
      />
    </div>
  );
};

export default NoHarmLogo;