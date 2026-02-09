import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ManageClassModal = ({ isOpen, onClose, onSubmit, student, classOptions, sectionOptions }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setSelectedClass(student.classId || '');
      setSelectedSection(student.sectionId || '');
      setErrors({});
    }
  }, [student, isOpen]);

  // Filter sections based on selected class
  const filteredSections = useMemo(() => {
    if (!selectedClass) return [];
    return sectionOptions.filter(s => s.classId === selectedClass);
  }, [selectedClass, sectionOptions]);

  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedSection('');
    if (errors.class) setErrors(prev => ({ ...prev, class: '' }));
  };

  const handleSectionChange = (value) => {
    setSelectedSection(value);
    if (errors.section) setErrors(prev => ({ ...prev, section: '' }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!selectedClass) newErrors.class = 'Class is required';
    if (!selectedSection) newErrors.section = 'Section is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Check if anything changed
    if (selectedClass === student.classId && selectedSection === student.sectionId) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        studentId: student.id,
        classId: selectedClass,
        sectionId: selectedSection
      });
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  // Find current and new class/section names for display
  const currentClassName = classOptions.find(c => c.value === student?.classId)?.label || student?.class || 'N/A';
  const currentSectionName = student?.section || 'N/A';
  const newClassName = classOptions.find(c => c.value === selectedClass)?.label || '';
  const newSectionName = filteredSections.find(s => s.value === selectedSection)?.label || '';

  const hasChanges = selectedClass !== student?.classId || selectedSection !== student?.sectionId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Class Assignment"
      description={`Change class and section for ${student?.name || 'student'}`}
      size="default"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} iconName="Save" iconPosition="left" disabled={loading || !hasChanges}>
            {loading ? 'Updating...' : 'Update Assignment'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Current Assignment */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Info" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Current Assignment</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Class</span>
              <p className="text-sm font-medium text-foreground">{currentClassName}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Section</span>
              <p className="text-sm font-medium text-foreground">{currentSectionName}</p>
            </div>
          </div>
        </div>

        {/* New Assignment */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">New Assignment</h3>
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Class"
              placeholder="Select class"
              options={classOptions}
              value={selectedClass}
              onChange={handleClassChange}
              error={errors.class}
              required
            />
            <Select
              label="Section"
              placeholder="Select section"
              options={filteredSections}
              value={selectedSection}
              onChange={handleSectionChange}
              error={errors.section}
              required
              disabled={!selectedClass}
            />
          </div>
        </div>

        {/* Change Preview */}
        {hasChanges && selectedClass && selectedSection && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="ArrowRight" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Transfer Preview</span>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-medium">{student?.name}</span> will be moved from{' '}
              <span className="font-medium">{currentClassName} - {currentSectionName}</span> to{' '}
              <span className="font-medium">{newClassName}{newSectionName ? ` - ${newSectionName.split(' - ').pop()}` : ''}</span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManageClassModal;
