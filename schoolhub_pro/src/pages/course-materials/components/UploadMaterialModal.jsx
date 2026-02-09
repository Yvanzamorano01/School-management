import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const initialFormState = {
  title: '',
  description: '',
  subject: '',
  classId: '',
  materialType: '',
  files: []
};

const UploadMaterialModal = ({ isOpen, onClose, subjects, classes, materialTypes, onUpload }) => {
  const [uploadData, setUploadData] = useState(initialFormState);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setUploadData(initialFormState);
      setIsUploading(false);
    }
  }, [isOpen]);

  // Map subjects and classes to Select option format { value, label }
  const subjectOptions = (subjects || []).map(s => ({
    value: s.id,
    label: s.name
  }));

  const classOptions = (classes || []).map(c => ({
    value: c.id,
    label: c.name
  }));

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    const files = Array.from(e?.dataTransfer?.files);
    setUploadData(prev => ({ ...prev, files }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    setUploadData(prev => ({ ...prev, files }));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await onUpload(uploadData);
    } catch (err) {
      // Parent handles error display
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024)?.toFixed(1) + ' KB';
    return (bytes / (1024 * 1024))?.toFixed(1) + ' MB';
  };

  const isFormValid = () => {
    return uploadData?.title && uploadData?.subject && uploadData?.classId && uploadData?.materialType && uploadData?.files?.length > 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Course Material"
      description="Add new educational resources for students"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleUpload}
            loading={isUploading}
            disabled={!isFormValid()}
          >
            Upload Material
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Material Title"
          type="text"
          placeholder="Enter material title"
          value={uploadData?.title}
          onChange={(e) => setUploadData(prev => ({ ...prev, title: e?.target?.value }))}
          required
        />

        <Input
          label="Description"
          type="text"
          placeholder="Brief description of the material"
          value={uploadData?.description}
          onChange={(e) => setUploadData(prev => ({ ...prev, description: e?.target?.value }))}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Subject"
            options={subjectOptions}
            value={uploadData?.subject}
            onChange={(value) => setUploadData(prev => ({ ...prev, subject: value }))}
            placeholder="Select a subject"
            required
          />

          <Select
            label="Class"
            options={classOptions}
            value={uploadData?.classId}
            onChange={(value) => setUploadData(prev => ({ ...prev, classId: value }))}
            placeholder="Select a class"
            required
          />
        </div>

        <Select
          label="Material Type"
          options={materialTypes}
          value={uploadData?.materialType}
          onChange={(value) => setUploadData(prev => ({ ...prev, materialType: value }))}
          placeholder="Select material type"
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Upload Files
          </label>
          <div
            className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-smooth ${
              isDragging
                ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon name="Upload" size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm md:text-base text-foreground mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mb-4">
              Supported formats: PDF, DOCX, PPT, JPG, PNG (Max 50MB)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        </div>

        {uploadData?.files?.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Selected Files ({uploadData?.files?.length})
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadData?.files?.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon name="File" size={20} className="text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file?.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadData(prev => ({
                        ...prev,
                        files: prev?.files?.filter((_, i) => i !== index)
                      }));
                    }}
                    className="p-1 hover:bg-background rounded transition-smooth"
                  >
                    <Icon name="X" size={16} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UploadMaterialModal;