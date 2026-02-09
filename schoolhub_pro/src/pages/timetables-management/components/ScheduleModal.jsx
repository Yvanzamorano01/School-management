import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const TIME_SLOTS = [
  { value: '08:00-09:00', label: '08:00 - 09:00' },
  { value: '09:00-09:55', label: '09:00 - 09:55' },
  { value: '10:05-11:05', label: '10:05 - 11:05' },
  { value: '11:05-12:00', label: '11:05 - 12:00' },
  { value: '14:00-14:55', label: '14:00 - 14:55' },
  { value: '15:05-16:05', label: '15:05 - 16:05' },
  { value: '16:05-17:00', label: '16:05 - 17:00' }
];

const DAY_OPTIONS = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' }
];

const TYPE_OPTIONS = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' }
];

const ScheduleModal = ({ isOpen, onClose, onSave, editingSlot, subjects = [], teachers = [], sections = [], selectedClassId }) => {
  const [formData, setFormData] = useState({
    day: '',
    timeSlot: '',
    subjectId: '',
    teacherId: '',
    sectionId: '',
    room: '',
    type: 'lecture'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSlot) {
      const timeSlot = `${editingSlot.startTime}-${editingSlot.endTime}`;
      setFormData({
        day: editingSlot.day || '',
        timeSlot,
        subjectId: editingSlot.subjectId?._id || editingSlot.subjectId || '',
        teacherId: editingSlot.teacherId?._id || editingSlot.teacherId || '',
        sectionId: editingSlot.sectionId?._id || editingSlot.sectionId || '',
        room: editingSlot.room || '',
        type: editingSlot.type || 'lecture'
      });
    } else {
      setFormData({ day: '', timeSlot: '', subjectId: '', teacherId: '', sectionId: '', room: '', type: 'lecture' });
    }
    setError('');
  }, [editingSlot, isOpen]);

  const subjectOptions = subjects.map(s => ({ value: s.id || s._id, label: `${s.name} (${s.code})` }));
  const teacherOptions = teachers.map(t => ({ value: t.id || t._id, label: t.name }));
  const sectionOptions = [
    { value: '', label: 'Whole class' },
    ...sections.map(s => ({ value: s.id || s._id, label: s.name }))
  ];

  const handleSubmit = () => {
    if (!formData.day || !formData.timeSlot || !formData.subjectId || !formData.teacherId) {
      setError('Day, time, subject and teacher are required');
      return;
    }

    const [startTime, endTime] = formData.timeSlot.split('-');
    const payload = {
      classId: selectedClassId,
      day: formData.day,
      startTime,
      endTime,
      subjectId: formData.subjectId,
      teacherId: formData.teacherId,
      sectionId: formData.sectionId || undefined,
      room: formData.room,
      type: formData.type
    };

    setError('');
    onSave(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSlot ? 'Edit Class' : 'Add Class'}
      description=""
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.day || !formData.timeSlot || !formData.subjectId || !formData.teacherId}>
            {editingSlot ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Day"
            options={DAY_OPTIONS}
            value={formData.day}
            onChange={(val) => setFormData(prev => ({ ...prev, day: val }))}
          />
          <Select
            label="Time Slot"
            options={TIME_SLOTS}
            value={formData.timeSlot}
            onChange={(val) => setFormData(prev => ({ ...prev, timeSlot: val }))}
          />
        </div>

        <Select
          label="Subject"
          options={subjectOptions}
          value={formData.subjectId}
          onChange={(val) => setFormData(prev => ({ ...prev, subjectId: val }))}
        />

        <Select
          label="Teacher"
          options={teacherOptions}
          value={formData.teacherId}
          onChange={(val) => setFormData(prev => ({ ...prev, teacherId: val }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Section (optional)"
            options={sectionOptions}
            value={formData.sectionId}
            onChange={(val) => setFormData(prev => ({ ...prev, sectionId: val }))}
          />
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={formData.type}
            onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Room</label>
          <input
            type="text"
            placeholder="e.g. Room 101"
            value={formData.room}
            onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
