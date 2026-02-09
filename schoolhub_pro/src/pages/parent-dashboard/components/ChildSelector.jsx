import React from 'react';
import Select from '../../../components/ui/Select';

const ChildSelector = ({ children, selectedChild, onChildChange }) => {
  const childOptions = [
    { value: 'all', label: 'All Children' },
    ...children?.map(child => ({
      value: child?.id,
      label: `${child?.name} - ${child?.class}`
    }))
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
      <Select
        label="Select Child"
        description="View information for specific child or all children"
        options={childOptions}
        value={selectedChild}
        onChange={onChildChange}
        searchable={children?.length > 5}
      />
    </div>
  );
};

export default ChildSelector;