import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';
import academicYearService from '../../../services/academicYearService';
import semesterService from '../../../services/semesterService';

const SystemPreferences = ({ settings, onChange }) => {
  const navigate = useNavigate();
  const [activeYear, setActiveYear] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivePeriods = async () => {
      try {
        const [years, semesters] = await Promise.all([
          academicYearService.getAll(),
          semesterService.getAll()
        ]);

        const currentYear = years.find(y => y.status === 'Active');
        const currentSemester = semesters.find(s => s.status === 'Active');

        setActiveYear(currentYear);
        setActiveSemester(currentSemester);
      } catch (error) {
        console.error('Error fetching active periods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePeriods();
  }, []);

  const handleInputChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: Academic Year & Terms (Read-Only Summary) */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Calendar" size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Academic Year Configuration</h3>
            <p className="text-sm text-muted-foreground">Manage ongoing academic periods and semesters.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Active Year Card */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Current Academic Year</span>
                    {activeYear ? (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full border border-warning/20">None Active</span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">
                    {activeYear ? activeYear.name : 'No Active Year'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activeYear ? `${new Date(activeYear.startDate).toLocaleDateString()} - ${new Date(activeYear.endDate).toLocaleDateString()}` : 'Please activate a year'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => navigate('/academic-years')}
                  iconName="ExternalLink"
                  iconPosition="right"
                >
                  Manage Years
                </Button>
              </div>

              {/* Active Semester Card */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Current Semester</span>
                    {activeSemester ? (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full border border-warning/20">None Active</span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">
                    {activeSemester ? activeSemester.name : 'No Active Semester'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activeSemester ? `${new Date(activeSemester.startDate).toLocaleDateString()} - ${new Date(activeSemester.endDate).toLocaleDateString()}` : 'Please activate a semester'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => navigate('/semesters')}
                  iconName="ExternalLink"
                  iconPosition="right"
                >
                  Manage Semesters
                </Button>
              </div>

            </div>
          )}

          <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground bg-accent/5 p-3 rounded-lg border border-accent/10">
            <Icon name="Info" size={16} className="text-accent mt-0.5 flex-shrink-0" />
            <p>
              To change the current academic year or semester, please use the dedicated management pages.
              The settings here reflect the periods currently marked as <strong>Active</strong> in the system.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Regional Settings */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Icon name="Globe" size={24} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Regional Settings</h3>
            <p className="text-sm text-muted-foreground">Localization preferences for your institution.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border rounded-xl p-6">
          <Select
            label="Language"
            value={settings.language || 'en'}
            onChange={(value) => handleInputChange('language', value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'Français' },
              { value: 'es', label: 'Español' },
              { value: 'ar', label: 'العربية' }
            ]}
          />

          <Select
            label="Currency"
            value={settings.currency || 'USD'}
            onChange={(value) => handleInputChange('currency', value)}
            options={[
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'XAF', label: 'XAF (FCFA)' },
              { value: 'XOF', label: 'XOF (CFA)' },
              { value: 'NGN', label: 'NGN (₦)' },
              { value: 'GHS', label: 'GHS (₵)' },
              { value: 'MAD', label: 'MAD (DH)' }

            ]}
          />

          <Select
            label="Date Format"
            value={settings.dateFormat || 'MM/DD/YYYY'}
            onChange={(value) => handleInputChange('dateFormat', value)}
            options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK/EU)' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
            ]}
          />

          <Select
            label="Timezone"
            value={settings.timezone || 'UTC'}
            onChange={(value) => handleInputChange('timezone', value)}
            options={[
              { value: 'UTC', label: 'UTC (GMT)' },
              { value: 'UTC+1', label: 'UTC+1 (CET/WAT)' },
              { value: 'UTC-5', label: 'UTC-5 (EST)' },
              { value: 'UTC-8', label: 'UTC-8 (PST)' },
              { value: 'UTC+3', label: 'UTC+3 (EAT)' }
            ]}
          />
        </div>
      </section>

      {/* SECTION 3: Grade System Link */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Icon name="Award" size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Grading System</h3>
            <p className="text-sm text-muted-foreground">Manage grade scales, pass marks, and GPA configurations.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="text-base font-semibold text-foreground mb-2">Grading Configuration</h4>
            <p className="text-sm text-muted-foreground mb-4">
              The grading system is managed in a dedicated section. You can configure grade letters (A, B, C...), percentage ranges, GPA points, and pass marks there.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-accent">
              <Icon name="Info" size={14} />
              <span>Changes affect all student reports immediately.</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/grade-system')}
            iconName="ExternalLink"
            iconPosition="right"
            className="whitespace-nowrap"
          >
            Manage Grades
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SystemPreferences;

