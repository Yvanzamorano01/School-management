import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SectionFilters = ({ filters, classes, onFilterChange, onReset }) => {
  const classOptions = [
    { value: 'all', label: 'All Classes' },
    ...(classes || []).map(cls => ({
      value: cls.id,
      label: cls.name
    }))
  ];

  const capacityOptions = [
    { value: 'all', label: 'All Capacities' },
    { value: 'low', label: 'Low (< 30)' },
    { value: 'medium', label: 'Medium (30-34)' },
    { value: 'high', label: 'High (≥ 35)' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder="Search sections by name, class, or room..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            icon={<Icon name="Search" size={20} />}
          />
        </div>

        {/* Class Filter */}
        <div>
          <Select
            value={filters?.classId}
            onChange={(val) => onFilterChange('classId', val)}
            options={classOptions}
            placeholder="All Classes"
          />
        </div>

        {/* Capacity Filter */}
        <div>
          <Select
            value={filters?.capacity}
            onChange={(val) => onFilterChange('capacity', val)}
            options={capacityOptions}
            placeholder="All Capacities"
          />
        </div>
      </div>
      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <Icon name="RotateCcw" size={16} />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default SectionFilters;
