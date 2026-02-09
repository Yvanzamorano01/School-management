import React from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PreviewModal = ({ isOpen, onClose, material, onDownload }) => {
  if (!material) return null;

  const renderPreview = () => {
    switch (material?.fileType) {
      case 'pdf':
        return (
          <div className="w-full h-96 md:h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="FileText" size={64} className="mx-auto mb-4 text-red-600" />
              <p className="text-foreground font-medium mb-2">PDF Document</p>
              <p className="text-sm text-muted-foreground mb-4">
                Preview not available. Download to view.
              </p>
              <Button
                variant="default"
                iconName="Download"
                iconPosition="left"
                onClick={() => onDownload(material)}
              >
                Download PDF
              </Button>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-96 md:h-[500px] bg-muted rounded-lg overflow-hidden">
            <Image
              src={material?.previewUrl || material?.thumbnail}
              alt={material?.thumbnailAlt}
              className="w-full h-full object-contain"
            />
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-96 md:h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="Video" size={64} className="mx-auto mb-4 text-purple-600" />
              <p className="text-foreground font-medium mb-2">Video Content</p>
              <p className="text-sm text-muted-foreground mb-4">
                Video preview not available. Download to watch.
              </p>
              <Button
                variant="default"
                iconName="Download"
                iconPosition="left"
                onClick={() => onDownload(material)}
              >
                Download Video
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-96 md:h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="File" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground font-medium mb-2">Document Preview</p>
              <p className="text-sm text-muted-foreground mb-4">
                Preview not available for this file type.
              </p>
              <Button
                variant="default"
                iconName="Download"
                iconPosition="left"
                onClick={() => onDownload(material)}
              >
                Download File
              </Button>
            </div>
          </div>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024)?.toFixed(1) + ' KB';
    return (bytes / (1024 * 1024))?.toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={material?.title}
      description={material?.description}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={() => onDownload(material)}
          >
            Download
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {renderPreview()}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">File Type</p>
            <p className="text-sm font-medium text-foreground uppercase">{material?.fileType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">File Size</p>
            <p className="text-sm font-medium text-foreground">{formatFileSize(material?.fileSize)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Uploaded By</p>
            <p className="text-sm font-medium text-foreground">{material?.uploadedBy}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Upload Date</p>
            <p className="text-sm font-medium text-foreground">{formatDate(material?.uploadDate)}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PreviewModal;