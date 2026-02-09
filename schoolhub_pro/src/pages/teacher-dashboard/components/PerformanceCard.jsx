import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceCard = ({ performance }) => {
  const getPerformanceColor = (value) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-warning';
    return 'text-error';
  };

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-success';
    if (value >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon name={performance?.icon} size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-semibold text-foreground">{performance?.title}</h4>
            <p className="text-xs text-muted-foreground">{performance?.subject}</p>
          </div>
        </div>
        <span className={`text-xl md:text-2xl font-bold ${getPerformanceColor(performance?.value)}`}>
          {performance?.value}%
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{performance?.value}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(performance?.value)} transition-all duration-500`}
            style={{ width: `${performance?.value}%` }}
          />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total Students</span>
          <span className="text-foreground font-medium">{performance?.totalStudents}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;