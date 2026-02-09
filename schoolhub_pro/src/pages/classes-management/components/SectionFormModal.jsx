import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SectionFormModal = ({ isOpen, onClose, onSubmit, classData }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    room: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        capacity: '',
        room: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.name?.trim()) newErrors.name = 'Section name is required';
    if (!formData?.capacity || parseInt(formData?.capacity) <= 0) {
      newErrors.capacity = 'Valid capacity is required';
    }
    if (!formData?.room?.trim()) newErrors.room = 'Room number is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      ...formData,
      capacity: parseInt(formData?.capacity),
      classId: classData?.id
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Section"
      description={`Create a new section for ${classData?.name || 'this class'}`}
      size="default"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Section
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Section Name"
          type="text"
          placeholder="e.g., Section A"
          value={formData?.name}
          onChange={(e) => handleChange('name', e?.target?.value)}
          error={errors?.name}
          required
        />

        <Input
          label="Section Capacity"
          type="number"
          placeholder="e.g., 30"
          value={formData?.capacity}
          onChange={(e) => handleChange('capacity', e?.target?.value)}
          error={errors?.capacity}
          description="Maximum number of students in this section"
          required
        />

        <Input
          label="Room Number"
          type="text"
          placeholder="e.g., 101"
          value={formData?.room}
          onChange={(e) => handleChange('room', e?.target?.value)}
          error={errors?.room}
          required
        />
      </form>
    </Modal>
  );
};

export default SectionFormModal;