import React from 'react';
import Icon from '../../../components/AppIcon';

const AcademicSummaryCard = ({ icon, title, value, subtitle, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    secondary: 'bg-secondary/10 text-secondary'
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${colorClasses?.[color]} flex items-center justify-center`}>
          <Icon name={icon} size={20} className="md:w-6 md:h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs md:text-sm ${trend?.type === 'up' ? 'text-success' : 'text-error'}`}>
            <Icon name={trend?.type === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} className="md:w-4 md:h-4" />
            <span className="font-medium">{trend?.value}</span>
          </div>
        )}
      </div>
      <h3 className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">{title}</h3>
      <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-1">{value}</p>
      {subtitle && <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

export default AcademicSummaryCard;