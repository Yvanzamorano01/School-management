import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const ClassFormModal = ({ isOpen, onClose, onSubmit, editingClass, academicYears = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    academicYearId: '',
    subjects: [],
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [subjectInput, setSubjectInput] = useState('');

  useEffect(() => {
    if (editingClass) {
      setFormData({
        id: editingClass?.id,
        name: editingClass?.name || '',
        code: editingClass?.code || '',
        description: editingClass?.description || '',
        academicYearId: editingClass?.academicYearId || '',
        subjects: editingClass?.subjects || [],
        isActive: editingClass?.isActive ?? true
      });
    } else {
      // Default to active academic year if available
      const activeYear = academicYears.find(y => y.isActive);
      setFormData({
        name: '',
        code: '',
        description: '',
        academicYearId: activeYear?.id || '',
        subjects: [],
        isActive: true
      });
    }
    setErrors({});
    setSubjectInput('');
  }, [editingClass, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddSubject = () => {
    if (subjectInput?.trim() && !formData?.subjects?.includes(subjectInput?.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev?.subjects, subjectInput?.trim()]
      }));
      setSubjectInput('');
    }
  };

  const handleRemoveSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev?.subjects?.filter(s => s !== subject)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData?.code?.trim()) {
      newErrors.code = 'Class code is required';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData?.academicYearId) {
      newErrors.academicYearId = 'Academic year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const academicYearOptions = academicYears.map(y => ({
    value: y.id,
    label: `${y.name}${y.isActive ? ' (Active)' : ''}`
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingClass ? 'Edit Class' : 'Add New Class'}
      description=""
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Class Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData?.name}
            onChange={(e) => handleChange('name', e?.target?.value)}
            placeholder="e.g., Grade 10, Form 1, Terminale"
            className={errors?.name ? 'border-red-500' : ''}
          />
          {errors?.name && (
            <p className="mt-1 text-sm text-red-600">{errors?.name}</p>
          )}
        </div>

        {/* Class Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Code <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData?.code}
            onChange={(e) => handleChange('code', e?.target?.value)}
            placeholder="e.g., G10, F1, TERM"
            className={errors?.code ? 'border-red-500' : ''}
          />
          {errors?.code && (
            <p className="mt-1 text-sm text-red-600">{errors?.code}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData?.description}
            onChange={(e) => handleChange('description', e?.target?.value)}
            placeholder="Describe the curriculum and academic focus"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors?.description ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors?.description && (
            <p className="mt-1 text-sm text-red-600">{errors?.description}</p>
          )}
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData?.academicYearId}
            onChange={(val) => handleChange('academicYearId', val)}
            options={academicYearOptions}
            placeholder="Select academic year"
            error={errors?.academicYearId}
          />
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e?.target?.value)}
              placeholder="Enter subject name"
              onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), handleAddSubject())}
            />
            <Button type="button" onClick={handleAddSubject} className="flex items-center gap-1">
              <Icon name="Plus" size={16} />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData?.subjects?.map((subject, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {subject}
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(subject)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <Icon name="X" size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <Checkbox
            checked={formData?.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
            id="isActive"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Active (visible to students and teachers)
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Class Definition:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>A Class represents the academic level (e.g., Grade 10, Form 1)</li>
                <li>It defines the curriculum, subjects, and exams</li>
                <li>Multiple Sections can be created within each Class</li>
                <li>Students belong to both a Class and a Section</li>
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
            <Icon name={editingClass ? 'Save' : 'Plus'} size={18} />
            {editingClass ? 'Update Class' : 'Create Class'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassFormModal;
