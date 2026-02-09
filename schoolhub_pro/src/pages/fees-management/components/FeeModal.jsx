import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FeeModal = ({ isOpen, onClose, onSave, editingFee }) => {
  const [formData, setFormData] = useState({
    feeType: '',
    class: '',
    amount: '',
    frequency: '',
    dueDate: '',
    installments: '1',
    status: 'Active'
  });

  useEffect(() => {
    if (editingFee) {
      setFormData({
        feeType: editingFee?.feeType || '',
        class: editingFee?.class || '',
        amount: editingFee?.amount?.toString() || '',
        frequency: editingFee?.frequency || '',
        dueDate: editingFee?.dueDate || '',
        installments: editingFee?.installments?.toString() || '1',
        status: editingFee?.status || 'Active'
      });
    } else {
      setFormData({
        feeType: '',
        class: '',
        amount: '',
        frequency: '',
        dueDate: '',
        installments: '1',
        status: 'Active'
      });
    }
  }, [editingFee]);

  const feeTypeOptions = [
    { value: 'Tuition Fee', label: 'Tuition Fee' },
    { value: 'Examination Fee', label: 'Examination Fee' },
    { value: 'Transport Fee', label: 'Transport Fee' },
    { value: 'Library Fee', label: 'Library Fee' },
    { value: 'Sports Fee', label: 'Sports Fee' },
    { value: 'Laboratory Fee', label: 'Laboratory Fee' },
    { value: 'Miscellaneous', label: 'Miscellaneous' }
  ];

  const classOptions = [
    { value: 'All Classes', label: 'All Classes' },
    { value: 'Class 10', label: 'Class 10' },
    { value: 'Class 9', label: 'Class 9' },
    { value: 'Class 8', label: 'Class 8' }
  ];

  const frequencyOptions = [
    { value: 'Annual', label: 'Annual' },
    { value: 'Semester', label: 'Semester' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Monthly', label: 'Monthly' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave?.(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingFee ? 'Edit Fee Structure' : 'Add Fee Structure'}
      description=""
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingFee ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Fee Type"
          options={feeTypeOptions}
          value={formData?.feeType}
          onChange={(value) => setFormData({ ...formData, feeType: value })}
          searchable
          required
        />
        <Select
          label="Applicable Class"
          options={classOptions}
          value={formData?.class}
          onChange={(value) => setFormData({ ...formData, class: value })}
          required
        />
        <Input
          label="Amount"
          type="number"
          placeholder="Enter amount"
          value={formData?.amount}
          onChange={(e) => setFormData({ ...formData, amount: e?.target?.value })}
          required
        />
        <Select
          label="Frequency"
          options={frequencyOptions}
          value={formData?.frequency}
          onChange={(value) => setFormData({ ...formData, frequency: value })}
          required
        />
        <Input
          label="Due Date"
          type="date"
          value={formData?.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e?.target?.value })}
          required
        />
        <Input
          label="Number of Installments"
          type="number"
          min="1"
          value={formData?.installments}
          onChange={(e) => setFormData({ ...formData, installments: e?.target?.value })}
          required
        />
        <Select
          label="Status"
          options={statusOptions}
          value={formData?.status}
          onChange={(value) => setFormData({ ...formData, status: value })}
          required
        />
      </form>
    </Modal>
  );
};

export default FeeModal;