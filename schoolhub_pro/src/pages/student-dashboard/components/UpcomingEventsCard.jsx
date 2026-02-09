import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingEventsCard = ({ events }) => {
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'exam':
        return 'bg-error/10 text-error border-error/20';
      case 'event':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'holiday':
        return 'bg-success/10 text-success border-success/20';
      case 'deadline':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return formatDate(date);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Upcoming Events</h3>
        <Icon name="Calendar" size={20} className="text-muted-foreground md:w-6 md:h-6" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {events?.map((event) => (
          <div key={event?.id} className={`border rounded-lg p-3 md:p-4 ${getEventTypeColor(event?.type)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-medium mb-1 line-clamp-1">{event?.title}</h4>
                <p className="text-xs md:text-sm opacity-80 line-clamp-1">{event?.description}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-md bg-background/50 whitespace-nowrap ml-2">
                {event?.type?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm opacity-80">
              <Icon name="Clock" size={14} className="flex-shrink-0" />
              <span>{getDaysUntil(event?.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEventsCard;