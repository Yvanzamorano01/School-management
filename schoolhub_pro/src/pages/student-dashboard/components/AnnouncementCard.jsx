import React from 'react';
import Icon from '../../../components/AppIcon';

const AnnouncementCard = ({ announcements }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'exam':
        return 'FileText';
      case 'event':
        return 'Calendar';
      case 'holiday':
        return 'Sun';
      case 'general':
        return 'Bell';
      default:
        return 'Bell';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam':
        return 'bg-error/10 text-error';
      case 'event':
        return 'bg-secondary/10 text-secondary';
      case 'holiday':
        return 'bg-success/10 text-success';
      case 'general':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now - posted;
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
        <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Announcements</h3>
        <Icon name="Bell" size={20} className="text-muted-foreground md:w-6 md:h-6" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {announcements?.map((announcement) => (
          <div key={announcement?.id} className="border border-border rounded-lg p-3 md:p-4 hover:bg-muted/50 transition-smooth">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${getTypeColor(announcement?.type)} flex items-center justify-center flex-shrink-0`}>
                <Icon name={getTypeIcon(announcement?.type)} size={16} className="md:w-5 md:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm md:text-base font-medium text-foreground line-clamp-1">{announcement?.title}</h4>
                  {announcement?.isNew && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-error text-error-foreground rounded-full whitespace-nowrap">New</span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">{announcement?.content}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{announcement?.author}</span>
                  <span>•</span>
                  <span>{getTimeAgo(announcement?.date)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementCard;