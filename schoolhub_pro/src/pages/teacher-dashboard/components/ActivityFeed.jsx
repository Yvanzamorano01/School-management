import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'submission':
        return 'FileText';
      case 'message':
        return 'MessageSquare';
      case 'announcement':
        return 'Megaphone';
      case 'grade':
        return 'Award';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'submission':
        return 'bg-primary/10 text-primary';
      case 'message':
        return 'bg-secondary/10 text-secondary';
      case 'announcement':
        return 'bg-warning/10 text-warning';
      case 'grade':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return activityDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Activity</h3>
        <Icon name="Activity" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-3">
        {activities?.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
            <div className={`w-8 h-8 rounded-lg ${getActivityColor(activity?.type)} flex items-center justify-center flex-shrink-0`}>
              <Icon name={getActivityIcon(activity?.type)} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground mb-1">
                <span className="font-medium">{activity?.student}</span> {activity?.action}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{activity?.subject}</span>
                <span>•</span>
                <span>{getTimeAgo(activity?.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;