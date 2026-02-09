import React from 'react';
import Icon from '../../../components/AppIcon';

const ScheduleCard = ({ schedule }) => {
  const getTimeColor = (time) => {
    const hour = parseInt(time?.split(':')?.[0]);
    if (hour < 12) return 'text-warning';
    if (hour < 17) return 'text-primary';
    return 'text-secondary';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-elevation-1 transition-smooth">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
          <span className={`text-lg md:text-xl font-bold ${getTimeColor(schedule?.time)}`}>
            {schedule?.time?.split(':')?.[0]}
          </span>
          <span className="text-xs text-muted-foreground">
            {parseInt(schedule?.time?.split(':')?.[0]) < 12 ? 'AM' : 'PM'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-semibold text-foreground mb-1 truncate">
            {schedule?.subject}
          </h4>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
            <Icon name="MapPin" size={14} />
            <span>{schedule?.room}</span>
            <span>•</span>
            <span>{schedule?.grade}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-muted rounded text-xs text-foreground">
              {schedule?.duration}
            </span>
            <span className="px-2 py-1 bg-success/10 text-success rounded text-xs">
              {schedule?.studentCount} students
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;