/**
 * QueueEase V2 — EmptyState Component
 */

import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        {icon || <FileQuestion className="w-8 h-8 text-white/30" />}
      </div>
      <h3 className="text-lg font-semibold text-white/70 mb-2">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
