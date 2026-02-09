import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AddStudentModal = ({ isOpen, onClose, onSubmit, classOptions, sectionOptions, student }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    studentId: '',
    class: '',
    section: '',
    admissionDate: '',
    bloodGroup: '',
    address: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Helper function to convert date string "1/15/2000" to "2000-01-15"
  const convertDateToInputFormat = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (student) {
      const nameParts = (student.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const parentNameParts = (student.parentName || '').split(' ');
      const parentFirstName = parentNameParts[0] || '';
      const parentLastName = parentNameParts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        dateOfBirth: convertDateToInputFormat(student.dateOfBirth),
        gender: student.gender || '',
        studentId: student.studentId || '',
        class: student.classId || '',
        section: student.sectionId || '',
        admissionDate: convertDateToInputFormat(student.admissionDate),
        bloodGroup: student.bloodGroup || '',
        address: student.address || '',
        parentFirstName,
        parentLastName,
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentContact || '',
        relationship: student.relationship || '',
        photo: null
      });
    }
  }, [student]);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const relationshipOptions = [
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Guardian', label: 'Guardian' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData?.gender) newErrors.gender = 'Gender is required';
    if (!formData?.class) newErrors.class = 'Class is required';
    if (!formData?.section) newErrors.section = 'Section is required';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        classId: formData.class,
        sectionId: formData.section,
        admissionDate: formData.admissionDate || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        address: formData.address || undefined,
        parentName: `${formData.parentFirstName} ${formData.parentLastName}`.trim() || undefined,
        parentEmail: formData.parentEmail || undefined,
        parentContact: formData.parentPhone || undefined,
        relationship: formData.relationship || undefined
      };
      // Only include studentId if user provided one
      if (formData.studentId?.trim()) {
        submitData.studentId = formData.studentId.trim();
      }
      // Include student ID when editing
      if (student?.id) {
        submitData.id = student.id;
      }
      onSubmit(submitData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      studentId: '',
      class: '',
      section: '',
      admissionDate: '',
      bloodGroup: '',
      address: '',
      parentFirstName: '',
      parentLastName: '',
      parentEmail: '',
      parentPhone: '',
      relationship: '',
      photo: null
    });
    setPhotoPreview(null);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={student ? "Edit Student" : "Add New Student"}
      description={student ? "Update the student information" : "Fill in the student information to create a new admission"}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} iconName="Save" iconPosition="left">
            {student ? "Update Student" : "Save Student"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Student Photo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Student photo preview showing uploaded image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon name="User" size={40} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outline"
                  iconName="Upload"
                  iconPosition="left"
                  asChild
                >
                  <span className="cursor-pointer">Upload Photo</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              placeholder="Enter first name"
              value={formData?.firstName}
              onChange={(e) => handleInputChange('firstName', e?.target?.value)}
              error={errors?.firstName}
              required
            />

            <Input
              label="Last Name"
              type="text"
              placeholder="Enter last name"
              value={formData?.lastName}
              onChange={(e) => handleInputChange('lastName', e?.target?.value)}
              error={errors?.lastName}
              required
            />

            <Input
              label="Date of Birth"
              type="date"
              value={formData?.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
              error={errors?.dateOfBirth}
              required
            />

            <Select
              label="Gender"
              placeholder="Select gender"
              options={genderOptions}
              value={formData?.gender}
              onChange={(value) => handleInputChange('gender', value)}
              error={errors?.gender}
              required
            />

            <Input
              label="Student ID"
              type="text"
              placeholder="Enter student ID"
              value={formData?.studentId}
              onChange={(e) => handleInputChange('studentId', e?.target?.value)}
              error={errors?.studentId}
              required
            />

            <Select
              label="Blood Group"
              placeholder="Select blood group"
              options={bloodGroupOptions}
              value={formData?.bloodGroup}
              onChange={(value) => handleInputChange('bloodGroup', value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Class"
              placeholder="Select class"
              options={classOptions}
              value={formData?.class}
              onChange={(value) => handleInputChange('class', value)}
              error={errors?.class}
              required
            />

            <Select
              label="Section"
              placeholder="Select section"
              options={sectionOptions}
              value={formData?.section}
              onChange={(value) => handleInputChange('section', value)}
              error={errors?.section}
              required
              disabled={!formData?.class}
            />

            <Input
              label="Admission Date"
              type="date"
              value={formData?.admissionDate}
              onChange={(e) => handleInputChange('admissionDate', e?.target?.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Parent/Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Parent First Name"
              type="text"
              placeholder="Enter parent first name"
              value={formData?.parentFirstName}
              onChange={(e) => handleInputChange('parentFirstName', e?.target?.value)}
              error={errors?.parentFirstName}
              required
            />

            <Input
              label="Parent Last Name"
              type="text"
              placeholder="Enter parent last name"
              value={formData?.parentLastName}
              onChange={(e) => handleInputChange('parentLastName', e?.target?.value)}
            />

            <Select
              label="Relationship"
              placeholder="Select relationship"
              options={relationshipOptions}
              value={formData?.relationship}
              onChange={(value) => handleInputChange('relationship', value)}
            />

            <Input
              label="Parent Phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData?.parentPhone}
              onChange={(e) => handleInputChange('parentPhone', e?.target?.value)}
              error={errors?.parentPhone}
              required
            />

            <Input
              label="Parent Email"
              type="email"
              placeholder="Enter email address"
              value={formData?.parentEmail}
              onChange={(e) => handleInputChange('parentEmail', e?.target?.value)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Address"
            type="text"
            placeholder="Enter complete address"
            value={formData?.address}
            onChange={(e) => handleInputChange('address', e?.target?.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddStudentModal;