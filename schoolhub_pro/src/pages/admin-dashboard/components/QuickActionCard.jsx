import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({ title, description, icon, iconColor, route }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-card border border-border rounded-xl p-4 md:p-5 text-left hover:shadow-elevation-2 hover:scale-[0.98] transition-smooth group"
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={20} color={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        <Icon name="ChevronRight" size={20} className="text-muted-foreground flex-shrink-0 group-hover:translate-x-1 transition-smooth" />
      </div>
    </button>
  );
};

export default QuickActionCard;