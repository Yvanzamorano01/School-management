import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import MaterialCard from './components/MaterialCard';
import UploadMaterialModal from './components/UploadMaterialModal';
import PreviewModal from './components/PreviewModal';
import materialsService from '../../services/materialsService';
import classService from '../../services/classService';
import subjectService from '../../services/subjectService';

const CourseMaterials = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMaterialType, setSelectedMaterialType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reference data from API
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  // Get user role from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'student');
  const isStudent = userRole === 'student';
  // For students, get their class from profile
  const studentClassId = isStudent ? (storedUser.profile?.classId?._id || storedUser.profile?.classId || null) : null;

  const materialTypes = [
    { value: 'Course', label: 'Course' },
    { value: 'Assignment', label: 'Assignment' },
    { value: 'Worksheet', label: 'Worksheet' },
    { value: 'Solution', label: 'Solution' },
    { value: 'Other', label: 'Other' }
  ];

  const stats = {
    totalMaterials: materials.length,
    recentUploads: materials.filter((m) => {
      const uploadDate = new Date(m.uploadDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length,
    totalDownloads: materials.reduce((sum, m) => sum + (m.downloads || 0), 0),
    totalSubjects: [...new Set(materials.map(m => m.subjectId))].length
  };

  const fetchReferenceData = async () => {
    try {
      const [classesData, subjectsData] = await Promise.all([
        classService.getAll(),
        subjectService.getAll()
      ]);
      setClasses((classesData || []).map(c => ({ id: c._id || c.id, name: c.name })));
      setSubjects((subjectsData || []).map(s => ({ id: s._id || s.id, name: s.name })));
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await materialsService.getAll();
      const formatted = (Array.isArray(data) ? data : []).map(m => ({
        id: m._id || m.id,
        title: m.title,
        description: m.description,
        materialType: m.type || 'Course',
        subjectId: m.subjectId?._id || m.subjectId,
        subject: m.subjectId?.name || 'N/A',
        classId: m.classId?._id || m.classId,
        className: m.classId?.name || 'N/A',
        uploadedBy: m.uploadedBy?.name || m.uploadedByName || 'Unknown',
        uploadDate: m.createdAt || m.uploadDate,
        fileType: m.fileType?.includes('/') ? m.fileType.split('/').pop() : (m.fileType || 'file'),
        fileSize: m.fileSize || 0,
        fileName: m.fileName,
        downloads: m.downloads || 0
      }));
      setMaterials(formatted);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err.message || 'Failed to fetch materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
    fetchMaterials();
  }, []);

  useEffect(() => {
    let filtered = materials;

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(m => m.subjectId === selectedSubject);
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(m => m.classId === selectedClass);
    } else if (isStudent && studentClassId) {
      // Auto-filter by student's class
      filtered = filtered.filter(m => m.classId === studentClassId);
    }

    if (selectedMaterialType !== 'all') {
      filtered = filtered.filter(m => m.materialType === selectedMaterialType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.uploadedBy?.toLowerCase().includes(query) ||
        m.subject?.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  }, [materials, selectedSubject, selectedClass, selectedMaterialType, searchQuery]);

  const handleClearFilters = () => {
    setSelectedSubject('all');
    setSelectedClass('all');
    setSelectedMaterialType('all');
    setSearchQuery('');
  };

  const handlePreview = (material) => {
    setSelectedMaterial(material);
    setShowPreviewModal(true);
  };

  const handleDownload = async (material) => {
    try {
      const blob = await materialsService.download(material.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName || material.title || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update local state to reflect the new download count
      setMaterials(prev => prev.map(m =>
        m.id === material.id
          ? { ...m, downloads: (m.downloads || 0) + 1 }
          : m
      ));
    } catch (err) {
      console.error('Error downloading material:', err);
      alert('Failed to download material');
    }
  };

  const handleUpload = async (uploadData) => {
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      if (uploadData.description) formData.append('description', uploadData.description);
      formData.append('type', uploadData.materialType);
      formData.append('subjectId', uploadData.subject);
      formData.append('classId', uploadData.classId);

      // Append the actual file binary
      if (uploadData.files?.length > 0) {
        formData.append('file', uploadData.files[0]);
      }

      await materialsService.create(formData);
      fetchMaterials();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Error uploading material:', err);
      alert(err?.response?.data?.message || 'Failed to upload material');
    }
  };

  const handleDelete = async (material) => {
    if (window.confirm(`Delete "${material.title}"?`)) {
      try {
        await materialsService.delete(material.id);
        fetchMaterials();
      } catch (err) {
        console.error('Error deleting material:', err);
        alert('Failed to delete material');
      }
    }
  };



  const breadcrumbItems = [
    { label: 'Dashboard', path: userRole === 'admin' ? '/admin-dashboard' : userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard' },
    { label: 'Course Materials', path: '/course-materials' }
  ];

  const SidebarComponent = userRole === 'admin' ? AdminSidebar : userRole === 'teacher' ? TeacherSidebar : StudentSidebar;

  return (
    <div className="min-h-screen bg-background">
      <SidebarComponent
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <AuthHeader />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-error mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-error mb-1">Error loading materials</h3>
                  <p className="text-sm text-error/80 mb-3">{error}</p>
                  <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left" onClick={fetchMaterials}>
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Course Materials</h1>
              <p className="text-sm md:text-base text-muted-foreground">Access and manage educational resources and documents</p>
            </div>
            {(userRole === 'admin' || userRole === 'teacher') && (
              <Button variant="default" iconName="Upload" iconPosition="left" onClick={() => setShowUploadModal(true)}>
                Upload Material
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="FolderOpen" size={20} className="text-primary" />
                <span className="text-2xl font-semibold text-foreground">{stats.totalMaterials}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Materials</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Upload" size={20} className="text-blue-600" />
                <span className="text-2xl font-semibold text-foreground">{stats.recentUploads}</span>
              </div>
              <p className="text-sm text-muted-foreground">Recent Uploads</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Download" size={20} className="text-green-600" />
                <span className="text-2xl font-semibold text-foreground">{stats.totalDownloads}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Book" size={20} className="text-orange-600" />
                <span className="text-2xl font-semibold text-foreground">{stats.totalSubjects}</span>
              </div>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search materials by title, description, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    iconName="Search"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  options={[{ value: 'all', label: 'All Subjects' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder="Filter by subject"
                />
                <Select
                  options={[{ value: 'all', label: 'All Classes' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                  value={selectedClass}
                  onChange={setSelectedClass}
                  placeholder="Filter by class"
                />
                <Select
                  options={[{ value: 'all', label: 'All Types' }, ...materialTypes]}
                  value={selectedMaterialType}
                  onChange={setSelectedMaterialType}
                  placeholder="Material type"
                />
              </div>
              {(selectedSubject !== 'all' || selectedClass !== 'all' || selectedMaterialType !== 'all' || searchQuery) && (
                <Button variant="outline" size="sm" iconName="X" iconPosition="left" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 md:p-6 animate-pulse">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-48 h-32 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  userRole={userRole}
                />
              ))}
            </div>
          )}

          {!loading && filteredMaterials.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Icon name="FolderOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No materials found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedSubject !== 'all' || selectedClass !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by uploading your first material'}
              </p>
            </div>
          )}
        </div>
      </main>

      <UploadMaterialModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        subjects={subjects}
        classes={classes}
        materialTypes={materialTypes}
        onUpload={handleUpload}
      />

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        material={selectedMaterial}
      />
    </div>
  );
};

export default CourseMaterials;
