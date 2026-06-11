/**
 * QueueEase V2 — Badge Component
 */

import clsx from 'clsx';

type BadgeVariant = 'waiting' | 'in-consultation' | 'completed' | 'emergency' | 'cancelled' | 'normal' | 'urgent' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  'waiting': 'bg-urgent/20 text-urgent border-urgent/30',
  'in-consultation': 'bg-teal/20 text-teal border-teal/30',
  'completed': 'bg-success/20 text-success border-success/30',
  'emergency': 'bg-emergency/20 text-emergency border-emergency/30',
  'cancelled': 'bg-white/10 text-white/50 border-white/20',
  'normal': 'bg-white/10 text-white/70 border-white/20',
  'urgent': 'bg-urgent/20 text-urgent border-urgent/30',
  'info': 'bg-cyan/20 text-cyan border-cyan/30',
};

export function Badge({ variant = 'normal', children, className, pulse }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
        variantStyles[variant],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
