import React, { useState, useMemo, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
import AuthHeader from '../../components/navigation/AuthHeader';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/AppIcon';
import adminService from '../../services/adminService';
import authService from '../../services/authService';

const AdminsManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [adminsData, setAdminsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);

  // Check if current user is super_admin
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = storedUser.role === 'super_admin';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Admin',
    status: 'Active',
    password: '',
    permissions: [],
    superAdminPassword: ''
  });
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAll();
      const formatted = data.map(admin => ({
        id: admin._id || admin.id,
        userId: admin.userId,
        adminId: admin.adminId || `ADM${String(admin._id).slice(-3).toUpperCase()}`,
        name: admin.name || admin.email?.split('@')[0],
        email: admin.email,
        phone: admin.phone || 'N/A',
        role: admin.role || 'Admin',
        status: admin.status || 'Active',
        permissions: admin.permissions || ['All'],
        lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never',
        createdAt: admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'
      }));
      setAdminsData(formatted);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to load administrators');
      setAdminsData([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredAdmins = useMemo(() => {
    return adminsData?.filter((admin) => {
      const matchesRole = !filters?.role || admin?.role === filters?.role;
      const matchesStatus = !filters?.status || admin?.status === filters?.status;
      const matchesSearch = !filters?.search ||
        admin?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        admin?.email?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        admin?.adminId?.toLowerCase()?.includes(filters?.search?.toLowerCase());

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [adminsData, filters]);

  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAdmins?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAdmins, currentPage]);

  const totalPages = Math.ceil(filteredAdmins?.length / itemsPerPage);

  const stats = useMemo(() => {
    const total = adminsData?.length;
    const superAdmins = adminsData?.filter((a) => a?.role === 'Super Admin')?.length;
    const admins = adminsData?.filter((a) => a?.role === 'Admin')?.length;
    const moderators = adminsData?.filter((a) => a?.role === 'Moderator')?.length;
    const active = adminsData?.filter((a) => a?.status === 'Active')?.length;

    return { total, superAdmins, admins, moderators, active };
  }, [adminsData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ role: '', status: '', search: '' });
    setCurrentPage(1);
  };

  const handleView = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin?.name || '',
      email: admin?.email || '',
      phone: admin?.phone !== 'N/A' ? admin?.phone || '' : '',
      role: admin?.role || 'Admin',
      status: admin?.status || 'Active',
      password: '',
      permissions: admin?.permissions || [],
      superAdminPassword: ''
    });
    setVerifyError('');
    setShowAddModal(true);
  };

  const handleDelete = (admin) => {
    if (admin?.role === 'Super Admin') {
      alert('Super Admin cannot be deleted');
      return;
    }
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleAddAdmin = async () => {
    try {
      setActionLoading(true);
      setVerifyError('');

      // Verify super admin password before creating a new admin
      if (!selectedAdmin) {
        if (!formData.superAdminPassword?.trim()) {
          setVerifyError('Please enter your password to confirm');
          setActionLoading(false);
          return;
        }
        try {
          await authService.verifyPassword(formData.superAdminPassword.trim());
        } catch (verifyErr) {
          setVerifyError('Incorrect password. Please try again.');
          setActionLoading(false);
          return;
        }
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions?.length > 0 ? formData.permissions : undefined
      };
      // Only include password when creating (not editing) and if provided
      if (!selectedAdmin && formData.password?.trim()) {
        payload.password = formData.password.trim();
      }

      if (selectedAdmin) {
        await adminService.update(selectedAdmin.id, payload);
      } else {
        await adminService.create(payload);
      }
      setShowAddModal(false);
      setSelectedAdmin(null);
      setFormData({ name: '', email: '', phone: '', role: 'Admin', status: 'Active', password: '', permissions: [], superAdminPassword: '' });
      setVerifyError('');
      fetchAdmins();
    } catch (err) {
      console.error('Error saving admin:', err);
      alert('Failed to save administrator');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      await adminService.delete(selectedAdmin.id);
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      console.error('Error deleting admin:', err);
      alert('Failed to delete administrator');
    } finally {
      setActionLoading(false);
    }
  };



  const handleToggleActive = async (admin) => {
    if (!admin.userId) {
      alert('This admin has no user account linked');
      return;
    }
    const action = admin.status === 'Active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${admin.name}'s account?`)) return;
    try {
      setToggleLoading(admin.id);
      await authService.toggleUserActive(admin.userId);
      fetchAdmins();
    } catch (err) {
      console.error('Error toggling user:', err);
      alert(err.response?.data?.message || 'Failed to toggle account status');
    } finally {
      setToggleLoading(null);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Admins', path: '/admins-management' }
  ];

  const roleOptions = [
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Moderator', label: 'Moderator' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const permissionOptions = [
    { value: 'All', label: 'All (Full Access)' },
    { value: 'Students', label: 'Students' },
    { value: 'Teachers', label: 'Teachers' },
    { value: 'Parents', label: 'Parents' },
    { value: 'Classes', label: 'Classes' },
    { value: 'Sections', label: 'Sections' },
    { value: 'Subjects', label: 'Subjects' },
    { value: 'Exams', label: 'Exams' },
    { value: 'Attendance', label: 'Attendance' },
    { value: 'Fees', label: 'Fees' },
    { value: 'Notices', label: 'Notices' },
    { value: 'Reports', label: 'Reports' },
    { value: 'Settings', label: 'Settings' }
  ];

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Super Admin': return 'bg-primary/10 text-primary';
      case 'Admin': return 'bg-secondary/10 text-secondary';
      case 'Moderator': return 'bg-accent/10 text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
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
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <AuthHeader />

      <main className="main-content">
        <div className="main-content-inner">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Administrators</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage system administrators and their permissions</p>
            </div>
            <Button onClick={() => { setSelectedAdmin(null); setFormData({ name: '', email: '', phone: '', role: 'Admin', status: 'Active', password: '', permissions: [], superAdminPassword: '' }); setVerifyError(''); setShowAddModal(true); }} iconName="Plus" iconPosition="left" size="lg">
              Add Admin
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchAdmins}>Retry</Button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Search by name, email, ID..." value={filters?.search} onChange={(e) => handleFilterChange('search', e?.target?.value)} iconName="Search" />
              <Select value={filters?.role} onChange={(value) => handleFilterChange('role', value)} options={[{ value: '', label: 'All Roles' }, ...roleOptions]} />
              <Select value={filters?.status} onChange={(value) => handleFilterChange('status', value)} options={[{ value: '', label: 'All Status' }, ...statusOptions]} />
              <Button variant="outline" onClick={handleClearFilters} iconName="X">Clear</Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="Users" size={24} className="text-primary mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.total}</div>
              <div className="text-sm text-muted-foreground">Total Admins</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="Shield" size={24} className="text-error mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.superAdmins}</div>
              <div className="text-sm text-muted-foreground">Super Admins</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="UserCog" size={24} className="text-secondary mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.admins}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="User" size={24} className="text-accent mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.moderators}</div>
              <div className="text-sm text-muted-foreground">Moderators</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <Icon name="UserCheck" size={24} className="text-success mb-2" />
              <div className="text-2xl font-semibold text-foreground mb-1">{stats?.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {loading ? <LoadingSkeleton /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Permissions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Last Login</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedAdmins?.map((admin) => (
                      <tr key={admin?.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon name="User" size={20} className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{admin?.name}</div>
                              <div className="text-sm text-muted-foreground">{admin?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(admin?.role)}`}>{admin?.role}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {admin?.permissions?.slice(0, 2)?.map((perm, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">{perm}</span>
                            ))}
                            {admin?.permissions?.length > 2 && (
                              <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">+{admin?.permissions?.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden xl:table-cell text-sm text-muted-foreground">{admin?.lastLogin}</td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{admin?.status}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(admin)}><Icon name="Eye" size={16} /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(admin)}><Icon name="Pencil" size={16} /></Button>
                            {isSuperAdmin && admin?.role !== 'Super Admin' && admin?.userId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleActive(admin)}
                                disabled={toggleLoading === admin?.id}
                                title={admin?.status === 'Active' ? 'Deactivate account' : 'Activate account'}>
                                <Icon
                                  name={admin?.status === 'Active' ? 'UserX' : 'UserCheck'}
                                  size={16}
                                  className={admin?.status === 'Active' ? 'text-warning' : 'text-success'}
                                />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(admin)} disabled={admin?.role === 'Super Admin'}>
                              <Icon name="Trash2" size={16} className={admin?.role === 'Super Admin' ? 'text-muted' : 'text-error'} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredAdmins?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No administrators found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAdmins?.length)} of {filteredAdmins?.length} admins
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} iconName="ChevronLeft" />
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} iconName="ChevronRight" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setSelectedAdmin(null); setVerifyError(''); }} title={selectedAdmin ? 'Edit Administrator' : 'Add Administrator'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={formData?.name} onChange={(e) => setFormData({ ...formData, name: e?.target?.value })} placeholder="Enter full name" required />
            <Input label="Email" type="email" value={formData?.email} onChange={(e) => setFormData({ ...formData, email: e?.target?.value })} placeholder="Enter email address" required />
            <Input label="Phone" value={formData?.phone} onChange={(e) => setFormData({ ...formData, phone: e?.target?.value })} placeholder="Enter phone number" />
            <Select label="Role" value={formData?.role} onChange={(value) => setFormData({ ...formData, role: value })} options={roleOptions} />
            <Select label="Status" value={formData?.status} onChange={(value) => setFormData({ ...formData, status: value })} options={statusOptions} />
            {!selectedAdmin && (
              <Input label="New Admin Password" type="password" value={formData?.password} onChange={(e) => setFormData({ ...formData, password: e?.target?.value })} placeholder="Leave empty for default (admin123)" />
            )}
          </div>

          <Select
            label="Permissions"
            value={formData?.permissions}
            onChange={(value) => setFormData({ ...formData, permissions: value })}
            options={permissionOptions}
            multiple
            searchable
            placeholder="Select permissions (leave empty for role defaults)"
          />

          {!selectedAdmin && (
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="ShieldAlert" size={18} className="text-warning" />
                <p className="text-sm font-medium text-foreground">Security Verification</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Enter YOUR password to confirm admin creation</p>
              <Input
                label="Your Password (Super Admin)"
                type="password"
                value={formData?.superAdminPassword}
                onChange={(e) => { setFormData({ ...formData, superAdminPassword: e?.target?.value }); setVerifyError(''); }}
                placeholder="Enter your current password"
                error={verifyError}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddAdmin} disabled={actionLoading}>{actionLoading ? 'Saving...' : selectedAdmin ? 'Update Admin' : 'Add Admin'}</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedAdmin(null); }} title="Administrator Details">
        {selectedAdmin && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="User" size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selectedAdmin?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedAdmin?.adminId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium text-foreground">{selectedAdmin?.email}</p></div>
              <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium text-foreground">{selectedAdmin?.phone}</p></div>
              <div><p className="text-sm text-muted-foreground">Role</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(selectedAdmin?.role)}`}>{selectedAdmin?.role}</span></div>
              <div><p className="text-sm text-muted-foreground">Status</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedAdmin?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{selectedAdmin?.status}</span></div>
              <div><p className="text-sm text-muted-foreground">Last Login</p><p className="font-medium text-foreground">{selectedAdmin?.lastLogin}</p></div>
              <div><p className="text-sm text-muted-foreground">Created</p><p className="font-medium text-foreground">{selectedAdmin?.createdAt}</p></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {selectedAdmin?.permissions?.map((perm, idx) => (
                  <span key={idx} className="px-3 py-1 bg-muted rounded-full text-sm text-foreground">{perm}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedAdmin(null); }} title="Delete Administrator">
        <div className="space-y-4">
          <p className="text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{selectedAdmin?.name}</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminsManagement;
