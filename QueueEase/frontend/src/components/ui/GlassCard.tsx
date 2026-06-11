/**
 * QueueEase V2 — GlassCard Component
 */

import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'light' | 'neon';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', hover = false, padding = 'md', className, children, ...props }, ref) => {
    const variants = {
      default: 'border-white/10 bg-white/5',
      light: 'border-white/20 bg-white/10',
      neon: 'border-teal/30 bg-teal/5 shadow-neon',
    };
    
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };
    
    return (
      <div
        ref={ref}
        className={clsx(
          'relative overflow-hidden rounded-2xl backdrop-blur-xl',
          variants[variant],
          paddings[padding],
          hover && 'transition-all duration-300 hover:scale-[1.01] hover:shadow-glass cursor-pointer',
          className
        )}
        style={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
export { GlassCard };

