import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const AddFeeTypeModal = ({ isOpen, onClose, onSave, editingFeeType }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    dueDate: '',
    frequency: 'Annual',
    applicableClasses: [],
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingFeeType) {
      setFormData(editingFeeType);
    } else {
      setFormData({
        name: '',
        description: '',
        amount: '',
        dueDate: '',
        frequency: 'Annual',
        applicableClasses: [],
        status: 'Active'
      });
    }
  }, [editingFeeType]);

  const frequencyOptions = [
    { value: 'Annual', label: 'Annual' },
    { value: 'Semester', label: 'Semester' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'One-time', label: 'One-time' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const classOptions = [
    { value: 'All Classes', label: 'All Classes' },
    { value: 'Grade 10', label: 'Grade 10' },
    { value: 'Grade 11', label: 'Grade 11' },
    { value: 'Grade 12', label: 'Grade 12' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClassToggle = (classValue) => {
    setFormData(prev => {
      const currentClasses = prev?.applicableClasses || [];
      if (currentClasses?.includes(classValue)) {
        return { ...prev, applicableClasses: currentClasses?.filter(c => c !== classValue) };
      } else {
        return { ...prev, applicableClasses: [...currentClasses, classValue] };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Fee type name is required';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData?.amount || formData?.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData?.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData?.applicableClasses || formData?.applicableClasses?.length === 0) {
      newErrors.applicableClasses = 'Select at least one class';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave?.(formData);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingFeeType ? 'Edit Fee Type' : 'Add Fee Type'}
      description=""
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Fee Type Name"
          placeholder="e.g., Tuition, Exam Fees"
          value={formData?.name}
          onChange={(e) => handleInputChange('name', e?.target?.value)}
          error={errors?.name}
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            placeholder="Enter fee type description"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
          />
          {errors?.description && (
            <p className="text-sm text-error mt-1">{errors?.description}</p>
          )}
        </div>

        <Input
          label="Amount ($)"
          type="number"
          placeholder="Enter amount"
          value={formData?.amount}
          onChange={(e) => handleInputChange('amount', parseFloat(e?.target?.value))}
          error={errors?.amount}
          required
        />

        <Input
          label="Due Date"
          type="date"
          value={formData?.dueDate}
          onChange={(e) => handleInputChange('dueDate', e?.target?.value)}
          error={errors?.dueDate}
          required
        />

        <Select
          label="Frequency"
          options={frequencyOptions}
          value={formData?.frequency}
          onChange={(value) => handleInputChange('frequency', value)}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Applicable Classes *
          </label>
          <div className="space-y-2">
            {classOptions?.map((option) => (
              <label key={option?.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData?.applicableClasses?.includes(option?.value)}
                  onChange={() => handleClassToggle(option?.value)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm text-foreground">{option?.label}</span>
              </label>
            ))}
          </div>
          {errors?.applicableClasses && (
            <p className="text-sm text-error mt-1">{errors?.applicableClasses}</p>
          )}
        </div>

        <Select
          label="Status"
          options={statusOptions}
          value={formData?.status}
          onChange={(value) => handleInputChange('status', value)}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {editingFeeType ? 'Update' : 'Add'} Fee Type
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFeeTypeModal;