import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'grade':
        return 'Award';
      case 'material':
        return 'FileText';
      case 'feedback':
        return 'MessageSquare';
      case 'assignment':
        return 'ClipboardCheck';
      default:
        return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'grade':
        return 'bg-success/10 text-success';
      case 'material':
        return 'bg-primary/10 text-primary';
      case 'feedback':
        return 'bg-secondary/10 text-secondary';
      case 'assignment':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const activity = new Date(date);
    const diffMs = now - activity;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Activity</h3>
        <Icon name="Activity" size={20} className="text-muted-foreground md:w-6 md:h-6" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start gap-3 pb-3 md:pb-4 border-b border-border last:border-0 last:pb-0">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${getActivityColor(activity?.type)} flex items-center justify-center flex-shrink-0`}>
              <Icon name={getActivityIcon(activity?.type)} size={16} className="md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base text-foreground line-clamp-2 mb-1">{activity?.message}</p>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <span>{activity?.subject}</span>
                <span>•</span>
                <span>{getTimeAgo(activity?.date)}</span>
              </div>
            </div>
            {activity?.isUnread && (
              <div className="w-2 h-2 rounded-full bg-error flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityFeed;