import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MaterialCard = ({ material, onPreview, onDownload, onDelete, userRole }) => {
  const getFileIcon = (type) => {
    const icons = {
      pdf: 'FileText',
      docx: 'FileType',
      pptx: 'Presentation',
      video: 'Video',
      image: 'Image'
    };
    return icons?.[type] || 'File';
  };

  const getFileColor = (type) => {
    const colors = {
      pdf: 'text-red-600',
      docx: 'text-blue-600',
      pptx: 'text-orange-600',
      video: 'text-purple-600',
      image: 'text-green-600'
    };
    return colors?.[type] || 'text-gray-600';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024)?.toFixed(1) + ' KB';
    return (bytes / (1024 * 1024))?.toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-shrink-0">
          <div className="w-full lg:w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {material?.thumbnail ? (
              <Image
                src={material?.thumbnail}
                alt={material?.thumbnailAlt}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon
                name={getFileIcon(material?.fileType)}
                size={32}
                className={getFileColor(material?.fileType)}
              />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
                  {material?.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {material?.description}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium uppercase ${getFileColor(material?.fileType)} bg-muted whitespace-nowrap`}>
                {material?.fileType}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary whitespace-nowrap">
                {material?.materialType}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            <div className="flex items-center gap-1">
              <Icon name="BookOpen" size={14} />
              <span>{material?.subject}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Users" size={14} />
              <span>{material?.className}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="User" size={14} />
              <span>{material?.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={14} />
              <span>{formatDate(material?.uploadDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="HardDrive" size={14} />
              <span>{formatFileSize(material?.fileSize)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Download" size={14} />
              <span>{material?.downloads} downloads</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              onClick={() => onPreview(material)}
            >
              Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={() => onDownload(material)}
            >
              Download
            </Button>
            {(userRole === 'teacher' || userRole === 'admin') && (
              <Button
                variant="ghost"
                size="sm"
                iconName="Trash2"
                iconPosition="left"
                onClick={() => onDelete?.(material)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;