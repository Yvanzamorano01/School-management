import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TeacherAssignmentModal = ({ isOpen, onClose, onSubmit, sectionData, availableTeachers }) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedTeacher('');
      setSelectedSubject('');
      setErrors({});
    }
  }, [isOpen]);

  const teacherOptions = availableTeachers?.map(teacher => ({
    value: teacher?.id,
    label: teacher?.name,
    description: teacher?.specialization
  }));

  const subjectOptions = [
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Science', label: 'Science' },
    { value: 'Social Studies', label: 'Social Studies' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'History', label: 'History' },
    { value: 'Geography', label: 'Geography' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Physical Education', label: 'Physical Education' },
    { value: 'Art', label: 'Art' },
    { value: 'Music', label: 'Music' }
  ];

  const validate = () => {
    const newErrors = {};
    if (!selectedTeacher) newErrors.teacher = 'Please select a teacher';
    if (!selectedSubject) newErrors.subject = 'Please select a subject';
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    const teacher = availableTeachers?.find(t => t?.id === selectedTeacher);
    onSubmit({
      sectionId: sectionData?.id,
      teacherId: selectedTeacher,
      teacherName: teacher?.name,
      subject: selectedSubject
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Teacher"
      description={`Assign a teacher to ${sectionData?.name || 'this section'}`}
      size="default"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Assign Teacher
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {sectionData && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Users" size={20} color="var(--color-primary)" />
              <div>
                <p className="text-sm font-medium text-foreground">{sectionData?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {sectionData?.enrolled}/{sectionData?.capacity} students • Room {sectionData?.room}
                </p>
              </div>
            </div>
          </div>
        )}

        <Select
          label="Select Teacher"
          options={teacherOptions}
          value={selectedTeacher}
          onChange={setSelectedTeacher}
          error={errors?.teacher}
          placeholder="Choose a teacher"
          searchable
          required
        />

        <Select
          label="Select Subject"
          options={subjectOptions}
          value={selectedSubject}
          onChange={setSelectedSubject}
          error={errors?.subject}
          placeholder="Choose a subject"
          searchable
          required
        />

        {selectedTeacher && selectedSubject && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle" size={20} color="var(--color-success)" />
              <div>
                <p className="text-sm font-medium text-success">Assignment Preview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {availableTeachers?.find(t => t?.id === selectedTeacher)?.name} will be assigned to teach {selectedSubject}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TeacherAssignmentModal;