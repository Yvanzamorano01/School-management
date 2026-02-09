import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import api from '../../services/api';
import { useSchoolSettings } from '../../contexts/SchoolSettingsContext';

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: 'Users',
    color: 'var(--color-primary)',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary',
    description: 'Access courses, grades and schedule'
  },
  {
    id: 'teacher',
    label: 'Teacher',
    icon: 'UserCheck',
    color: 'var(--color-success)',
    bgClass: 'bg-success/10',
    borderClass: 'border-success',
    description: 'Manage classes, grades and materials'
  },
  {
    id: 'parent',
    label: 'Parent',
    icon: 'UserCircle',
    color: 'var(--color-warning)',
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning',
    description: 'Monitor your child\'s progress'
  }
];

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

const Register = () => {
  const navigate = useNavigate();
  const { schoolName, schoolLogo } = useSchoolSettings();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Common fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Student fields
  const [studentData, setStudentData] = useState({
    gender: '',
    dateOfBirth: '',
    classId: '',
    sectionId: '',
    phone: '',
    address: ''
  });

  // Teacher fields
  const [teacherData, setTeacherData] = useState({
    phone: '',
    qualification: '',
    experience: ''
  });

  // Parent fields
  const [parentData, setParentData] = useState({
    phone: '',
    occupation: '',
    address: ''
  });

  // Class/Section data for students
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  // Fetch classes when student role is selected (public endpoint, no auth needed)
  useEffect(() => {
    if (selectedRole === 'student' && step === 2) {
      const fetchClasses = async () => {
        try {
          setLoadingClasses(true);
          const response = await api.get('/auth/public-classes');
          const list = Array.isArray(response.data) ? response.data : [];
          setClasses(list);
        } catch (err) {
          console.error('Failed to fetch classes:', err);
        } finally {
          setLoadingClasses(false);
        }
      };
      fetchClasses();
    }
  }, [selectedRole, step]);

  // Fetch sections when class changes (public endpoint, no auth needed)
  useEffect(() => {
    if (studentData.classId) {
      const fetchSections = async () => {
        try {
          setLoadingSections(true);
          const response = await api.get(`/auth/public-sections/${studentData.classId}`);
          const list = Array.isArray(response.data) ? response.data : [];
          setSections(list);
        } catch (err) {
          console.error('Failed to fetch sections:', err);
        } finally {
          setLoadingSections(false);
        }
      };
      fetchSections();
    } else {
      setSections([]);
      setStudentData(prev => ({ ...prev, sectionId: '' }));
    }
  }, [studentData.classId]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleStudentChange = (field, value) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleTeacherChange = (field, value) => {
    setTeacherData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleParentChange = (field, value) => {
    setParentData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const selectRole = (roleId) => {
    setSelectedRole(roleId);
    setErrors({});
    setStep(2);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (selectedRole === 'student') {
      if (!studentData.classId) newErrors.classId = 'Please select a class';
      if (!studentData.sectionId) newErrors.sectionId = 'Please select a section';
    }

    if (selectedRole === 'parent') {
      if (!parentData.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let profileData = { name: formData.name };

      if (selectedRole === 'student') {
        profileData = {
          ...profileData,
          gender: studentData.gender || undefined,
          dateOfBirth: studentData.dateOfBirth || undefined,
          classId: studentData.classId,
          sectionId: studentData.sectionId,
          phone: studentData.phone || undefined,
          address: studentData.address || undefined
        };
      } else if (selectedRole === 'teacher') {
        profileData = {
          ...profileData,
          phone: teacherData.phone || undefined,
          qualification: teacherData.qualification || undefined,
          experience: teacherData.experience || undefined
        };
      } else if (selectedRole === 'parent') {
        profileData = {
          ...profileData,
          phone: parentData.phone,
          occupation: parentData.occupation || undefined,
          address: parentData.address || undefined
        };
      }

      await authService.register(formData.email, formData.password, selectedRole, profileData);
      setSuccess(true);
      setStep(3);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const classOptions = classes.map(c => ({ value: c._id, label: c.name }));
  const sectionOptions = sections.map(s => ({ value: s._id, label: s.name }));

  const roleInfo = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl shadow-elevation-3 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              {schoolLogo ? (
                <img src={schoolLogo} alt="School logo" className="w-10 h-10 object-contain rounded" />
              ) : (
                <Icon name="GraduationCap" size={36} color="var(--color-primary)" />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
              {schoolName}
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {step === 1 && 'Create your account'}
              {step === 2 && `Register as ${roleInfo?.label}`}
              {step === 3 && 'Registration Complete'}
            </p>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s}
                  </div>
                  {s < 2 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3">
              <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{errors.submit}</p>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-3">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className="w-full flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl ${role.bgClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={role.icon} size={24} color={role.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{role.label}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Back button */}
              <button
                type="button"
                onClick={() => { setStep(1); setErrors({}); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <Icon name="ArrowLeft" size={16} />
                <span>Change role</span>
              </button>

              {/* Common fields */}
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e?.target?.value)}
                error={errors.name}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e?.target?.value)}
                error={errors.email}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e?.target?.value)}
                    error={errors.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFormChange('confirmPassword', e?.target?.value)}
                  error={errors.confirmPassword}
                  required
                />
              </div>

              {/* Separator */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {selectedRole === 'student' && 'Student Information'}
                  {selectedRole === 'teacher' && 'Teacher Information'}
                  {selectedRole === 'parent' && 'Parent Information'}
                </p>
              </div>

              {/* Student specific fields */}
              {selectedRole === 'student' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Class"
                      placeholder="Select class"
                      options={classOptions}
                      value={studentData.classId}
                      onChange={(value) => handleStudentChange('classId', value)}
                      error={errors.classId}
                      loading={loadingClasses}
                      required
                    />
                    <Select
                      label="Section"
                      placeholder={studentData.classId ? 'Select section' : 'Select class first'}
                      options={sectionOptions}
                      value={studentData.sectionId}
                      onChange={(value) => handleStudentChange('sectionId', value)}
                      error={errors.sectionId}
                      loading={loadingSections}
                      disabled={!studentData.classId}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Gender"
                      placeholder="Select gender"
                      options={genderOptions}
                      value={studentData.gender}
                      onChange={(value) => handleStudentChange('gender', value)}
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={studentData.dateOfBirth}
                      onChange={(e) => handleStudentChange('dateOfBirth', e?.target?.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="Phone number"
                      value={studentData.phone}
                      onChange={(e) => handleStudentChange('phone', e?.target?.value)}
                    />
                    <Input
                      label="Address"
                      placeholder="Your address"
                      value={studentData.address}
                      onChange={(e) => handleStudentChange('address', e?.target?.value)}
                    />
                  </div>
                </>
              )}

              {/* Teacher specific fields */}
              {selectedRole === 'teacher' && (
                <>
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="Phone number"
                    value={teacherData.phone}
                    onChange={(e) => handleTeacherChange('phone', e?.target?.value)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Qualification"
                      placeholder="e.g. Bachelor's in Mathematics"
                      value={teacherData.qualification}
                      onChange={(e) => handleTeacherChange('qualification', e?.target?.value)}
                    />
                    <Input
                      label="Experience"
                      placeholder="e.g. 5 years"
                      value={teacherData.experience}
                      onChange={(e) => handleTeacherChange('experience', e?.target?.value)}
                    />
                  </div>
                </>
              )}

              {/* Parent specific fields */}
              {selectedRole === 'parent' && (
                <>
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="Phone number"
                    value={parentData.phone}
                    onChange={(e) => handleParentChange('phone', e?.target?.value)}
                    error={errors.phone}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Occupation"
                      placeholder="e.g. Engineer"
                      value={parentData.occupation}
                      onChange={(e) => handleParentChange('occupation', e?.target?.value)}
                    />
                    <Input
                      label="Address"
                      placeholder="Your address"
                      value={parentData.address}
                      onChange={(e) => handleParentChange('address', e?.target?.value)}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isLoading}
                iconName="UserPlus"
                iconPosition="right"
                className="mt-4"
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                <Icon name="CheckCircle" size={44} color="var(--color-success)" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Account Created!</h2>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Your {roleInfo?.label?.toLowerCase()} account has been created successfully. You can now sign in with your credentials.
              </p>
              <Button
                variant="default"
                fullWidth
                iconName="LogIn"
                iconPosition="right"
                onClick={() => navigate('/login')}
              >
                Go to Sign In
              </Button>
            </div>
          )}

          {/* Footer link */}
          {step < 3 && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={16} />
            <span>Secure SSL Connection</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} {schoolName}. All rights reserved.
        </p>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-1">
          Developed by Yvan Zamorano
        </p>
      </div>
    </div>
  );
};

export default Register;
