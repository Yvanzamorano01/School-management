import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingEventsCalendar = ({ events }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting':
        return 'Users';
      case 'exam':
        return 'FileText';
      case 'fee':
        return 'DollarSign';
      case 'holiday':
        return 'Calendar';
      default:
        return 'CalendarDays';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting':
        return 'border-l-primary bg-primary/5';
      case 'exam':
        return 'border-l-error bg-error/5';
      case 'fee':
        return 'border-l-warning bg-warning/5';
      case 'holiday':
        return 'border-l-success bg-success/5';
      default:
        return 'border-l-muted bg-muted/5';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Upcoming Events</h2>
        <button className="text-sm text-primary hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-3 md:space-y-4">
        {events?.map((event) => (
          <div
            key={event?.id}
            className={`border-l-4 rounded-xl p-3 md:p-4 transition-smooth hover:shadow-elevation-1 ${getEventColor(event?.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
                <Icon name={getEventIcon(event?.type)} size={20} className="text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-medium text-foreground mb-1">
                  {event?.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2">
                  {event?.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" size={12} />
                    {event?.date}
                  </span>
                  {event?.time && (
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      {event?.time}
                    </span>
                  )}
                  {event?.childName && (
                    <span className="px-2 py-0.5 bg-muted rounded">
                      {event?.childName}
                    </span>
                  )}
                </div>
                
                {event?.reminder && (
                  <button className="mt-2 text-xs text-primary hover:underline">
                    Set Reminder
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

export default UpcomingEventsCalendar;