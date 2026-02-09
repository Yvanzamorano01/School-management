import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const RecordPaymentModal = ({ isOpen, onClose, onSave, student }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date()?.toISOString()?.split('T')?.[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'mobile-money', label: 'Mobile Money' },
    { value: 'cheque', label: 'Cheque' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    const maxAmount = student?.outstandingBalance || 0;
    if (parseFloat(formData?.amount) > maxAmount) {
      newErrors.amount = `Le montant ne peut pas dépasser le solde restant (${maxAmount?.toLocaleString()} FCFA)`;
    }

    if (!formData?.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave?.(formData);
      setFormData({
        amount: '',
        paymentMethod: 'cash',
        paymentDate: new Date()?.toISOString()?.split('T')?.[0],
        notes: ''
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" description="" footer={null}>
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Student:</span>
          <span className="font-semibold text-foreground">{student?.studentName}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Fees:</span>
          <span className="font-semibold text-foreground">{student?.totalFees?.toLocaleString()} FCFA</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Paid Amount:</span>
          <span className="font-semibold text-success">{student?.paidAmount?.toLocaleString()} FCFA</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Outstanding:</span>
          <span className="font-semibold text-error">{student?.outstandingBalance?.toLocaleString()} FCFA</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Payment Amount"
          type="number"
          placeholder="Enter amount"
          value={formData?.amount}
          onChange={(e) => handleInputChange('amount', e?.target?.value)}
          error={errors?.amount}
          required
        />

        <Select
          label="Payment Method"
          options={paymentMethodOptions}
          value={formData?.paymentMethod}
          onChange={(value) => handleInputChange('paymentMethod', value)}
          required
        />

        <Input
          label="Payment Date"
          type="date"
          value={formData?.paymentDate}
          onChange={(e) => handleInputChange('paymentDate', e?.target?.value)}
          error={errors?.paymentDate}
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData?.notes}
            onChange={(e) => handleInputChange('notes', e?.target?.value)}
            placeholder="Add any notes about this payment..."
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" iconName="Check">
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;