import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      enrollment: 'UserPlus',
      payment: 'DollarSign',
      attendance: 'ClipboardCheck',
      exam: 'FileText',
      notice: 'Bell',
      system: 'Settings'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      enrollment: 'var(--color-primary)',
      payment: 'var(--color-success)',
      attendance: 'var(--color-secondary)',
      exam: 'var(--color-accent)',
      notice: 'var(--color-warning)',
      system: 'var(--color-muted-foreground)'
    };
    return colors?.[type] || 'var(--color-foreground)';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-elevation-1">
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest system updates and notifications</p>
      </div>
      <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start gap-3 md:gap-4 p-3 rounded-lg hover:bg-muted transition-smooth">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${getActivityColor(activity?.type)}15` }}
            >
              <Icon name={getActivityIcon(activity?.type)} size={18} color={getActivityColor(activity?.type)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base text-foreground font-medium mb-1">{activity?.title}</p>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{activity?.description}</p>
              <span className="text-xs text-muted-foreground mt-1 inline-block">{formatTime(activity?.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;