import React from 'react';
import Icon from '../../../components/AppIcon';

const FinancialSummaryCard = ({ title, amount, change, changeType, icon, iconColor, trend }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${iconColor}15` }}>
          <Icon name={icon} size={20} color={iconColor} className="md:w-6 md:h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-xs md:text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">{amount}</h3>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;