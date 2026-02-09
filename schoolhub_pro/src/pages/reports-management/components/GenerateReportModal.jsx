import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const GenerateReportModal = ({ isOpen, onClose, onSave, report }) => {
  const [formData, setFormData] = useState({
    dateFrom: '',
    dateTo: '',
    class: 'all',
    format: 'pdf'
  });
  const [errors, setErrors] = useState({});

  const classOptions = [
    { value: 'all', label: 'All Classes' },
    { value: 'grade-10', label: 'Grade 10' },
    { value: 'grade-11', label: 'Grade 11' },
    { value: 'grade-12', label: 'Grade 12' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.dateFrom) {
      newErrors.dateFrom = 'Start date is required';
    }

    if (!formData?.dateTo) {
      newErrors.dateTo = 'End date is required';
    }

    if (formData?.dateFrom && formData?.dateTo && formData?.dateFrom > formData?.dateTo) {
      newErrors.dateTo = 'End date must be after start date';
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

        <Select
          label="Class"
          options={classOptions}
          value={formData?.class}
          onChange={(value) => handleInputChange('class', value)}
        />

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