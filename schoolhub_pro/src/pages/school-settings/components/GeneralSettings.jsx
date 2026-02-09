import React, { useRef } from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const GeneralSettings = ({ settings, onChange }) => {
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({ ...settings, schoolLogo: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onChange({ ...settings, schoolLogo: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">School Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="School Name"
            value={settings.schoolName || ''}
            onChange={(e) => handleInputChange('schoolName', e?.target?.value)}
            required
          />
          <Input
            label="Short Name"
            value={settings.shortName || ''}
            onChange={(e) => handleInputChange('shortName', e?.target?.value)}
          />
          <Input
            label="Email Address"
            type="email"
            value={settings.schoolEmail || ''}
            onChange={(e) => handleInputChange('schoolEmail', e?.target?.value)}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={settings.schoolPhone || ''}
            onChange={(e) => handleInputChange('schoolPhone', e?.target?.value)}
          />
          <Input
            label="Website"
            type="url"
            value={settings.schoolWebsite || ''}
            onChange={(e) => handleInputChange('schoolWebsite', e?.target?.value)}
          />
          <Input
            label="Year Established"
            type="number"
            value={settings.schoolEstablished || ''}
            onChange={(e) => handleInputChange('schoolEstablished', e?.target?.value)}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Address"
            value={settings.schoolAddress || ''}
            onChange={(e) => handleInputChange('schoolAddress', e?.target?.value)}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">School Logo & Branding</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">Upload Logo</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
              </label>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">Logo Preview</label>
            <div className="border border-border rounded-lg p-6 flex flex-col items-center justify-center bg-muted min-h-[150px] gap-3">
              {settings.schoolLogo ? (
                <>
                  <img src={settings.schoolLogo} alt="School logo preview" className="max-h-32 max-w-full object-contain" />
                  <button
                    onClick={handleRemoveLogo}
                    className="text-xs text-error hover:underline"
                  >
                    Remove logo
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Icon name="Image" size={48} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No logo uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="Mail" size={16} color="var(--color-primary)" />
            <span className="text-sm text-foreground">{settings.schoolEmail || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Phone" size={16} color="var(--color-primary)" />
            <span className="text-sm text-foreground">{settings.schoolPhone || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Globe" size={16} color="var(--color-primary)" />
            <span className="text-sm text-foreground">{settings.schoolWebsite || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={16} color="var(--color-primary)" />
            <span className="text-sm text-foreground">{settings.schoolAddress || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
