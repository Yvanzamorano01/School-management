import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const CreateExamModal = ({ isOpen, onClose, onCreate, classes, subjects }) => {
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classId: '',
    date: '',
    duration: '',
    totalMarks: '',
    passingMarks: ''
  });

  const handleSubmit = () => {
    onCreate({
      title: formData.title,
      subjectId: formData.subjectId,
      classId: formData.classId,
      date: formData.date,
      duration: formData.duration ? parseInt(formData.duration) : 60,
      totalMarks: parseInt(formData.totalMarks),
      passingMarks: formData.passingMarks ? parseInt(formData.passingMarks) : undefined
    });
    setFormData({
      title: '',
      subjectId: '',
      classId: '',
      date: '',
      duration: '',
      totalMarks: '',
      passingMarks: ''
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Exam"
      description="Set up a new exam for students"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.subjectId || !formData.classId || !formData.date || !formData.totalMarks}
          >
            Create Exam
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Exam Title"
          type="text"
          placeholder="e.g., Mid-Term Mathematics Exam"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Subject"
            options={subjects}
            value={formData.subjectId}
            onChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
            required
          />
          <Select
            label="Class"
            options={classes}
            value={formData.classId}
            onChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Exam Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
          <Input
            label="Duration (minutes)"
            type="number"
            placeholder="e.g., 120"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Total Marks"
            type="number"
            placeholder="e.g., 100"
            value={formData.totalMarks}
            onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))}
            required
          />
          <Input
            label="Passing Marks"
            type="number"
            placeholder="e.g., 40"
            value={formData.passingMarks}
            onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: e.target.value }))}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateExamModal;
