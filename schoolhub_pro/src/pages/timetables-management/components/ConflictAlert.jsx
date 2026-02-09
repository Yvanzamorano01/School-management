import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConflictAlert = ({ conflicts, onResolve }) => {
  return (
    <div className="bg-error/10 border border-error rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-error/20 flex items-center justify-center flex-shrink-0">
          <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">Schedule Conflicts Detected</h3>
          <ul className="space-y-1 mb-3">
            {conflicts?.map((conflict, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {conflict}
              </li>
            ))}
          </ul>
          <Button size="sm" variant="outline" onClick={onResolve}>
            Resolve Conflicts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConflictAlert;