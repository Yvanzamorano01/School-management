import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AddSubjectModal = ({ isOpen, onClose, onSubmit, classes, editingSubject }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    classId: '',
    description: '',
    hoursPerWeek: '',
    chapters: []
  });

  const [newChapter, setNewChapter] = useState({ title: '', description: '', topics: '' });

  useEffect(() => {
    if (editingSubject) {
      setFormData({
        id: editingSubject.id,
        name: editingSubject.name || '',
        code: editingSubject.code || '',
        classId: editingSubject.classId || '',
        description: editingSubject.description || '',
        hoursPerWeek: editingSubject.hoursPerWeek?.toString() || '',
        chapters: editingSubject.chapters || []
      });
    } else {
      setFormData({ name: '', code: '', classId: '', description: '', hoursPerWeek: '', chapters: [] });
    }
    setNewChapter({ title: '', description: '', topics: '' });
  }, [editingSubject, isOpen]);

  const handleAddChapter = () => {
    if (newChapter?.title && newChapter?.description) {
      setFormData(prev => ({
        ...prev,
        chapters: [...prev.chapters, {
          number: prev.chapters.length + 1,
          title: newChapter.title,
          description: newChapter.description,
          topics: parseInt(newChapter.topics) || 0
        }]
      }));
      setNewChapter({ title: '', description: '', topics: '' });
    }
  };

  const handleRemoveChapter = (index) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index).map((ch, i) => ({ ...ch, number: i + 1 }))
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.classId) return;
    // Clean chapters: remove MongoDB _id fields to avoid conflicts on update
    const cleanChapters = formData.chapters.map(({ _id, ...rest }) => rest);
    const payload = {
      name: formData.name,
      code: formData.code,
      classId: formData.classId,
      description: formData.description,
      hoursPerWeek: parseInt(formData.hoursPerWeek) || 0,
      chapters: cleanChapters
    };
    if (formData.id) payload.id = formData.id;
    onSubmit(payload);
  };

  const isEditing = !!editingSubject;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Subject' : 'Add New Subject'}
      description={isEditing ? 'Update subject details and chapters' : 'Create a new subject with syllabus and chapters'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!formData?.name || !formData?.code || !formData?.classId}
          >
            {isEditing ? 'Update Subject' : 'Add Subject'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Subject Name"
            type="text"
            placeholder="e.g., Mathematics"
            value={formData?.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e?.target?.value }))}
            required
          />
          <Input
            label="Subject Code"
            type="text"
            placeholder="e.g., MATH"
            value={formData?.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e?.target?.value?.toUpperCase() }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Class"
            options={classes}
            value={formData?.classId}
            onChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
            required
          />
          <Input
            label="Hours per Week"
            type="number"
            placeholder="e.g., 5"
            value={formData?.hoursPerWeek}
            onChange={(e) => setFormData(prev => ({ ...prev, hoursPerWeek: e?.target?.value }))}
          />
        </div>

        <Input
          label="Description"
          type="text"
          placeholder="Brief description of the subject"
          value={formData?.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e?.target?.value }))}
        />

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-3">Chapters</p>

          <div className="space-y-3 mb-4">
            <Input
              label="Chapter Title"
              type="text"
              placeholder="e.g., Algebra Basics"
              value={newChapter?.title}
              onChange={(e) => setNewChapter(prev => ({ ...prev, title: e?.target?.value }))}
            />
            <Input
              label="Chapter Description"
              type="text"
              placeholder="Brief description"
              value={newChapter?.description}
              onChange={(e) => setNewChapter(prev => ({ ...prev, description: e?.target?.value }))}
            />
            <Input
              label="Number of Topics"
              type="number"
              placeholder="e.g., 12"
              value={newChapter?.topics}
              onChange={(e) => setNewChapter(prev => ({ ...prev, topics: e?.target?.value }))}
            />
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={handleAddChapter}
              disabled={!newChapter?.title || !newChapter?.description}
            >
              Add Chapter
            </Button>
          </div>

          {formData?.chapters?.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formData.chapters.map((chapter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Chapter {chapter?.number}: {chapter?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{chapter?.description} • {chapter?.topics} topics</p>
                  </div>
                  <button
                    onClick={() => handleRemoveChapter(index)}
                    className="p-1 hover:bg-background rounded transition-smooth"
                  >
                    <Icon name="X" size={16} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddSubjectModal;
