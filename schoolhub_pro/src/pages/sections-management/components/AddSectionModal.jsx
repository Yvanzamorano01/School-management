import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AddSectionModal = ({ isOpen, onClose, onSubmit, editingSection, classes, teachers = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    capacity: '',
    room: '',
    teachers: []
  });

  const [errors, setErrors] = useState({});
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    if (editingSection) {
      setFormData({
        id: editingSection?.id,
        name: editingSection?.name || '',
        classId: editingSection?.classId?.toString() || '',
        capacity: editingSection?.capacity?.toString() || '',
        room: editingSection?.room || '',
        teachers: editingSection?.teachers || []
      });
    } else {
      setFormData({
        name: '',
        classId: '',
        capacity: '',
        room: '',
        teachers: []
      });
    }
    setErrors({});
    setNewTeacherId('');
    setNewSubject('');
  }, [editingSection, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTeacher = () => {
    if (!newTeacherId) return;
    // Prevent duplicate teacher
    if (formData.teachers.some(t => t.teacherId === newTeacherId && t.subject === newSubject)) return;

    const teacher = teachers.find(t => t.id === newTeacherId);
    setFormData(prev => ({
      ...prev,
      teachers: [...prev.teachers, {
        teacherId: newTeacherId,
        name: teacher?.name || 'Unknown',
        subject: newSubject.trim()
      }]
    }));
    setNewTeacherId('');
    setNewSubject('');
  };

  const handleRemoveTeacher = (index) => {
    setFormData(prev => ({
      ...prev,
      teachers: prev.teachers.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Section name is required';
    }

    if (!formData?.classId) {
      newErrors.classId = 'Parent class is required';
    }

    if (!formData?.capacity || parseInt(formData?.capacity) <= 0) {
      newErrors.capacity = 'Valid capacity is required';
    }

    if (!formData?.room?.trim()) {
      newErrors.room = 'Room number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validate()) {
      // Format teachers for backend (only send teacherId + subject)
      const payload = {
        ...formData,
        teachers: formData.teachers.map(t => ({
          teacherId: t.teacherId,
          subject: t.subject
        }))
      };
      onSubmit(payload);
    }
  };

  const classOptions = (classes || []).map(cls => ({
    value: cls.id,
    label: cls.name
  }));

  // Filter out already-assigned teachers for the same subject
  const teacherOptions = (teachers || []).map(t => ({
    value: t.id,
    label: t.name
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSection ? 'Edit Section' : 'Add New Section'}
      description=""
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Parent Class Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Class <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData?.classId}
            onChange={(val) => handleChange('classId', val)}
            options={classOptions}
            placeholder="Select a class"
            error={errors?.classId}
          />
        </div>

        {/* Section Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData?.name}
            onChange={(e) => handleChange('name', e?.target?.value)}
            placeholder="e.g., Section A, Section B"
            className={errors?.name ? 'border-red-500' : ''}
          />
          {errors?.name && (
            <p className="mt-1 text-sm text-red-600">{errors?.name}</p>
          )}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={formData?.capacity}
            onChange={(e) => handleChange('capacity', e?.target?.value)}
            placeholder="e.g., 30"
            min="1"
            className={errors?.capacity ? 'border-red-500' : ''}
          />
          {errors?.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors?.capacity}</p>
          )}
        </div>

        {/* Room Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Number <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData?.room}
            onChange={(e) => handleChange('room', e?.target?.value)}
            placeholder="e.g., 101, A-205"
            className={errors?.room ? 'border-red-500' : ''}
          />
          {errors?.room && (
            <p className="mt-1 text-sm text-red-600">{errors?.room}</p>
          )}
        </div>

        {/* Assigned Teachers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Teachers
          </label>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <Select
                value={newTeacherId}
                onChange={(val) => setNewTeacherId(val)}
                options={teacherOptions}
                placeholder="Select teacher"
                searchable
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e?.target?.value)}
                placeholder="Subject (e.g., Math)"
              />
            </div>
            <Button type="button" onClick={handleAddTeacher} disabled={!newTeacherId} className="flex items-center gap-1">
              <Icon name="Plus" size={16} />
            </Button>
          </div>

          {/* List of assigned teachers */}
          {formData.teachers.length > 0 && (
            <div className="space-y-2 mt-2">
              {formData.teachers.map((teacher, index) => (
                <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="User" size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{teacher.name}</span>
                    {teacher.subject && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {teacher.subject}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeacher(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Section Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Each section must belong to exactly one class</li>
                <li>Assign teachers with their subject to this section</li>
                <li>Set appropriate capacity based on room size</li>
                <li>Students are enrolled in sections, enrolled count updates automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <Icon name={editingSection ? 'Save' : 'Plus'} size={18} />
            {editingSection ? 'Update Section' : 'Create Section'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSectionModal;
