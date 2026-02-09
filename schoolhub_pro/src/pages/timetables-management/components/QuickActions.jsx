import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button variant="outline" iconName="Copy" fullWidth>
          Copy Schedule
        </Button>
        <Button variant="outline" iconName="FileText" fullWidth>
          Use Template
        </Button>
        <Button variant="outline" iconName="Download" fullWidth>
          Export PDF
        </Button>
        <Button variant="outline" iconName="Send" fullWidth>
          Publish Schedule
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;