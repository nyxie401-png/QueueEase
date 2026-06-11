/**
 * QueueEase V2 — Button Component
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'emergency' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-teal text-navy-500 hover:bg-teal-400 shadow-neon',
      secondary: 'border border-teal/30 bg-teal/10 text-teal hover:bg-teal/20',
      ghost: 'text-white/70 hover:bg-white/10 hover:text-white',
      emergency: 'bg-emergency text-white hover:bg-emergency-dark animate-pulse-slow',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[40px]',
      md: 'px-6 py-3 text-base min-h-[48px]',
      lg: 'px-8 py-4 text-lg min-h-[56px]',
    };
    
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
export { Button };

