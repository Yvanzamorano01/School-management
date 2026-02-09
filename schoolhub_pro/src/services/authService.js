import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    // Map backend roles to frontend roles
    const roleMapping = {
      'super_admin': 'admin',
      'admin': 'admin',
      'moderator': 'admin',
      'teacher': 'teacher',
      'student': 'student',
      'parent': 'parent',
      'bursar': 'bursar'
    };
    const frontendRole = roleMapping[user.role] || user.role;

    // Get user name from profile
    const userName = user.profile?.name || user.email.split('@')[0];

    // Extract profileId from the profile object
    const profileId = user.profile?._id || null;

    // Store token and user data with normalized profileId
    const normalizedUser = { ...user, profileId };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('userRole', frontendRole);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', user.email);

    return { token, user: { ...normalizedUser, role: frontendRole, name: userName } };
  },


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async validateToken() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  async verifyPassword(password) {
    const response = await api.post('/auth/verify-password', { password });
    return response.data;
  },

  async register(email, password, role, profileData) {
    const response = await api.post('/auth/public-register', { email, password, role, profileData });
    return response.data;
  }
};

export default authService;
