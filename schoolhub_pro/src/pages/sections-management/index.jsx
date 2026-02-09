import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import SectionFilters from './components/SectionFilters';
import SectionTableRow from './components/SectionTableRow';
import AddSectionModal from './components/AddSectionModal';
import ViewSectionModal from './components/ViewSectionModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import sectionService from '../../services/sectionService';
import classService from '../../services/classService';
import teacherService from '../../services/teacherService';

const SectionsManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    classId: 'all',
    capacity: 'all'
  });

  // API Data States
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Sections Management', path: '/sections-management' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classesData, sectionsData, teachersData] = await Promise.all([
        classService.getAll(),
        sectionService.getAll(),
        teacherService.getAll()
      ]);

      const formattedClasses = classesData.map(cls => ({
        id: cls._id || cls.id,
        name: cls.name,
        code: cls.code
      }));
      setClasses(formattedClasses);

      const formattedTeachers = teachersData.map(t => ({
        id: t._id || t.id,
        name: t.name
      }));
      setTeachers(formattedTeachers);

      const formattedSections = sectionsData.map(section => ({
        id: section._id || section.id,
        name: section.name,
        classId: section.classId?._id || section.classId,
        className: section.classId?.name || 'N/A',
        capacity: section.capacity || 30,
        enrolled: section.enrolled || 0,
        room: section.room || 'N/A',
        teachers: (section.teachers || []).map(t => ({
          id: t._id,
          teacherId: t.teacherId?._id || t.teacherId,
          name: t.teacherId?.name || 'Unknown',
          subject: t.subject || ''
        }))
      }));
      setSections(formattedSections);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load sections');
      setClasses([]);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = sections?.filter(section => {
    const matchesSearch = section?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
                         section?.className?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
                         section?.room?.toLowerCase()?.includes(filters?.search?.toLowerCase());
    const matchesClass = filters?.classId === 'all' || section?.classId === filters?.classId;
    const matchesCapacity = filters?.capacity === 'all' ||
                           (filters?.capacity === 'low' && section?.capacity < 30) ||
                           (filters?.capacity === 'medium' && section?.capacity >= 30 && section?.capacity < 35) ||
                           (filters?.capacity === 'high' && section?.capacity >= 35);

    return matchesSearch && matchesClass && matchesCapacity;
  });

  // Calculate stats
  const totalSections = sections?.length || 0;
  const totalEnrolled = sections?.reduce((sum, section) => sum + (section?.enrolled || 0), 0);
  const totalCapacity = sections?.reduce((sum, section) => sum + (section?.capacity || 0), 0);
  const avgEnrollment = totalSections > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  const handleAddSection = () => {
    setEditingSection(null);
    setShowAddModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setShowAddModal(true);
  };

  const handleViewSection = (section) => {
    setSelectedSection(section);
    setShowViewModal(true);
  };

  const handleDeleteClick = (section) => {
    setSelectedSection(section);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSection) {
      try {
        await sectionService.delete(selectedSection.id);
        setShowDeleteModal(false);
        setSelectedSection(null);
        fetchData();
      } catch (err) {
        console.error('Error deleting section:', err);
        alert('Failed to delete section');
      }
    }
  };

  const handleSectionSubmit = async (formData) => {
    try {
      if (formData?.id) {
        await sectionService.update(formData.id, formData);
      } else {
        await sectionService.create(formData);
      }
      setShowAddModal(false);
      setEditingSection(null);
      fetchData();
    } catch (err) {
      console.error('Error saving section:', err);
      alert('Failed to save section');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      classId: 'all',
      capacity: 'all'
    });
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="portal-layout">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="main-content">
        <AuthHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} onLogout={() => {}} />
        <div className="portal-content">
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sections Management</h1>
              <p className="text-gray-600">Manage student groupings within academic classes</p>
            </div>
            <Button onClick={handleAddSection} className="flex items-center gap-2">
              <Icon name="Plus" size={20} />
              Add New Section
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchData}>Retry</Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sections</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSections}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Layers" size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEnrolled}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Grid3x3" size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Enrollment</p>
                  <p className="text-2xl font-bold text-gray-900">{avgEnrollment}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <SectionFilters
            filters={filters}
            classes={classes}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Sections Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Teachers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSections?.length > 0 ? (
                      filteredSections?.map((section) => (
                        <SectionTableRow
                          key={section?.id}
                          section={section}
                          onView={handleViewSection}
                          onEdit={handleEditSection}
                          onDelete={handleDeleteClick}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium">No sections found</p>
                          <p className="text-sm">Try adjusting your filters or add a new section</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSectionModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingSection(null);
          }}
          onSubmit={handleSectionSubmit}
          editingSection={editingSection}
          classes={classes}
          teachers={teachers}
        />
      )}

      {showViewModal && selectedSection && (
        <ViewSectionModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSection(null);
          }}
          section={selectedSection}
        />
      )}

      {showDeleteModal && selectedSection && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSection(null);
          }}
          onConfirm={handleDeleteConfirm}
          sectionName={selectedSection?.name}
          className={selectedSection?.className}
        />
      )}
    </div>
  );
};

export default SectionsManagement;
