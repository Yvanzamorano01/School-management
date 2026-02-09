import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({ action }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (action?.path) {
      navigate(action?.path);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-elevation-2 hover:border-primary/50 transition-smooth text-left group"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${action?.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon name={action?.icon} size={24} color={action?.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {action?.title}
          </h4>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
            {action?.description}
          </p>
        </div>
        <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
};

export default QuickActionCard;