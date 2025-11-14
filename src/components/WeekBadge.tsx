
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeekBadgeProps {
  week: number;
  status?: 'active' | 'completed' | 'upcoming';
  showTooltip?: boolean;
}

const WeekBadge: React.FC<WeekBadgeProps> = ({ 
  week, 
  status = 'active',
  showTooltip = true
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-mentee-orange/20 text-mentee-orange border-mentee-orange/50';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case 'active':
        return `Week ${week} (Current)`;
      case 'completed':
        return `Week ${week} (Completed)`;
      case 'upcoming':
      default:
        return `Week ${week} (Upcoming)`;
    }
  };

  const badgeContent = (
    <Badge className={`${getStatusStyles()}`}>
      Week {week}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
};

export default WeekBadge;
