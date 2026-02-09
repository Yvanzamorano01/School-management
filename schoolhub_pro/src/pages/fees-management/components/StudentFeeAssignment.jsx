import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const StudentFeeAssignment = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const classOptions = [
    { value: 'class-10-a', label: 'Class 10-A' },
    { value: 'class-10-b', label: 'Class 10-B' },
    { value: 'class-9-a', label: 'Class 9-A' }
  ];

  const students = [
    { id: 1, name: 'John Smith', rollNo: 'STU001', currentFees: ['Tuition', 'Transport'] },
    { id: 2, name: 'Emma Johnson', rollNo: 'STU002', currentFees: ['Tuition', 'Library'] },
    { id: 3, name: 'Michael Brown', rollNo: 'STU003', currentFees: ['Tuition'] },
    { id: 4, name: 'Sarah Davis', rollNo: 'STU004', currentFees: ['Tuition', 'Transport', 'Sports'] }
  ];

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(students?.map(s => s?.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents?.filter(id => id !== studentId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          label="Select Class"
          options={classOptions}
          value={selectedClass}
          onChange={setSelectedClass}
          placeholder="Choose a class"
          className="flex-1"
        />
        <div className="flex items-end gap-2">
          <Button iconName="UserPlus">
            Assign Fees
          </Button>
          <Button variant="outline" iconName="Download">
            Export
          </Button>
        </div>
      </div>

      {selectedClass && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 border-b border-border">
            <Checkbox
              label="Select All Students"
              checked={selectedStudents?.length === students?.length}
              onChange={(e) => handleSelectAll(e?.target?.checked)}
            />
          </div>
          <div className="divide-y divide-border">
            {students?.map((student) => (
              <div key={student?.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedStudents?.includes(student?.id)}
                    onChange={(e) => handleSelectStudent(student?.id, e?.target?.checked)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{student?.name}</div>
                    <div className="text-sm text-muted-foreground">Roll No: {student?.rollNo}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {student?.currentFees?.map((fee, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {fee}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeAssignment;