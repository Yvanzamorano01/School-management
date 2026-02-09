import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'grade':
        return 'Award';
      case 'attendance':
        return 'Calendar';
      case 'fee':
        return 'DollarSign';
      case 'communication':
        return 'MessageSquare';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'grade':
        return 'bg-success/10 text-success';
      case 'attendance':
        return 'bg-primary/10 text-primary';
      case 'fee':
        return 'bg-warning/10 text-warning';
      case 'communication':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">Recent Activity</h2>
      <div className="space-y-3 md:space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start gap-3 md:gap-4 pb-3 md:pb-4 border-b border-border last:border-0 last:pb-0">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={18} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm md:text-base font-medium text-foreground">
                  {activity?.title}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity?.timestamp}
                </span>
              </div>
              
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                {activity?.description}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                  {activity?.childName}
                </span>
                {activity?.actionRequired && (
                  <button className="text-xs text-primary hover:underline">
                    Take Action
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityFeed;