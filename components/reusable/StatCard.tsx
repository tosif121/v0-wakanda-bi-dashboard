import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubStat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  description?: string;
  borderColor?: string;
  subStats?: SubStat[];
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  value,
  description,
  borderColor = 'border-l-primary',
  subStats,
  onClick,
  className,
}) => {
  const isClickable = !!onClick;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group overflow-hidden transition-all duration-200 border-l-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800 hover:shadow-lg w-full',
        borderColor,
        isClickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        !isClickable && 'hover:scale-105',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{title}</CardTitle>
        <span className="shrink-0 group-hover:scale-110 transition-transform duration-200">{icon}</span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{value}</div>
        {description && <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">{description}</p>}
        {subStats && subStats.length > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap items-start gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {subStats.map((stat, index) => (
              <span key={index} className="flex items-center gap-1 min-w-0">
                {stat.icon}
                <span className="font-semibold">{stat.value}</span>
                <span className="truncate">{stat.label}</span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
