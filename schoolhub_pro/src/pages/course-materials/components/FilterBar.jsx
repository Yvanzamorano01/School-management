import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterBar = ({ 
  subjects, 
  selectedSubject, 
  onSubjectChange,
  selectedFileType,
  onFileTypeChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
  userRole
}) => {
  const fileTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'docx', label: 'Word Documents' },
    { value: 'pptx', label: 'Presentations' },
    { value: 'video', label: 'Videos' },
    { value: 'image', label: 'Images' }
  ];

  const subjectOptions = [
    { value: 'all', label: 'All Subjects' },
    ...subjects?.map(subject => ({
      value: subject?.id,
      label: subject?.name
    }))
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Subject"
          options={subjectOptions}
          value={selectedSubject}
          onChange={onSubjectChange}
        />

        <Select
          label="File Type"
          options={fileTypeOptions}
          value={selectedFileType}
          onChange={onFileTypeChange}
        />

        <div className="lg:col-span-2">
          <Input
            label="Search Materials"
            type="search"
            placeholder="Search by title, description, or teacher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Active Filters:</span>
          {selectedSubject !== 'all' && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              {subjectOptions?.find(s => s?.value === selectedSubject)?.label}
            </span>
          )}
          {selectedFileType !== 'all' && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              {fileTypeOptions?.find(f => f?.value === selectedFileType)?.label}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              Search: {searchQuery}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          iconPosition="left"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;