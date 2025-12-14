import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WorkflowPhaseProps {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  icon: React.ReactNode;
  isLast?: boolean;
  className?: string;
}

const statusStyles = {
  pending: {
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: 'text-gray-400 dark:text-gray-600',
    connector: 'bg-gray-200 dark:bg-gray-700'
  },
  running: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
    connector: 'bg-blue-200 dark:bg-blue-700'
  },
  completed: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
    connector: 'bg-emerald-200 dark:bg-emerald-700'
  },
  failed: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: 'text-red-600 dark:text-red-400',
    connector: 'bg-red-200 dark:bg-red-700'
  }
};

export const WorkflowPhase: React.FC<WorkflowPhaseProps> = ({
  id,
  name,
  description,
  status,
  icon,
  isLast = false,
  className
}) => {
  const styles = statusStyles[status];

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
          status === 'completed' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' :
          status === 'running' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
          status === 'failed' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
          'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
        )}>
          <span className={cn('h-4 w-4', styles.icon)}>
            {icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {name}
            </h4>
            <Badge className={cn('text-xs', styles.badge)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 break-words">
            {description}
          </p>
        </div>
      </div>

      {/* Connection Line */}
      {!isLast && (
        <div className={cn(
          'absolute left-4 top-8 w-px h-6 transition-colors',
          styles.connector
        )} />
      )}
    </div>
  );
};

export default WorkflowPhase;