import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const GenerateReportModal = ({ isOpen, onClose, onSave, report, classes = [] }) => {
  const [formData, setFormData] = useState({
    dateFrom: '',
    dateTo: '',
    class: 'all',
    format: 'csv'
  });
  const [errors, setErrors] = useState({});

  const classOptions = [
    { value: 'all', label: 'All Classes' },
    ...classes.map(c => ({ value: c.value || c.id || c._id, label: c.label || c.name }))
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV File' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' }
  ];

  const needsClassFilter = report?.parameters?.includes('Class');
  const needsDateRange = report?.parameters?.includes('Date Range');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (needsDateRange) {
      if (!formData?.dateFrom) {
        newErrors.dateFrom = 'Start date is required';
      }
      if (!formData?.dateTo) {
        newErrors.dateTo = 'End date is required';
      }
      if (formData?.dateFrom && formData?.dateTo && formData?.dateFrom > formData?.dateTo) {
        newErrors.dateTo = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave?.({
        ...formData,
        reportId: report?.id,
        reportName: report?.name
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Report" footer={null} description="">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-foreground mb-1">{report?.name}</h3>
          <p className="text-sm text-muted-foreground">{report?.description}</p>
        </div>

        {needsDateRange && (
          <>
            <Input
              label="Start Date"
              type="date"
              value={formData?.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e?.target?.value)}
              error={errors?.dateFrom}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData?.dateTo}
              onChange={(e) => handleInputChange('dateTo', e?.target?.value)}
              error={errors?.dateTo}
              required
            />
          </>
        )}

        {needsClassFilter && (
          <Select
            label="Class"
            options={classOptions}
            value={formData?.class}
            onChange={(value) => handleInputChange('class', value)}
          />
        )}

        <Select
          label="Export Format"
          options={formatOptions}
          value={formData?.format}
          onChange={(value) => handleInputChange('format', value)}
        />

        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> Report generation may take a few moments depending on the data range and complexity.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth iconName="Download">
            Generate & Download
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateReportModal;
