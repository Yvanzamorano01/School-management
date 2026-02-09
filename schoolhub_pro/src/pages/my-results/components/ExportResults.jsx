import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ExportResults = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeGrades: true,
    includeComments: true,
    includeAnalytics: false,
    format: 'pdf'
  });

  const handleExport = () => {
    console.log('Exporting results with options:', exportOptions);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        iconName="Download"
        iconPosition="left"
        onClick={() => setIsModalOpen(true)}
      >
        Export Results
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Export Academic Results"
        description="Choose what to include in your exported transcript"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" iconName="Download" onClick={handleExport}>
              Export
            </Button>
          </>
        }
      >
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportOptions({ ...exportOptions, format: 'pdf' })}
                className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-smooth ${
                  exportOptions?.format === 'pdf' ?'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
                }`}
              >
                <Icon name="FileText" size={20} className={exportOptions?.format === 'pdf' ? 'text-primary' : 'text-muted-foreground'} />
                <span className="text-sm font-medium text-foreground">PDF</span>
              </button>
              <button
                onClick={() => setExportOptions({ ...exportOptions, format: 'excel' })}
                className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-smooth ${
                  exportOptions?.format === 'excel' ?'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
                }`}
              >
                <Icon name="FileSpreadsheet" size={20} className={exportOptions?.format === 'excel' ? 'text-primary' : 'text-muted-foreground'} />
                <span className="text-sm font-medium text-foreground">Excel</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Include in Export</label>
            <div className="space-y-3">
              <Checkbox
                label="Grades and Marks"
                description="Include all subject grades and marks"
                checked={exportOptions?.includeGrades}
                onChange={(e) => setExportOptions({ ...exportOptions, includeGrades: e?.target?.checked })}
              />
              <Checkbox
                label="Teacher Comments"
                description="Include feedback from teachers"
                checked={exportOptions?.includeComments}
                onChange={(e) => setExportOptions({ ...exportOptions, includeComments: e?.target?.checked })}
              />
              <Checkbox
                label="Performance Analytics"
                description="Include charts and trend analysis"
                checked={exportOptions?.includeAnalytics}
                onChange={(e) => setExportOptions({ ...exportOptions, includeAnalytics: e?.target?.checked })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExportResults;