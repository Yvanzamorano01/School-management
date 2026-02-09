import React from 'react';
import Icon from '../../../components/AppIcon';

const AcademicConfiguration = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon name="BookOpen" size={40} color="var(--color-primary)" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">Academic Configuration</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        The academic configuration module including grading system, examination weights,
        class schedules and academic year management will be available in a future update.
      </p>
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
        <Icon name="Clock" size={16} />
        <span>Coming Soon</span>
      </div>
    </div>
  );
};

export default AcademicConfiguration;
