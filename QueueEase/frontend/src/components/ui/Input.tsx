/**
 * QueueEase V2 — Input Component
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-white/70">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition-all duration-200',
              'focus:border-teal/50 focus:bg-white/10 focus:ring-2 focus:ring-teal/20',
              'min-h-[48px]', // Elderly-friendly touch target
              leftIcon && 'pl-10',
              error ? 'border-red-500/50' : 'border-white/10',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
export { Input };

