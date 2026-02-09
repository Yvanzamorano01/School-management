import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AddParentModal = ({ isOpen, onClose, onSubmit, parent, studentOptions = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    childrenIds: [],
    address: '',
    occupation: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent?.name || '',
        email: parent?.email || '',
        phone: parent?.phone || '',
        status: parent?.status || 'Active',
        childrenIds: parent?.childrenIds || [],
        address: parent?.address !== 'N/A' ? parent?.address || '' : '',
        occupation: parent?.occupation !== 'N/A' ? parent?.occupation || '' : '',
        photo: null
      });
      setPhotoPreview(parent?.photo || null);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'Active',
        childrenIds: [],
        address: '',
        occupation: '',
        photo: null
      });
      setPhotoPreview(null);
    }
    setErrors({});
  }, [parent, isOpen]);

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
    if (!formData?.phone?.trim()) newErrors.phone = 'Phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        phone: formData.phone.trim(),
        status: formData.status,
        childrenIds: formData.childrenIds,
        address: formData.address?.trim() || undefined,
        occupation: formData.occupation?.trim() || undefined
      };
      if (parent?.id) {
        submitData.id = parent.id;
      }
      onSubmit(submitData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'Active',
      childrenIds: [],
      address: '',
      occupation: '',
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
      title={parent ? 'Edit Parent' : 'Add New Parent'}
      description={parent ? 'Update parent information' : 'Fill in the details to add a new parent account'}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {parent ? 'Update Parent' : 'Add Parent'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {photoPreview ? (
              <Image src={photoPreview} alt="Parent photo preview" className="w-full h-full object-cover" />
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
            placeholder="parent@email.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
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

          <Input
            label="Occupation"
            placeholder="e.g., Engineer"
            value={formData?.occupation}
            onChange={(e) => handleInputChange('occupation', e?.target?.value)}
          />

          <Select
            label="Link Children"
            placeholder="Select children"
            options={studentOptions}
            value={formData?.childrenIds}
            onChange={(value) => handleInputChange('childrenIds', value)}
            multiple
            searchable
          />
        </div>

        <Input
          label="Address"
          placeholder="Enter full address"
          value={formData?.address}
          onChange={(e) => handleInputChange('address', e?.target?.value)}
        />
      </div>
    </Modal>
  );
};

export default AddParentModal;
