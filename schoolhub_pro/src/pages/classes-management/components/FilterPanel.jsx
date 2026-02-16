import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FilterPanel = ({ filters, academicYears = [], onFilterChange, onReset }) => {
  const academicYearOptions = [
    { value: 'all', label: 'All Academic Years' },
    ...academicYears.map(y => ({
      value: y.id,
      label: `${y.name}${y.isActive ? ' (Active)' : ''}`
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-1">
          <Input
            type="text"
            placeholder="Search classes..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            icon={<Icon name="Search" size={20} />}
          />
        </div>

        {/* Academic Year Filter */}
        <div>
          <Select
            value={filters?.academicYear}
            onChange={(val) => onFilterChange('academicYear', val)}
            options={academicYearOptions}
            placeholder="All Academic Years"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={filters?.status}
            onChange={(val) => onFilterChange('status', val)}
            options={statusOptions}
            placeholder="All Status"
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

export default FilterPanel;
