import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionButton = ({ icon, label, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-6 bg-card border border-border rounded-xl hover:shadow-elevation-2 hover:scale-[0.98] transition-smooth"
    >
      <div 
        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon name={icon} size={20} color={color} className="md:w-6 md:h-6" />
      </div>
      <span className="text-xs md:text-sm font-medium text-foreground text-center">{label}</span>
    </button>
  );
};

export default QuickActionButton;