
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  large?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  icon,
  className,
  onClick,
  disabled = false,
  badge,
  large = false,
}) => {
  return (
    <div
      className={cn(
        'dashboard-card',
        disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
        large ? 'col-span-2' : '',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="card-content">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {icon && <div className="mr-3 text-mentee-orange">{icon}</div>}
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          {badge && (
            <Badge variant="outline" className="ml-2 bg-secondary">
              {badge}
            </Badge>
          )}
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
