import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClassCard = ({ classData, onEdit, onDelete }) => {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <Icon name="BookOpen" size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-foreground">{classData?.name}</h3>
              <p className="text-sm text-primary-foreground/80">{classData?.code}</p>
            </div>
          </div>
          {classData?.isActive && (
            <span className="px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {classData?.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Icon name="Users" size={16} className="text-muted-foreground mr-2" />
              <span className="text-xs text-muted-foreground">Students</span>
            </div>
            <p className="text-lg font-bold text-foreground">{classData?.totalStudents}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Icon name="Layers" size={16} className="text-muted-foreground mr-2" />
              <span className="text-xs text-muted-foreground">Sections</span>
            </div>
            <p className="text-lg font-bold text-foreground">{classData?.totalSections}</p>
          </div>
        </div>

        {/* Academic Year */}
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Icon name="Calendar" size={16} className="mr-2" />
          <span>Academic Year: {classData?.academicYear}</span>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <p className="text-xs font-medium text-foreground mb-2">Subjects ({classData?.subjects?.length || 0})</p>
          <div className="flex flex-wrap gap-1">
            {classData?.subjects?.slice(0, 3)?.map((subject, index) => (
              <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {subject}
              </span>
            ))}
            {classData?.subjects?.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                +{classData?.subjects?.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Exams */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Exams</p>
          <div className="flex flex-wrap gap-1">
            {classData?.exams?.map((exam, index) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {exam}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            onClick={() => onEdit(classData)}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Icon name="Pencil" size={16} />
            Edit
          </Button>
          <Button
            onClick={() => onDelete(classData?.id)}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border-red-200"
          >
            <Icon name="Trash2" size={16} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;