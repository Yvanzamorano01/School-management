import React from 'react';
import Icon from '../../../components/AppIcon';

const ScheduleCard = ({ schedule }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-success/10 text-success border-success/20';
      case 'upcoming':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Today's Schedule</h3>
        <Icon name="Calendar" size={20} className="text-muted-foreground md:w-6 md:h-6" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {schedule?.map((item) => (
          <div key={item?.id} className={`border rounded-lg p-3 md:p-4 ${getStatusColor(item?.status)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-medium mb-1 truncate">{item?.subject}</h4>
                <p className="text-xs md:text-sm opacity-80">{item?.teacher}</p>
              </div>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap ml-2">{item?.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm opacity-80">
              <Icon name="MapPin" size={14} className="flex-shrink-0" />
              <span className="truncate">{item?.room}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCard;