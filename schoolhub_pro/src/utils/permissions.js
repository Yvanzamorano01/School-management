/**
 * Frontend permissions utility
 * Reads permissions from localStorage user data
 * Works with the backend hasPermission middleware
 */

/**
 * Get the current user from localStorage
 */
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Get the backend role (super_admin, admin, moderator, teacher, student, parent, bursar)
 */
export function getBackendRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Get the permissions array for admin-type users
 * Returns empty array for non-admin roles
 */
export function getPermissions() {
  const user = getCurrentUser();
  return user?.profile?.permissions || [];
}

/**
 * Check if the current user has a specific permission
 * - super_admin always has all permissions
 * - admin/moderator check against their permissions array
 * - 'All' in permissions grants everything
 */
export function hasPermission(permission) {
  const role = getBackendRole();

  // Super admin has all permissions
  if (role === 'super_admin') return true;

  // Non-admin roles don't use admin permissions
  if (!['admin', 'moderator'].includes(role)) return false;

  const permissions = getPermissions();
  return permissions.includes('All') || permissions.includes(permission);
}

/**
 * Check if the current user is a super admin
 */
export function isSuperAdmin() {
  return getBackendRole() === 'super_admin';
}

/**
 * Check if the current user has any admin-level role
 */
export function isAdminRole() {
  const role = getBackendRole();
  return ['super_admin', 'admin', 'moderator'].includes(role);
}

/**
 * Check if a sidebar item should be visible based on required permission
 * If no permission is required, the item is always visible
 * If requireSuperAdmin is true, only super_admin can see it
 */
export function canViewMenuItem(item) {
  if (item.requireSuperAdmin) {
    return isSuperAdmin();
  }
  if (item.permission) {
    return hasPermission(item.permission);
  }
  return true;
}
