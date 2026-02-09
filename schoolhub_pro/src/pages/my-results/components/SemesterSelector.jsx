import React from 'react';
import Select from '../../../components/ui/Select';

const SemesterSelector = ({ semesters, selectedSemester, onSemesterChange }) => {
  const semesterOptions = [
    { value: 'all', label: 'Tous les semestres' },
    ...(semesters || []).map(semester => ({
      value: semester?._id || semester?.id,
      label: `${semester?.name}${semester?.status ? ` (${semester.status})` : ''}`
    }))
  ];

  return (
    <div className="w-full md:w-64">
      <Select
        label="Select Semester"
        options={semesterOptions}
        value={selectedSemester}
        onChange={onSemesterChange}
        placeholder="Choose semester"
      />
    </div>
  );
};

export default SemesterSelector;
