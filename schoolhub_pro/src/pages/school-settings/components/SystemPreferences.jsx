import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemPreferences = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
        <Icon name="Sliders" size={40} color="var(--color-accent)" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">System Preferences</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        System preferences including regional settings, notifications, backup management
        and third-party integrations will be available in a future update.
      </p>
      <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
        <Icon name="Clock" size={16} />
        <span>Coming Soon</span>
      </div>
    </div>
  );
};

export default SystemPreferences;
