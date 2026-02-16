import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';

import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import authService from '../../services/authService';

import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';

const Login = () => {
  const { schoolName, schoolLogo } = useSchoolSettings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
    { value: 'parent', label: 'Parent' }
  ];

  const roleRoutes = {
    admin: '/admin-dashboard',
    teacher: '/teacher-dashboard',
    student: '/student-dashboard',
    parent: '/parent-dashboard'
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData?.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login(formData.email, formData.password);
      const userRole = response.user?.role;

      // Verify role matches selection (role is already mapped by authService)
      if (userRole !== formData.role) {
        setErrors({
          submit: `This account is registered as "${userRole}". Please select the correct role.`
        });
        authService.logout();
        setIsLoading(false);
        return;
      }

      if (formData?.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect based on role
      navigate(roleRoutes?.[userRole] || '/admin-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password recovery feature will be available soon. Please contact your system administrator.');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-elevation-3 p-6 md:p-8 lg:p-10">
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              {schoolLogo ? (
                <img src={schoolLogo} alt="School logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
              ) : (
                <Icon name="GraduationCap" size={40} color="var(--color-primary)" />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
              {schoolName}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground text-center mt-2">
              Sign in to access your portal
            </p>
          </div>

          {errors?.submit && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3">
              <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{errors?.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <Select
              label="Select Role"
              placeholder="Choose your role"
              options={roleOptions}
              value={formData?.role}
              onChange={(value) => handleInputChange('role', value)}
              error={errors?.role}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              error={errors?.email}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                checked={formData?.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
              />
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              variant="default"
              fullWidth
              loading={isLoading}
              iconName="LogIn"
              iconPosition="right"
              className="mt-6"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 md:mt-8 p-4 bg-muted/50 rounded-xl">
            <p className="text-xs md:text-sm text-muted-foreground text-center mb-3">
              Demo Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { role: 'Admin', email: 'admin@schoolhub.com', pass: 'admin123' },
                { role: 'Teacher', email: 'mamadou.diallo@schoolhub.com', pass: 'teacher123' },
                { role: 'Student', email: 'amadou.diallo0@student.schoolhub.com', pass: 'student123' },
                { role: 'Parent', email: 'amadou.diallo0@email.com', pass: 'parent123' }
              ].map(({ role, email, pass }) => (
                <div key={role} className="bg-background/60 rounded-lg p-2.5">
                  <span className="text-muted-foreground font-medium block mb-1">{role}</span>
                  <span className="font-mono text-foreground text-[10px] break-all leading-relaxed">{email}</span>
                  <span className="font-mono text-primary text-[10px] block">{pass}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={16} />
            <span>Secure SSL Connection</span>
          </div>
        </div>

        <p className="text-center text-xs md:text-sm text-muted-foreground mt-6">
          &copy; {new Date()?.getFullYear()} {schoolName}. All rights reserved.
        </p>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-1">
          Developed by Yvan Zamorano
        </p>
      </div>
    </div>
  );
};

export default Login;
