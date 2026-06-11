/**
 * QueueEase V2 — StatCard Component
 */

import React from 'react';
import GlassCard from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number | { value: number; isPositive: boolean };
  trendLabel?: string;
  variant?: 'default' | 'teal' | 'emergency' | 'urgent';
}

export default function StatCard({ title, value, subtitle, icon, trend, trendLabel, variant = 'default' }: StatCardProps) {
  const iconColors = {
    default: 'bg-white/10 text-white/70',
    teal: 'bg-teal-500/20 text-teal-400',
    emergency: 'bg-red-500/20 text-red-400',
    urgent: 'bg-yellow-500/20 text-yellow-400',
  };

  // Normalize trend to object
  const trendObj = typeof trend === 'number'
    ? { value: Math.abs(trend), isPositive: trend >= 0 }
    : trend;

  return (
    <GlassCard hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
          {trendObj && trendObj.value !== 0 && (
            <p className={`text-xs mt-1 ${trendObj.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trendObj.isPositive ? '↑' : '↓'} {trendObj.value}%
              {trendLabel && <span className="text-gray-500 ml-1">{trendLabel}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export { StatCard };
