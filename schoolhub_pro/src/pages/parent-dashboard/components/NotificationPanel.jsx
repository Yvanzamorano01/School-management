import React from 'react';
import Icon from '../../../components/AppIcon';

const NotificationPanel = ({ notifications }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'teacher':
        return 'MessageSquare';
      case 'fee':
        return 'DollarSign';
      case 'announcement':
        return 'Megaphone';
      case 'alert':
        return 'AlertCircle';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-error bg-error/5';
      case 'medium':
        return 'border-l-warning bg-warning/5';
      default:
        return 'border-l-primary bg-primary/5';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-error/10 text-error',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-muted text-muted-foreground'
    };
    return colors?.[priority] || colors?.low;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Important Notifications</h2>
        <span className="px-2 md:px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm font-medium rounded-lg">
          {notifications?.filter(n => !n?.read)?.length} New
        </span>
      </div>
      <div className="space-y-3 md:space-y-4">
        {notifications?.map((notification) => (
          <div
            key={notification?.id}
            className={`border-l-4 rounded-xl p-3 md:p-4 transition-smooth hover:shadow-elevation-1 ${getNotificationColor(notification?.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                notification?.read ? 'bg-muted' : 'bg-primary/10'
              }`}>
                <Icon
                  name={getNotificationIcon(notification?.type)}
                  size={18}
                  className={notification?.read ? 'text-muted-foreground' : 'text-primary'}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`text-sm md:text-base font-medium ${
                    notification?.read ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {notification?.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getPriorityBadge(notification?.priority)}`}>
                    {notification?.priority}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                  {notification?.message}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{notification?.timestamp}</span>
                  {!notification?.read && (
                    <button className="text-xs text-primary hover:underline">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;