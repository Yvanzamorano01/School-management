const Admin = require('../models/Admin');

// Role-based access control middleware
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient role.'
      });
    }

    next();
  };
};

// Permission-based access control middleware
// Checks the Admin model's permissions array for admin/moderator roles
// Super admin always passes, non-admin roles (teacher, student, parent, bursar) bypass
const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const role = req.user.role;

      // Super admin has all permissions
      if (role === 'super_admin') return next();

      // Non-admin roles bypass permission check (they're gated by roleCheck)
      if (!['admin', 'moderator'].includes(role)) return next();

      // For admin/moderator: fetch admin profile and check permissions
      if (!req.adminProfile) {
        req.adminProfile = await Admin.findOne({ userId: req.user._id });
      }

      if (!req.adminProfile) {
        return res.status(403).json({
          success: false,
          message: 'Admin profile not found'
        });
      }

      if (req.adminProfile.permissions.includes('All') || req.adminProfile.permissions.includes(permission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied. '${permission}' permission required.`
      });
    } catch (err) {
      next(err);
    }
  };
};

// Rank hierarchy for admin types (higher number = higher rank)
const RANK = { 'Moderator': 1, 'Admin': 2, 'Super Admin': 3 };

// Middleware to prevent modifying admins of equal or higher rank
// Must be used after auth middleware. Checks req.params.id against current user's admin profile.
const preventHigherRankEdit = async (req, res, next) => {
  try {
    const role = req.user.role;

    // Super admin can modify anyone
    if (role === 'super_admin') return next();

    // Get the target admin being modified
    const targetAdmin = await Admin.findById(req.params.id);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Get the current user's admin profile
    if (!req.adminProfile) {
      req.adminProfile = await Admin.findOne({ userId: req.user._id });
    }

    if (!req.adminProfile) {
      return res.status(403).json({ success: false, message: 'Admin profile not found' });
    }

    const currentRank = RANK[req.adminProfile.role] || 0;
    const targetRank = RANK[targetAdmin.role] || 0;

    // Cannot modify someone of equal or higher rank
    if (targetRank >= currentRank) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You cannot modify a ${targetAdmin.role}.`
      });
    }

    // Prevent escalating role beyond own rank
    if (req.body.role) {
      const newRank = RANK[req.body.role] || 0;
      if (newRank >= currentRank) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You cannot assign the role '${req.body.role}'.`
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Common role combinations
const isSuperAdmin = roleCheck('super_admin');
const isAdmin = roleCheck('super_admin', 'admin', 'moderator');
const isTeacher = roleCheck('super_admin', 'admin', 'moderator', 'teacher');
const isFinance = roleCheck('super_admin', 'admin', 'moderator', 'bursar');
const isStaff = roleCheck('super_admin', 'admin', 'moderator', 'teacher', 'bursar');

module.exports = {
  roleCheck,
  hasPermission,
  preventHigherRankEdit,
  isAdmin,
  isSuperAdmin,
  isTeacher,
  isFinance,
  isStaff
};
