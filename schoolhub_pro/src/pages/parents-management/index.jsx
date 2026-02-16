import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import ParentTableRow from './components/ParentTableRow';
import AddParentModal from './components/AddParentModal';
import ViewParentModal from './components/ViewParentModal';
import parentService from '../../services/parentService';
import authService from '../../services/authService';
import studentService from '../../services/studentService';

const ParentsManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // API Data States
  const [parentsData, setParentsData] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);

  // Check if current user is super_admin
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = storedUser.role === 'super_admin';

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Parents', path: '/parents-management' }
  ];

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await parentService.getAll();
      const formattedParents = data.map(parent => ({
        id: parent._id || parent.id,
        userId: parent.userId,
        parentId: parent.parentId || `PAR${String(parent._id).slice(-3).toUpperCase()}`,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        photo: parent.photo || null,
        photoAlt: `Photo of ${parent.name || 'Parent'}`,
        childrenIds: parent.childrenIds?.map(c => c._id || c) || [],
        children: parent.childrenIds?.map(c => c.name) || [],
        status: parent.status || 'Active',
        address: parent.address || 'N/A',
        occupation: parent.occupation || 'N/A'
      }));
      setParentsData(formattedParents);
    } catch (err) {
      console.error('Error fetching parents:', err);
      setError('Failed to load parents');
      setParentsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const students = await studentService.getAll();
      const arr = Array.isArray(students) ? students : [];
      setStudentOptions(arr.map(s => ({
        value: s._id || s.id,
        label: `${s.name} - ${s.classId?.name || 'No Class'}`
      })));
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudentOptions([]);
    }
  };

  const filteredParents = useMemo(() => {
    return parentsData?.filter((parent) => {
      const matchesSearch = !searchTerm ||
        parent?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        parent?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        parent?.phone?.includes(searchTerm) ||
        parent?.children?.some((child) => child?.toLowerCase()?.includes(searchTerm?.toLowerCase()));

      return matchesSearch;
    });
  }, [parentsData, searchTerm]);

  const paginatedParents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredParents?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParents, currentPage]);

  const totalPages = Math.ceil(filteredParents?.length / itemsPerPage);

  const handleView = (parent) => {
    setSelectedParent(parent);
    setShowViewModal(true);
  };

  const handleEdit = (parent) => {
    setSelectedParent(parent);
    setShowAddModal(true);
  };

  const handleAddParent = async (formData) => {
    try {
      setActionLoading(true);
      if (formData.id) {
        const { id, ...updateData } = formData;
        await parentService.update(id, updateData);
      } else {
        await parentService.create(formData);
      }
      setShowAddModal(false);
      setSelectedParent(null);
      fetchParents();
    } catch (err) {
      console.error('Error saving parent:', err);
      alert(formData.id ? 'Failed to update parent.' : 'Failed to add parent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParent = async (parent) => {
    if (!window.confirm(`Are you sure you want to delete ${parent.name}? This action cannot be undone.`)) return;
    try {
      setActionLoading(true);
      await parentService.delete(parent.id);
      fetchParents();
    } catch (err) {
      console.error('Error deleting parent:', err);
      alert('Failed to delete parent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (parent) => {
    const action = parent.status === 'Active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${parent.name}'s account?`)) return;
    try {
      setToggleLoading(parent.id);
      await authService.toggleUserActive(parent.userId || parent.id);
      fetchParents();
    } catch (err) {
      console.error('Error toggling user:', err);
      alert(err.response?.data?.message || 'Failed to toggle account status');
    } finally {
      setToggleLoading(null);
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <AuthHeader onLogout={() => { window.location.href = '/'; }} />

      <main className="main-content">
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                Parents
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage parent accounts and their linked children
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedParent(null);
                setShowAddModal(true);
              }}
              iconName="Plus"
              iconPosition="left"
              size="lg">
              Add Parent
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchParents}>Retry</Button>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border p-4 md:p-6 mb-6">
            <Input
              type="search"
              placeholder="Search parents by name, email, phone, or children..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e?.target?.value);
                setCurrentPage(1);
              }} />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                          Children
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedParents?.map((parent) =>
                        <ParentTableRow
                          key={parent?.id}
                          parent={parent}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDeleteParent}
                          onToggleActive={isSuperAdmin ? handleToggleActive : undefined}
                          toggleLoading={toggleLoading === parent?.id} />
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredParents?.length === 0 &&
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No parents found</p>
                  </div>
                }
              </>
            )}

            {totalPages > 1 &&
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredParents?.length)} of {filteredParents?.length} parents
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    iconName="ChevronLeft" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    iconName="ChevronRight" />
                </div>
              </div>
            }
          </div>
        </div>
      </main>

      <AddParentModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedParent(null);
        }}
        onSubmit={handleAddParent}
        parent={selectedParent}
        studentOptions={studentOptions} />

      <ViewParentModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedParent(null);
        }}
        parent={selectedParent} />
    </div>
  );
};

export default ParentsManagement;
