import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const TeacherFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  subjectOptions,
  statusOptions 
}) => {
  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 mb-4 md:mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Subject"
          placeholder="All Subjects"
          options={subjectOptions}
          value={filters?.subject}
          onChange={(value) => onFilterChange('subject', value)}
          clearable
        />

        <Select
          label="Status"
          placeholder="All Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          clearable
        />

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
            fullWidth
          >
            Clear Filters
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Input
          type="search"
          placeholder="Search teachers by name, email, or phone..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default TeacherFilters;