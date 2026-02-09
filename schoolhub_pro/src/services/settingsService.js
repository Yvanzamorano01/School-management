// No /settings backend route exists yet - use localStorage for now
const SETTINGS_KEY = 'schoolhub_settings';

const defaultSettings = {
  // General
  schoolName: 'SchoolHub Pro',
  shortName: 'SHP',
  schoolEmail: 'contact@schoolhub.com',
  schoolPhone: '+1234567890',
  schoolAddress: '',
  schoolWebsite: '',
  schoolEstablished: '',
  schoolLogo: null, // base64 string

  // Academic
  academicYear: '2024-2025',
  academicYearStart: '',
  academicYearEnd: '',
  numberOfTerms: '2',
  gradeSystem: 'percentage',
  passingGrade: '40',
  gradeRanges: [
    { grade: 'A+', min: 90, max: 100, gpa: 4.0 },
    { grade: 'A', min: 80, max: 89, gpa: 3.7 },
    { grade: 'B+', min: 70, max: 79, gpa: 3.3 },
    { grade: 'B', min: 60, max: 69, gpa: 3.0 },
    { grade: 'C', min: 50, max: 59, gpa: 2.0 },
    { grade: 'D', min: 40, max: 49, gpa: 1.0 },
    { grade: 'F', min: 0, max: 39, gpa: 0.0 }
  ],
  midtermWeight: '30',
  finalExamWeight: '70',
  assignmentWeight: '20',
  participationWeight: '10',
  classDuration: '45',
  breakDuration: '15',
  maxClassSize: '30',

  // System
  timezone: 'UTC-5',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  backupFrequency: 'daily',
  dataRetentionDays: '365',

  // Security
  twoFactorAuth: false,
  passwordExpiry: true,
  sessionTimeout: true
};

const settingsService = {
  async getSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
    return { ...defaultSettings };
  },

  async updateSettings(settingsData) {
    const current = await this.getSettings();
    const updated = { ...current, ...settingsData };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }
};

export default settingsService;
