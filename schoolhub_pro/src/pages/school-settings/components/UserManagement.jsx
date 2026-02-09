import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import adminService from '../../../services/adminService';
import teacherService from '../../../services/teacherService';
import studentService from '../../../services/studentService';
import parentService from '../../../services/parentService';

const DEFAULT_ROLES = [
  { id: 'admin', name: 'Administrator', icon: 'Shield', color: 'var(--color-error)', permissions: ['All'] },
  { id: 'teacher', name: 'Teacher', icon: 'UserCheck', color: 'var(--color-primary)', permissions: ['Classes', 'Grades', 'Attendance', 'Course Materials'] },
  { id: 'student', name: 'Student', icon: 'Users', color: 'var(--color-success)', permissions: ['View Grades', 'View Schedule', 'View Materials'] },
  { id: 'parent', name: 'Parent', icon: 'UserCircle', color: 'var(--color-warning)', permissions: ['View Child Data', 'Communications'] }
];

const UserManagement = ({ settings, onChange }) => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [userCounts, setUserCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCounts(true);
        const [admins, teachers, students, parents] = await Promise.all([
          adminService.getAll().catch(() => []),
          teacherService.getAll().catch(() => []),
          studentService.getAll().catch(() => []),
          parentService.getAll().catch(() => [])
        ]);
        setUserCounts({
          admin: Array.isArray(admins) ? admins.length : 0,
          teacher: Array.isArray(teachers) ? teachers.length : 0,
          student: Array.isArray(students) ? students.length : 0,
          parent: Array.isArray(parents) ? parents.length : 0
        });
      } catch (err) {
        console.error('Failed to fetch user counts:', err);
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, []);

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    ...DEFAULT_ROLES.map(role => ({ value: role.id, label: role.name }))
  ];

  const filteredRoles = selectedRole === 'all'
    ? DEFAULT_ROLES
    : DEFAULT_ROLES.filter(role => role.id === selectedRole);

  const handleToggle = (field) => {
    onChange({ ...settings, [field]: !settings[field] });
  };

  const totalUsers = Object.values(userCounts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Role-Based Access Control</h3>
          {!loadingCounts && (
            <span className="text-sm text-muted-foreground">{totalUsers} total users</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Select
            label="Filter by Role"
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            className="flex-1"
          />
        </div>

        <div className="space-y-3">
          {filteredRoles.map((role) => (
            <div key={role.id} className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name={role.icon} size={20} color={role.color} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{role.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {loadingCounts ? (
                        <span className="inline-block w-16 h-4 bg-muted rounded animate-pulse" />
                      ) : (
                        `${userCounts[role.id] || 0} users assigned`
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!settings.twoFactorAuth}
                onChange={() => handleToggle('twoFactorAuth')}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Password Expiry</h4>
              <p className="text-sm text-muted-foreground">Force password change every 90 days</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!settings.passwordExpiry}
                onChange={() => handleToggle('passwordExpiry')}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Session Timeout</h4>
              <p className="text-sm text-muted-foreground">Auto logout after 30 minutes of inactivity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!settings.sessionTimeout}
                onChange={() => handleToggle('sessionTimeout')}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Audit Trail</h3>
        <div className="bg-muted rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="UserPlus" size={14} color="var(--color-primary)" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">New user account created</p>
                <p className="text-xs text-muted-foreground">Admin User - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Shield" size={14} color="var(--color-warning)" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">Role permissions updated</p>
                <p className="text-xs text-muted-foreground">Admin User - 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <Icon name="UserX" size={14} color="var(--color-error)" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">User account deactivated</p>
                <p className="text-xs text-muted-foreground">Admin User - 1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
