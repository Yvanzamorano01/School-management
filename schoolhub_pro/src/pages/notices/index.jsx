import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import TeacherSidebar from '../../components/navigation/TeacherSidebar';
import StudentSidebar from '../../components/navigation/StudentSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/AppIcon';
import noticeService from '../../services/noticeService';

const Notices = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role === 'super_admin' ? 'admin' : (storedUser.role || 'student');
  const SidebarComponent = userRole === 'admin' ? AdminSidebar : userRole === 'teacher' ? TeacherSidebar : StudentSidebar;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API Data States
  const [noticesData, setNoticesData] = useState([]);

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [filters, setFilters] = useState({
    target: '',
    priority: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'All',
    priority: 'Normal',
    publishDate: ''
  });


  // Fetch notices data
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noticeService.getAll();
      // Transform API response to match component format
      const formattedNotices = data.map(notice => ({
        id: notice._id || notice.id,
        title: notice.title,
        content: notice.content,
        target: notice.target || 'All',
        priority: notice.priority || 'Normal',
        author: notice.author || 'Admin Office',
        publishDate: notice.publishDate ? new Date(notice.publishDate).toISOString().split('T')[0] : '',
        status: notice.status || 'Draft',
        views: notice.views || 0
      }));
      setNoticesData(formattedNotices);
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Failed to load notices. Please try again.');
      setNoticesData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = useMemo(() => {
    return noticesData?.filter((notice) => {
      const matchesTarget = !filters?.target || notice?.target === filters?.target;
      const matchesPriority = !filters?.priority || notice?.priority === filters?.priority;
      const matchesSearch = !filters?.search ||
        notice?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        notice?.content?.toLowerCase()?.includes(filters?.search?.toLowerCase());

      return matchesTarget && matchesPriority && matchesSearch;
    });
  }, [noticesData, filters]);

  const paginatedNotices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotices?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotices, currentPage]);

  const totalPages = Math.ceil(filteredNotices?.length / itemsPerPage);

  const stats = useMemo(() => {
    const total = noticesData?.length;
    const published = noticesData?.filter((n) => n?.status === 'Published')?.length;
    const drafts = noticesData?.filter((n) => n?.status === 'Draft')?.length;
    const highPriority = noticesData?.filter((n) => n?.priority === 'High')?.length;
    const totalViews = noticesData?.reduce((sum, n) => sum + (n?.views || 0), 0);

    return { total, published, drafts, highPriority, totalViews };
  }, [noticesData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ target: '', priority: '', search: '' });
    setCurrentPage(1);
  };

  const handleView = async (notice) => {
    try {
      // Call backend to trigger view increment
      const data = await noticeService.getById(notice.id);

      // Format the response to match component structure
      // noticeService.getById returns response.data (already unwrapped by interceptor)
      const updatedNotice = {
        id: data._id || data.id,
        title: data.title,
        content: data.content,
        target: data.target || 'All',
        priority: data.priority || 'Normal',
        author: data.author || 'Admin Office',
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString().split('T')[0] : '',
        status: data.status || 'Draft',
        views: data.views || 0
      };

      setSelectedNotice(updatedNotice);

      // Update the list with new view count
      setNoticesData(prev => prev.map(n => n.id === notice.id ? updatedNotice : n));
      setShowViewModal(true);
    } catch (error) {
      console.error("Failed to fetch notice details", error);
      // Fallback to existing data
      setSelectedNotice(notice);
      setShowViewModal(true);
    }
  };

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice?.title || '',
      content: notice?.content || '',
      target: notice?.target || 'All',
      priority: notice?.priority || 'Normal',
      publishDate: notice?.publishDate || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (notice) => {
    setSelectedNotice(notice);
    setShowDeleteModal(true);
  };

  const handleAddNotice = async (dataToSave) => {
    try {
      setActionLoading(true);
      await noticeService.create(dataToSave || formData);
      await fetchNotices();
      setShowAddModal(false);
      setFormData({ title: '', content: '', target: 'All', priority: 'Normal', publishDate: '' });
    } catch (err) {
      console.error('Error adding notice:', err);
      alert('Failed to add notice. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditNotice = async (dataToSave) => {
    try {
      setActionLoading(true);
      await noticeService.update(selectedNotice.id, dataToSave || formData);
      await fetchNotices();
      setShowAddModal(false);
      setSelectedNotice(null);
      setFormData({ title: '', content: '', target: 'All', priority: 'Normal', publishDate: '' });
    } catch (err) {
      console.error('Error updating notice:', err);
      alert('Failed to update notice. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotice = (status) => {
    const dataToSave = status ? { ...formData, status } : formData;
    if (selectedNotice) {
      handleEditNotice(dataToSave);
    } else {
      handleAddNotice(dataToSave);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      await noticeService.delete(selectedNotice.id);
      await fetchNotices();
      setShowDeleteModal(false);
      setSelectedNotice(null);
    } catch (err) {
      console.error('Error deleting notice:', err);
      alert('Failed to delete notice. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };



  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
  const breadcrumbItems = [
    { label: 'Dashboard', path: dashboardPath },
    { label: 'Notices', path: '/notices' }
  ];

  const targetOptions = [
    { value: 'All', label: 'All' },
    { value: 'Students', label: 'Students' },
    { value: 'Teachers', label: 'Teachers' },
    { value: 'Parents', label: 'Parents' }
  ];

  const priorityOptions = [
    { value: 'High', label: 'High' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Low', label: 'Low' }
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-error/10 text-error';
      case 'Normal':
        return 'bg-primary/10 text-primary';
      case 'Low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTargetIcon = (target) => {
    switch (target) {
      case 'Students':
        return 'GraduationCap';
      case 'Teachers':
        return 'UserCheck';
      case 'Parents':
        return 'Users';
      default:
        return 'Globe';
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-muted rounded-full"></div>
                <div className="h-6 w-20 bg-muted rounded-full"></div>
                <div className="h-6 w-20 bg-muted rounded-full"></div>
              </div>
              <div className="h-6 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-2/3 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                Notices & Announcements
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Create and manage school-wide communications
              </p>
            </div>
            {userRole === 'admin' && (
              <Button
                onClick={() => {
                  setSelectedNotice(null);
                  setFormData({ title: '', content: '', target: 'All', priority: 'Normal', publishDate: '' });
                  setShowAddModal(true);
                }}
                iconName="Plus"
                iconPosition="left"
                size="lg"
              >
                Create Notice
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search notices..."
                value={filters?.search}
                onChange={(e) => handleFilterChange('search', e?.target?.value)}
                iconName="Search"
              />
              <Select
                value={filters?.target}
                onChange={(value) => handleFilterChange('target', value)}
                options={[{ value: '', label: 'All Targets' }, ...targetOptions]}
              />
              <Select
                value={filters?.priority}
                onChange={(value) => handleFilterChange('priority', value)}
                options={[{ value: '', label: 'All Priorities' }, ...priorityOptions]}
              />
              <Button variant="outline" onClick={handleClearFilters} iconName="X">
                Clear
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Bell" size={24} className="text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.total}</div>
              <div className="text-sm text-muted-foreground">Total Notices</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="CheckCircle" size={24} className="text-success" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.published}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="FileEdit" size={24} className="text-warning" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.drafts}</div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="AlertTriangle" size={24} className="text-error" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.highPriority}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Eye" size={24} className="text-secondary" />
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.totalViews?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={24} className="text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-error mb-1">Error Loading Notices</h3>
                  <p className="text-sm text-error/80 mb-3">{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchNotices} iconName="RefreshCw">
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && <LoadingSkeleton />}

          {/* Notices List */}
          {!loading && (
            <div className="space-y-4">
              {paginatedNotices?.map((notice) => (
                <div
                  key={notice?.id}
                  className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(notice?.priority)}`}>
                          {notice?.priority}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon name={getTargetIcon(notice?.target)} size={14} />
                          {notice?.target}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${notice?.status === 'Published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                          {notice?.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{notice?.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notice?.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="User" size={12} />
                          {notice?.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                          {notice?.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Eye" size={12} />
                          {notice?.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(notice)}>
                        <Icon name="Eye" size={16} />
                      </Button>
                      {userRole === 'admin' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(notice)}>
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(notice)}>
                            <Icon name="Trash2" size={16} className="text-error" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredNotices?.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Icon name="Bell" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notices found</p>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNotices?.length)} of {filteredNotices?.length} notices
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  iconName="ChevronLeft"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  iconName="ChevronRight"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedNotice(null);
        }}
        title={selectedNotice ? 'Edit Notice' : 'Create Notice'}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData?.title}
            onChange={(e) => setFormData({ ...formData, title: e?.target?.value })}
            placeholder="Enter notice title"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
              value={formData?.content}
              onChange={(e) => setFormData({ ...formData, content: e?.target?.value })}
              placeholder="Enter notice content..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Audience"
              value={formData?.target}
              onChange={(value) => setFormData({ ...formData, target: value })}
              options={targetOptions}
            />
            <Select
              label="Priority"
              value={formData?.priority}
              onChange={(value) => setFormData({ ...formData, priority: value })}
              options={priorityOptions}
            />
          </div>
          <Input
            label="Publish Date"
            type="date"
            value={formData?.publishDate}
            onChange={(e) => setFormData({ ...formData, publishDate: e?.target?.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSaveNotice('Draft')} disabled={actionLoading}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSaveNotice('Published')} disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Publish'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedNotice(null);
        }}
        title="Notice Details"
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(selectedNotice?.priority)}`}>
                {selectedNotice?.priority}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon name={getTargetIcon(selectedNotice?.target)} size={14} />
                {selectedNotice?.target}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-foreground">{selectedNotice?.title}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{selectedNotice?.content}</p>
            <div className="flex items-center gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon name="User" size={14} />
                {selectedNotice?.author}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                {selectedNotice?.publishDate}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Eye" size={14} />
                {selectedNotice?.views} views
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedNotice(null);
        }}
        title="Delete Notice"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete "<span className="font-medium text-foreground">{selectedNotice?.title}</span>"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notices;
