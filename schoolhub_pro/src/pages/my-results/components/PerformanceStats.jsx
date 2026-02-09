import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Overall GPA',
      value: stats?.gpa ?? '-',
      icon: 'Award',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Class Rank',
      value: stats?.rank && stats?.totalStudents ? `${stats.rank}/${stats.totalStudents}` : '-',
      icon: 'Trophy',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      label: 'Subjects Passed',
      value: stats?.total != null ? `${stats?.passed ?? 0}/${stats.total}` : '-',
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Average Score',
      value: stats?.average != null ? `${stats.average}%` : '-',
      icon: 'Target',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card rounded-xl p-4 md:p-6 border border-border hover:shadow-elevation-2 transition-smooth">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat?.value}</div>
          <div className="text-xs md:text-sm text-muted-foreground">{stat?.label}</div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceStats;