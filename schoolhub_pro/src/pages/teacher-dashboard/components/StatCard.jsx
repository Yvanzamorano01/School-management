import React from 'react';
import Icon from '../../../components/AppIcon';

const StatCard = ({ stat }) => {
  const getTrendIcon = (trend) => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-1 transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat?.bgColor} flex items-center justify-center`}>
          <Icon name={stat?.icon} size={20} color={stat?.iconColor} />
        </div>
        {stat?.trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-muted ${getTrendColor(stat?.trend)}`}>
            <Icon name={getTrendIcon(stat?.trend)} size={14} />
            <span className="text-xs font-medium">{stat?.change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat?.label}</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground">{stat?.value}</p>
        {stat?.subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{stat?.subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;