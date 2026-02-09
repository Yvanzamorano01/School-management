import React from 'react';
import Select from '../../../components/ui/Select';

const SubjectFilter = ({ subjects, selectedSubject, onSubjectChange }) => {
  const subjectOptions = [
    { value: 'all', label: 'All Subjects' },
    ...(subjects || []).map(subject => ({
      value: subject?.id || subject?._id,
      label: subject?.name,
      description: subject?.code
    }))
  ];

  return (
    <div className="w-full md:w-64">
      <Select
        label="Filter by Subject"
        options={subjectOptions}
        value={selectedSubject}
        onChange={onSubjectChange}
        placeholder="All subjects"
      />
    </div>
  );
};

export default SubjectFilter;
