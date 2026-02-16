import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import authService from '../../../services/authService';

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', icon: 'ShieldCheck', color: 'var(--color-error)' },
  admin: { label: 'Administrator', icon: 'Shield', color: 'var(--color-error)' },
  moderator: { label: 'Moderator', icon: 'ShieldAlert', color: 'var(--color-warning)' },
  teacher: { label: 'Teacher', icon: 'UserCheck', color: 'var(--color-primary)' },
  student: { label: 'Student', icon: 'Users', color: 'var(--color-success)' },
  parent: { label: 'Parent', icon: 'UserCircle', color: 'var(--color-warning)' },
  bursar: { label: 'Bursar', icon: 'Banknote', color: 'var(--color-accent)' }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Never';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const UserManagement = ({ settings, onChange }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await authService.getUserStats();
        // api.js interceptor already unwraps { success, data } → data
        setStatsData(data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleToggle = (field) => {
    onChange({ ...settings, [field]: !settings[field] });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Icon name="AlertCircle" size={48} color="var(--color-error)" />
        <p className="text-muted-foreground mt-4">{error}</p>
      </div>
    );
  }

  const { stats, recentRegistrations, recentLogins } = statsData || {};

  // Build role breakdown from stats
  const roleBreakdown = Object.entries(stats?.byRole || {}).map(([role, data]) => ({
    role,
    ...ROLE_CONFIG[role],
    ...data
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">User Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.total || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="Users" size={24} color="var(--color-primary)" />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-success mt-1">{stats?.active || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Icon name="UserCheck" size={24} color="var(--color-success)" />
              </div>
            </div>
            {stats?.total > 0 && (
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-success rounded-full h-1.5 transition-all"
                    style={{ width: `${Math.round((stats.active / stats.total) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.active / stats.total) * 100)}% of total
                </p>
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-3xl font-bold text-error mt-1">{stats?.inactive || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                <Icon name="UserX" size={24} color="var(--color-error)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Breakdown by Role</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {roleBreakdown.map((role) => (
            <div key={role.role} className="bg-surface border border-border rounded-lg p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Icon name={role.icon || 'User'} size={20} color={role.color || 'var(--color-primary)'} />
              </div>
              <p className="text-2xl font-bold text-foreground">{role.total}</p>
              <p className="text-xs text-muted-foreground capitalize">{role.label || role.role}</p>
              {role.inactive > 0 && (
                <p className="text-[10px] text-error mt-1">{role.inactive} inactive</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
        <div className="space-y-3">
          {[
            { key: 'twoFactorAuth', title: 'Two-Factor Authentication', desc: 'Require 2FA for admin accounts' },
            { key: 'passwordExpiry', title: 'Password Expiry', desc: 'Force password change every 90 days' },
            { key: 'sessionTimeout', title: 'Session Timeout', desc: 'Auto logout after 30 minutes of inactivity' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!settings[item.key]}
                  onChange={() => handleToggle(item.key)}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Registrations */}
          <div className="bg-surface border border-border rounded-lg">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Icon name="UserPlus" size={16} color="var(--color-primary)" />
              <h4 className="font-medium text-foreground text-sm">Recent Registrations</h4>
            </div>
            <div className="divide-y divide-border">
              {recentRegistrations?.length > 0 ? (
                recentRegistrations.slice(0, 5).map((user, idx) => {
                  const cfg = ROLE_CONFIG[user.role] || {};
                  return (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={cfg.icon || 'User'} size={14} color={cfg.color || 'var(--color-primary)'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user.profileName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{cfg.label || user.role}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{timeAgo(user.createdAt)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </div>

          {/* Recent Logins */}
          <div className="bg-surface border border-border rounded-lg">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Icon name="LogIn" size={16} color="var(--color-success)" />
              <h4 className="font-medium text-foreground text-sm">Recent Logins</h4>
            </div>
            <div className="divide-y divide-border">
              {recentLogins?.length > 0 ? (
                recentLogins.slice(0, 5).map((user, idx) => {
                  const cfg = ROLE_CONFIG[user.role] || {};
                  return (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={cfg.icon || 'User'} size={14} color={cfg.color || 'var(--color-primary)'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user.profileName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{cfg.label || user.role}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{timeAgo(user.lastLogin)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">No login data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
