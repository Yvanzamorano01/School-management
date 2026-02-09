import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AddTeacherModal = ({ isOpen, onClose, onSubmit, teacher, classOptions = [], subjectOptions = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: [],
    classIds: [],
    status: 'Active',
    qualification: '',
    experience: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher?.name || '',
        email: teacher?.email || '',
        phone: teacher?.phone || '',
        subjects: teacher?.subjects || [],
        classIds: teacher?.classIds || [],
        status: teacher?.status || 'Active',
        qualification: teacher?.qualification !== 'N/A' ? teacher?.qualification || '' : '',
        experience: teacher?.experience !== 'N/A' ? teacher?.experience || '' : '',
        photo: null
      });
      setPhotoPreview(teacher?.photo || null);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subjects: [],
        classIds: [],
        status: 'Active',
        qualification: '',
        experience: '',
        photo: null
      });
      setPhotoPreview(null);
    }
    setErrors({});
  }, [teacher, isOpen]);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
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
    if (!formData?.name?.trim()) newErrors.name = 'Full name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (!formData?.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData?.subjects?.length) newErrors.subjects = 'At least one subject is required';
    if (!formData?.classIds?.length) newErrors.classIds = 'At least one class is required';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subjects: formData.subjects,
        classIds: formData.classIds,
        status: formData.status,
        qualification: formData.qualification?.trim() || undefined,
        experience: formData.experience?.trim() || undefined
      };
      onSubmit(submitData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subjects: [],
      classIds: [],
      status: 'Active',
      qualification: '',
      experience: '',
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
      title={teacher ? 'Edit Teacher' : 'Add New Teacher'}
      description={teacher ? 'Update teacher information' : 'Fill in the details to add a new teacher'}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {teacher ? 'Update Teacher' : 'Add Teacher'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {photoPreview ? (
              <Image src={photoPreview} alt="Teacher photo preview" className="w-full h-full object-cover" />
            ) : (
              <Icon name="User" size={32} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload Photo
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max. 2MB)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="teacher@school.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="+237 6XX XXX XXX"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            error={errors?.phone}
            required
          />

          <Select
            label="Status"
            placeholder="Select status"
            options={statusOptions}
            value={formData?.status}
            onChange={(value) => handleInputChange('status', value)}
            required
          />

          <Select
            label="Subjects"
            placeholder="Select subjects"
            options={subjectOptions}
            value={formData?.subjects}
            onChange={(value) => handleInputChange('subjects', value)}
            multiple
            error={errors?.subjects}
            required
          />

          <Select
            label="Classes"
            placeholder="Select classes"
            options={classOptions}
            value={formData?.classIds}
            onChange={(value) => handleInputChange('classIds', value)}
            multiple
            error={errors?.classIds}
            required
          />

          <Input
            label="Qualification"
            placeholder="e.g., MSc in Physics"
            value={formData?.qualification}
            onChange={(e) => handleInputChange('qualification', e?.target?.value)}
          />

          <Input
            label="Experience"
            placeholder="e.g., 5 years"
            value={formData?.experience}
            onChange={(e) => handleInputChange('experience', e?.target?.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddTeacherModal;
