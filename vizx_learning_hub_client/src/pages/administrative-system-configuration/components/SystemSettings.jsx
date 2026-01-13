import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'AI Learning Hub',
    platformTagline: 'Empowering teams through AI education',
    companyLogo: null,
    defaultLanguage: 'en',
    defaultTimezone: 'UTC',
    sessionTimeout: 60,
    maintenanceMode: false,
    allowUserRegistration: true,
    requireEmailVerification: true,
    dataRetentionDays: 365,
    enableAnalytics: true,
    maxUploadSize: 10,
    supportEmail: 'support@ailearninghub.com',
    termsOfServiceUrl: '',
    privacyPolicyUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' }
  ];

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setHasChanges(false);

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }, 1000);
  };

  const handleLogoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('companyLogo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      // Reset to defaults
      setSettings({
        ...settings,
        sessionTimeout: 60,
        dataRetentionDays: 365,
        maxUploadSize: 10
      });
      setHasChanges(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Settings</h3>
          <p className="text-sm text-muted-foreground">Configure general platform settings and preferences</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-warning">Unsaved changes</span>
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3
          ${saveMessage?.type === 'success' ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}
        `}>
          <Icon 
            name={saveMessage?.type === 'success' ? 'CheckCircle' : 'AlertCircle'} 
            size={20} 
            className={saveMessage?.type === 'success' ? 'text-success' : 'text-error'} 
          />
          <span className={`text-sm font-medium ${saveMessage?.type === 'success' ? 'text-success' : 'text-error'}`}>
            {saveMessage?.text}
          </span>
        </div>
      )}

      {/* Branding Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Palette" size={20} className="text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Branding & Identity</h4>
            <p className="text-sm text-muted-foreground">Customize your platform's appearance</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Platform Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={settings?.platformName}
              onChange={(e) => handleInputChange('platformName', e?.target?.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="AI Learning Hub"
            />
          </div>

          {/* Platform Tagline */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Platform Tagline
            </label>
            <input
              type="text"
              value={settings?.platformTagline}
              onChange={(e) => handleInputChange('platformTagline', e?.target?.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="Empowering teams through AI education"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              {settings?.companyLogo ? (
                <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={settings?.companyLogo} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => handleInputChange('companyLogo', null)}
                    className="absolute top-1 right-1 w-6 h-6 bg-error rounded-full flex items-center justify-center hover:bg-error/90 transition-colors"
                  >
                    <Icon name="X" size={12} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <Icon name="Image" size={32} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button variant="outline" as="span" iconName="Upload" iconPosition="left">
                    Upload Logo
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: PNG or SVG, max 2MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <Icon name="Globe" size={20} className="text-secondary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Regional Settings</h4>
            <p className="text-sm text-muted-foreground">Configure language and timezone defaults</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Language */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Language
            </label>
            <select
              value={settings?.defaultLanguage}
              onChange={(e) => handleInputChange('defaultLanguage', e?.target?.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {languages?.map((lang) => (
                <option key={lang?.code} value={lang?.code}>
                  {lang?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Default Timezone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Timezone
            </label>
            <select
              value={settings?.defaultTimezone}
              onChange={(e) => handleInputChange('defaultTimezone', e?.target?.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {timezones?.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Security & Session Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-warning" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Security & Sessions</h4>
            <p className="text-sm text-muted-foreground">Manage security policies and session settings</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="480"
              value={settings?.sessionTimeout}
              onChange={(e) => handleInputChange('sessionTimeout', parseInt(e?.target?.value))}
              className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Users will be logged out after this period of inactivity
            </p>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            {/* Allow User Registration */}
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Allow User Registration</div>
                <div className="text-sm text-muted-foreground">Enable public user sign-ups</div>
              </div>
              <button
                onClick={() => handleInputChange('allowUserRegistration', !settings?.allowUserRegistration)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${settings?.allowUserRegistration ? 'bg-success' : 'bg-muted'}
                `}
              >
                <div className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform
                  ${settings?.allowUserRegistration ? 'left-6' : 'left-0.5'}
                `} />
              </button>
            </div>

            {/* Require Email Verification */}
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Require Email Verification</div>
                <div className="text-sm text-muted-foreground">New users must verify their email</div>
              </div>
              <button
                onClick={() => handleInputChange('requireEmailVerification', !settings?.requireEmailVerification)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${settings?.requireEmailVerification ? 'bg-success' : 'bg-muted'}
                `}
              >
                <div className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform
                  ${settings?.requireEmailVerification ? 'left-6' : 'left-0.5'}
                `} />
              </button>
            </div>

            {/* Enable Analytics */}
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Enable Analytics</div>
                <div className="text-sm text-muted-foreground">Track usage and performance metrics</div>
              </div>
              <button
                onClick={() => handleInputChange('enableAnalytics', !settings?.enableAnalytics)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${settings?.enableAnalytics ? 'bg-success' : 'bg-muted'}
                `}
              >
                <div className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform
                  ${settings?.enableAnalytics ? 'left-6' : 'left-0.5'}
                `} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
            <Icon name="Database" size={20} className="text-error" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Data Management</h4>
            <p className="text-sm text-muted-foreground">Configure data retention and storage policies</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Data Retention */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              min="30"
              max="3650"
              value={settings?.dataRetentionDays}
              onChange={(e) => handleInputChange('dataRetentionDays', parseInt(e?.target?.value))}
              className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Inactive user data will be archived after this period
            </p>
          </div>

          {/* Max Upload Size */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Maximum Upload Size (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings?.maxUploadSize}
              onChange={(e) => handleInputChange('maxUploadSize', parseInt(e?.target?.value))}
              className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size for user uploads
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Legal */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
            <Icon name="Mail" size={20} className="text-success" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Contact & Legal</h4>
            <p className="text-sm text-muted-foreground">Support contact and legal document links</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Support Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={settings?.supportEmail}
              onChange={(e) => handleInputChange('supportEmail', e?.target?.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="support@ailearninghub.com"
            />
          </div>

          {/* Terms of Service URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Terms of Service URL
            </label>
            <input
              type="url"
              value={settings?.termsOfServiceUrl}
              onChange={(e) => handleInputChange('termsOfServiceUrl', e?.target?.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="https://example.com/terms"
            />
          </div>

          {/* Privacy Policy URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Privacy Policy URL
            </label>
            <input
              type="url"
              value={settings?.privacyPolicyUrl}
              onChange={(e) => handleInputChange('privacyPolicyUrl', e?.target?.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="https://example.com/privacy"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-gradient-to-r from-error/5 to-warning/5 rounded-xl border border-error/20 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Icon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Maintenance Mode</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Enable maintenance mode to prevent users from accessing the platform during updates or maintenance
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleInputChange('maintenanceMode', !settings?.maintenanceMode)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${settings?.maintenanceMode ? 'bg-error' : 'bg-muted'}
                  `}
                >
                  <div className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform
                    ${settings?.maintenanceMode ? 'left-6' : 'left-0.5'}
                  `} />
                </button>
                <span className={`text-sm font-medium ${settings?.maintenanceMode ? 'text-error' : 'text-muted-foreground'}`}>
                  {settings?.maintenanceMode ? 'Enabled - Platform is offline' : 'Disabled - Platform is online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button 
          variant="outline" 
          iconName="RotateCcw" 
          iconPosition="left"
          onClick={handleReset}
        >
          Reset to Defaults
        </Button>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              setHasChanges(false);
              // Reload settings from API
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;