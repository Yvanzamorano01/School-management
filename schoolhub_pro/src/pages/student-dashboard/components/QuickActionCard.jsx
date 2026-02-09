import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActionCard = ({ actions }) => {
  const navigate = useNavigate();

  const getActionColor = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary hover:bg-primary/20',
      success: 'bg-success/10 text-success hover:bg-success/20',
      warning: 'bg-warning/10 text-warning hover:bg-warning/20',
      secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20'
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => navigate(action?.path)}
            className={`${getActionColor(action?.color)} rounded-xl p-4 md:p-6 transition-smooth hover:scale-[0.98] text-left`}
          >
            <div className="flex flex-col items-start gap-2 md:gap-3">
              <Icon name={action?.icon} size={24} className="md:w-8 md:h-8" />
              <span className="text-sm md:text-base font-medium">{action?.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionCard;