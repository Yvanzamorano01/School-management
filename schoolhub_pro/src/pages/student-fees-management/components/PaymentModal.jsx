import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/format';

const PaymentModal = ({ isOpen, onClose, onSave, student, currency }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date()?.toISOString()?.split('T')?.[0],
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
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

    if (!formData?.amount || formData?.amount <= 0) {
      newErrors.amount = 'Valid payment amount is required';
    }

    if (parseFloat(formData?.amount) > student?.pendingAmount) {
      newErrors.amount = `Le montant ne peut pas dépasser le solde restant (${formatCurrency(student?.pendingAmount, currency)})`;
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
      onSave?.({
        ...formData,
        studentId: student?.id
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" description="" footer={null}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">{student?.studentName}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Montant total:</span>
              <p className="font-semibold text-foreground">{formatCurrency(student?.totalAmount, currency)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payé:</span>
              <p className="font-semibold text-success">{formatCurrency(student?.paidAmount, currency)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Restant:</span>
              <p className="font-semibold text-warning">{formatCurrency(student?.pendingAmount, currency)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-semibold text-foreground">{student?.status}</p>
            </div>
          </div>
        </div>

        <Input
          label="Montant du paiement (FCFA)"
          type="number"
          placeholder="Enter payment amount"
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
            placeholder="Add any additional notes"
            value={formData?.notes}
            onChange={(e) => handleInputChange('notes', e?.target?.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;