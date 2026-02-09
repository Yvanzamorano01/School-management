import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const AssignFeeModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    class: '',
    feeTypes: []
  });
  const [errors, setErrors] = useState({});

  const studentOptions = [
    { value: 'STU001', label: 'John Smith (STU001)' },
    { value: 'STU002', label: 'Emma Johnson (STU002)' },
    { value: 'STU003', label: 'Michael Brown (STU003)' }
  ];

  const classOptions = [
    { value: 'grade-10', label: 'Grade 10' },
    { value: 'grade-11', label: 'Grade 11' },
    { value: 'grade-12', label: 'Grade 12' }
  ];

  const feeTypeOptions = [
    { value: 'tuition', label: 'Tuition ($15,000)' },
    { value: 'exam', label: 'Exam Fees ($2,500)' },
    { value: 'transport', label: 'Transport ($8,000)' },
    { value: 'other', label: 'Other Fees ($5,000)' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeeTypeToggle = (feeValue) => {
    setFormData(prev => {
      const currentFees = prev?.feeTypes || [];
      if (currentFees?.includes(feeValue)) {
        return { ...prev, feeTypes: currentFees?.filter(f => f !== feeValue) };
      } else {
        return { ...prev, feeTypes: [...currentFees, feeValue] };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.studentId) {
      newErrors.studentId = 'Please select a student';
    }

    if (!formData?.class) {
      newErrors.class = 'Please select a class';
    }

    if (!formData?.feeTypes || formData?.feeTypes?.length === 0) {
      newErrors.feeTypes = 'Select at least one fee type';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Fees to Student" description="" footer={null}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Student"
          placeholder="Choose student"
          options={studentOptions}
          value={formData?.studentId}
          onChange={(value) => handleInputChange('studentId', value)}
          error={errors?.studentId}
          required
        />

        <Select
          label="Class"
          placeholder="Choose class"
          options={classOptions}
          value={formData?.class}
          onChange={(value) => handleInputChange('class', value)}
          error={errors?.class}
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Fee Types *
          </label>
          <div className="space-y-2">
            {feeTypeOptions?.map((option) => (
              <label key={option?.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData?.feeTypes?.includes(option?.value)}
                  onChange={() => handleFeeTypeToggle(option?.value)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm text-foreground">{option?.label}</span>
              </label>
            ))}
          </div>
          {errors?.feeTypes && (
            <p className="text-sm text-error mt-1">{errors?.feeTypes}</p>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Automatic Fee Assignment:</p>
          <p className="text-xs text-foreground">Selected fees will be automatically assigned to the student based on their class and enrollment status.</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Assign Fees
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignFeeModal;