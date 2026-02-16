import React from 'react';
import Icon from '../../../components/AppIcon';

const ClassAnalytics = ({ totalClasses, totalStudents, totalSections, activeClasses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Total Classes */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Classes</p>
            <p className="text-2xl font-bold text-foreground">{totalClasses}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="BookOpen" size={24} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Total Students */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Students</p>
            <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={24} className="text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Total Sections */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Sections</p>
            <p className="text-2xl font-bold text-foreground">{totalSections}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Icon name="Layers" size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Active Classes */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Active Classes</p>
            <p className="text-2xl font-bold text-foreground">{activeClasses}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <Icon name="CheckCircle" size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAnalytics;