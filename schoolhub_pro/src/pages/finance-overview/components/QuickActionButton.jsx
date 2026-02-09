import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionButton = ({ icon, label, description, onClick, color = 'var(--color-primary)' }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-elevation-2 hover:scale-[0.98] transition-smooth text-left group"
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon name={icon} size={24} color={color} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-foreground mb-1">{label}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        <Icon 
          name="ChevronRight" 
          size={20} 
          className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-smooth flex-shrink-0" 
        />
      </div>
    </button>
  );
};

export default QuickActionButton;