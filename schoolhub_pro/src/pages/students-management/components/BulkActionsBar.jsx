import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const BulkActionsBar = ({ selectedCount, onPromote, onUpdateStatus, onExport, onDelete, onClearSelection }) => {
  const [selectedAction, setSelectedAction] = React.useState('');

  const actionOptions = [
    { value: 'promote', label: 'Promote to Next Class' },
    { value: 'active', label: 'Mark as Active' },
    { value: 'inactive', label: 'Mark as Inactive' },
    { value: 'export', label: 'Export Selected' },
    { value: 'delete', label: 'Delete Selected' }
  ];

  const handleApplyAction = () => {
    switch (selectedAction) {
      case 'promote':
        onPromote();
        break;
      case 'active': onUpdateStatus('Active');
        break;
      case 'inactive': onUpdateStatus('Inactive');
        break;
      case 'export':
        onExport();
        break;
      case 'delete':
        onDelete();
        break;
      default:
        break;
    }
    setSelectedAction('');
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-250">
      <div className="bg-card border border-border rounded-xl shadow-elevation-4 p-4 flex items-center gap-4 min-w-[320px] md:min-w-[480px]">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="CheckSquare" size={16} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {selectedCount} selected
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <Select
            placeholder="Choose action..."
            options={actionOptions}
            value={selectedAction}
            onChange={setSelectedAction}
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={handleApplyAction}
            disabled={!selectedAction}
            iconName="Check"
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            iconName="X"
          />
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;