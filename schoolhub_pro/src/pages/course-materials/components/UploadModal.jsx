import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const UploadModal = ({ isOpen, onClose, subjects, onUpload }) => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    subject: '',
    fileType: '',
    files: []
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'docx', label: 'Word Document' },
    { value: 'pptx', label: 'Presentation' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' }
  ];

  const subjectOptions = subjects?.map(subject => ({
    value: subject?.id,
    label: subject?.name
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

  const handleUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onUpload(uploadData);
          setIsUploading(false);
          setUploadProgress(0);
          setUploadData({
            title: '',
            description: '',
            subject: '',
            fileType: '',
            files: []
          });
          onClose();
        }, 500);
      }
    }, 200);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024)?.toFixed(1) + ' KB';
    return (bytes / (1024 * 1024))?.toFixed(1) + ' MB';
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
            disabled={!uploadData?.title || !uploadData?.subject || uploadData?.files?.length === 0}
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
            required
          />

          <Select
            label="File Type"
            options={fileTypeOptions}
            value={uploadData?.fileType}
            onChange={(value) => setUploadData(prev => ({ ...prev, fileType: value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Upload Files
          </label>
          <div
            className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-smooth ${
              isDragging
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
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
              Supported formats: PDF, DOCX, PPTX, MP4, JPG, PNG (Max 50MB)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.docx,.pptx,.mp4,.jpg,.jpeg,.png"
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

        {isUploading && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground">Uploading...</span>
              <span className="text-muted-foreground">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UploadModal;