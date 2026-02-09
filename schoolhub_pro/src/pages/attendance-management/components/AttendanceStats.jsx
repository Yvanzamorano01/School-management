import React from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceStats = ({ stats = {} }) => {
  const {
    totalStudents = 0,
    present = 0,
    absent = 0,
    late = 0,
    attendanceRate = 0
  } = stats;

  const statCards = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Present',
      value: present,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Absent',
      value: absent,
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Late',
      value: late,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Today's Summary</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
          <Icon name="TrendingUp" size={16} color="var(--color-success)" />
          <span className="text-sm font-medium text-success">{attendanceRate}%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-background rounded-xl p-3 md:p-4 border border-border">
            <div className={`w-8 h-8 md:w-10 md:h-10 ${stat?.bgColor} rounded-lg flex items-center justify-center mb-2 md:mb-3`}>
              <Icon name={stat?.icon} size={18} color={`var(--color-${stat?.color?.split('-')?.[1]})`} />
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground mb-1">{stat?.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground">{stat?.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceStats;