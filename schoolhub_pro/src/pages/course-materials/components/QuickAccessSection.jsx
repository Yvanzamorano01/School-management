import React from 'react';
import Icon from '../../../components/AppIcon';


const QuickAccessSection = ({ recentMaterials, popularMaterials, onMaterialClick }) => {
  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Uploads</h3>
          <Icon name="Clock" size={20} className="text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {recentMaterials?.map((material) => (
            <button
              key={material?.id}
              onClick={() => onMaterialClick(material)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-smooth text-left"
            >
              <div className={`w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 ${getFileColor(material?.fileType)}`}>
                <Icon name={getFileIcon(material?.fileType)} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {material?.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(material?.uploadDate)} • {material?.uploadedBy}
                </p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Popular Downloads</h3>
          <Icon name="TrendingUp" size={20} className="text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {popularMaterials?.map((material) => (
            <button
              key={material?.id}
              onClick={() => onMaterialClick(material)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-smooth text-left"
            >
              <div className={`w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 ${getFileColor(material?.fileType)}`}>
                <Icon name={getFileIcon(material?.fileType)} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {material?.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {material?.downloads} downloads • {material?.subject}
                </p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickAccessSection;