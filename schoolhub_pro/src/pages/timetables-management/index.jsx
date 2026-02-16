import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import TimetableGrid, { DAYS, DAY_LABELS, FULL_SCHEDULE } from './components/TimetableGrid';
import ScheduleModal from './components/ScheduleModal';
import timetableService from '../../services/timetableService';
import classService from '../../services/classService';
import subjectService from '../../services/subjectService';
import teacherService from '../../services/teacherService';
import sectionService from '../../services/sectionService';

const TimetablesManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const gridRef = useRef(null);

  // API Data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [timetableData, setTimetableData] = useState([]);

  // Role detection
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'student');
  const SidebarComponent = userRole === 'admin' ? AdminSidebar : userRole === 'teacher' ? TeacherSidebar : StudentSidebar;
  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  const breadcrumbItems = [
    { label: 'Dashboard', path: dashboardPath },
    { label: 'Timetables', path: '/timetables-management' }
  ];

  // Load reference data on mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Load timetable when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass]);

  const fetchReferenceData = async () => {
    try {
      const [classesData, subjectsData, teachersData] = await Promise.all([
        classService.getAll(),
        subjectService.getAll(),
        teacherService.getAll()
      ]);

      const formattedClasses = classesData.map(c => ({
        id: c._id || c.id,
        name: c.name,
        code: c.code
      }));
      setClasses(formattedClasses);

      setSubjects(subjectsData.map(s => ({
        id: s._id || s.id,
        _id: s._id || s.id,
        name: s.name,
        code: s.code
      })));

      setTeachers(teachersData.map(t => ({
        id: t._id || t.id,
        _id: t._id || t.id,
        name: t.name
      })));

      // Auto-select first class
      if (formattedClasses.length > 0) {
        setSelectedClass(formattedClasses[0].id);
      }
    } catch (err) {
      console.error('Error loading reference data:', err);
      setError('Failed to load data');
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      const [timetableEntries, sectionsData] = await Promise.all([
        timetableService.getByClass(selectedClass),
        sectionService.getAll({ classId: selectedClass })
      ]);

      setTimetableData(timetableEntries || []);
      setSections((sectionsData || []).map(s => ({
        id: s._id || s.id,
        _id: s._id || s.id,
        name: s.name
      })));
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Failed to load timetable');
      setTimetableData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (payload) => {
    try {
      if (editingSlot?._id) {
        await timetableService.update(editingSlot._id, payload);
      } else {
        await timetableService.create(payload);
      }
      setShowScheduleModal(false);
      setEditingSlot(null);
      fetchTimetable();
    } catch (err) {
      console.error('Error saving schedule:', err);
      const msg = err?.response?.data?.message || 'Failed to save schedule';
      alert(msg);
    }
  };

  const handleSlotClick = (entry) => {
    setEditingSlot(entry);
    setShowScheduleModal(true);
  };

  const handleDeleteSlot = async (entry) => {
    if (window.confirm(`Delete "${entry.subjectId?.name}" on ${entry.day} at ${entry.startTime}?`)) {
      try {
        await timetableService.delete(entry._id || entry.id);
        fetchTimetable();
      } catch (err) {
        console.error('Error deleting slot:', err);
        alert('Failed to delete schedule entry');
      }
    }
  };

  const handleAddNewSlot = () => {
    setEditingSlot(null);
    setShowScheduleModal(true);
  };

  const handleExportPDF = () => {
    if (timetableData.length === 0) return;
    setExporting(true);

    try {
      // Build lookup
      const lookup = {};
      timetableData.forEach(entry => {
        lookup[`${entry.day}_${entry.startTime}-${entry.endTime}`] = entry;
      });

      const activeDays = DAYS.filter(day => timetableData.some(e => e.day === day));

      // Visible schedule range
      const usedKeys = new Set(timetableData.map(e => `${e.startTime}-${e.endTime}`));
      const usedIndices = FULL_SCHEDULE
        .map((s, i) => (!s.isBreak && usedKeys.has(`${s.start}-${s.end}`)) ? i : -1)
        .filter(i => i !== -1);
      const firstIdx = usedIndices.length > 0 ? Math.min(...usedIndices) : 0;
      const lastIdx = usedIndices.length > 0 ? Math.max(...usedIndices) : FULL_SCHEDULE.length - 1;
      const visibleSchedule = FULL_SCHEDULE.slice(firstIdx, lastIdx + 1);

      // Cell type map for coloring
      const cellTypes = {};
      visibleSchedule.forEach((slot, rowIdx) => {
        if (!slot.isBreak) {
          activeDays.forEach((day, colIdx) => {
            const entry = lookup[`${day}_${slot.start}-${slot.end}`];
            if (entry) cellTypes[`${rowIdx}_${colIdx + 1}`] = entry.type;
          });
        }
      });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Title
      pdf.setFontSize(16);
      const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown';
      pdf.text(`Timetable - ${className}`, 14, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(130);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
      pdf.setTextColor(0);

      // Build table
      const head = [['Time', ...activeDays.map(d => DAY_LABELS[d])]];
      const body = visibleSchedule.map(slot => {
        if (slot.isBreak) {
          return [{
            content: slot.label,
            colSpan: activeDays.length + 1,
            styles: { halign: 'center', fillColor: [243, 244, 246], fontStyle: 'italic', textColor: [120, 120, 120], fontSize: 8 }
          }];
        }
        const row = [`${slot.start} - ${slot.end}`];
        activeDays.forEach(day => {
          const entry = lookup[`${day}_${slot.start}-${slot.end}`];
          if (entry) {
            const name = entry.subjectId?.name || 'N/A';
            const teacher = entry.teacherId?.name || '';
            const room = entry.room || '';
            const typeTag = entry.type === 'lab' ? ' [TP]' : entry.type === 'tutorial' ? ' [TD]' : '';
            row.push(`${name}${typeTag}\n${teacher}\n${room}`);
          } else {
            row.push('');
          }
        });
        return row;
      });

      autoTable(pdf, {
        head,
        body,
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
        columnStyles: { 0: { cellWidth: 28, fontStyle: 'bold', halign: 'center' } },
        styles: { overflow: 'linebreak', lineWidth: 0.2 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index > 0) {
            const type = cellTypes[`${data.row.index}_${data.column.index}`];
            if (type === 'lecture') data.cell.styles.fillColor = [239, 246, 255];
            else if (type === 'lab') data.cell.styles.fillColor = [240, 253, 244];
            else if (type === 'tutorial') data.cell.styles.fillColor = [250, 245, 255];
          }
        },
      });

      pdf.save(`timetable-${className.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const classOptions = classes.map(c => ({ value: c.id, label: c.name }));
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || '';

  // Stats
  const totalSlots = timetableData.length;
  const uniqueTeachers = [...new Set(timetableData.map(e => e.teacherId?._id || e.teacherId))].length;
  const uniqueSubjects = [...new Set(timetableData.map(e => e.subjectId?._id || e.subjectId))].length;
  const uniqueDays = [...new Set(timetableData.map(e => e.day))].length;

  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AuthHeader onLogout={() => { window.location.href = '/'; }} />
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1">
                  Timetables Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage class schedules
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={handleExportPDF}
                  disabled={!selectedClass || timetableData.length === 0 || exporting}
                >
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </Button>
                {userRole === 'admin' && (
                  <Button iconName="Plus" iconPosition="left" onClick={handleAddNewSlot} disabled={!selectedClass}>
                    Add Class
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                <Icon name="AlertCircle" size={20} className="text-error" />
                <p className="text-sm text-error">{error}</p>
                <Button variant="ghost" size="sm" onClick={fetchTimetable}>Retry</Button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Calendar" size={20} className="text-primary" />
                  <span className="text-2xl font-semibold text-foreground">{totalSlots}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Book" size={20} className="text-blue-600" />
                  <span className="text-2xl font-semibold text-foreground">{uniqueSubjects}</span>
                </div>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="UserCheck" size={20} className="text-green-600" />
                  <span className="text-2xl font-semibold text-foreground">{uniqueTeachers}</span>
                </div>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Clock" size={20} className="text-orange-600" />
                  <span className="text-2xl font-semibold text-foreground">{uniqueDays}</span>
                </div>
                <p className="text-sm text-muted-foreground">Active Days</p>
              </div>
            </div>

            {/* Class Selector + Grid */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 max-w-xs">
                  <Select
                    label="Class"
                    options={classOptions}
                    value={selectedClass}
                    onChange={setSelectedClass}
                    placeholder="Select a class"
                  />
                </div>
                {selectedClassName && (
                  <div className="flex items-end">
                    <p className="text-sm text-muted-foreground pb-2">
                      Timetable for <span className="font-semibold text-foreground">{selectedClassName}</span>
                    </p>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-24 h-16 bg-muted rounded animate-pulse" />
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="flex-1 h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <TimetableGrid
                  ref={gridRef}
                  data={timetableData}
                  onSlotClick={userRole === 'admin' ? handleSlotClick : undefined}
                  onDeleteSlot={userRole === 'admin' ? handleDeleteSlot : undefined}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => { setShowScheduleModal(false); setEditingSlot(null); }}
          onSave={handleSaveSchedule}
          editingSlot={editingSlot}
          subjects={subjects}
          teachers={teachers}
          sections={sections}
          selectedClassId={selectedClass}
        />
      )}
    </div>
  );
};

export default TimetablesManagement;
