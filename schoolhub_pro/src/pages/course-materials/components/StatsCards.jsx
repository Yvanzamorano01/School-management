import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Materials',
      value: stats?.totalMaterials,
      icon: 'FileText',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Recent Uploads',
      value: stats?.recentUploads,
      icon: 'Upload',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      title: 'Total Downloads',
      value: stats?.totalDownloads,
      icon: 'Download',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      title: 'Subjects',
      value: stats?.totalSubjects,
      icon: 'BookOpen',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
      {cards?.map((card, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-smooth"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${card?.bgColor} rounded-xl flex items-center justify-center`}>
              <Icon name={card?.icon} size={20} className={card?.color} />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {card?.value?.toLocaleString()}
          </h3>
          <p className="text-sm text-muted-foreground">{card?.title}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;