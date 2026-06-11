/**
 * QueueEase V2 — TokenDisplay Component
 */

import { motion } from 'framer-motion';

interface TokenDisplayProps {
  token: string;
  position?: number;
  estimatedWait?: number;
  priority?: 'normal' | 'urgent' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
}

export function TokenDisplay({ token, position, estimatedWait, priority = 'normal', size = 'md' }: TokenDisplayProps) {
  const sizes = {
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
  };
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const priorityGlow = {
    normal: 'shadow-neon border-teal/30',
    urgent: 'shadow-[0_0_5px_rgba(245,158,11,0.5),0_0_20px_rgba(245,158,11,0.3)] border-urgent/30',
    emergency: 'shadow-[0_0_5px_rgba(239,68,68,0.5),0_0_20px_rgba(239,68,68,0.3)] border-emergency/30 animate-pulse',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        flex flex-col items-center justify-center rounded-2xl border
        bg-teal/10 ${sizes[size]} ${priorityGlow[priority]}
      `}
    >
      <span className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Token</span>
      <span className={`${textSizes[size]} font-bold neon-text font-mono`}>{token}</span>
      {position && (
        <span className="text-sm text-white/60 mt-1">Position #{position}</span>
      )}
      {estimatedWait !== undefined && (
        <span className="text-sm text-teal mt-1">~{estimatedWait} min wait</span>
      )}
    </motion.div>
  );
}

export default TokenDisplay;
