import React, { useState, useCallback } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

// Constants and Types
const SECURITY_SETTINGS_INITIAL = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  passwordExpiryDays: 90,
  enable2FA: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  enableSSO: false,
  ssoProvider: 'azure'
};

const API_KEYS_INITIAL = [
  {
    id: 1,
    name: 'Production API Key',
    key: 'pk_live_••••••••••••••••',
    createdDate: '2024-01-15',
    lastUsed: new Date(Date.now() - 3600000),
    status: 'active'
  },
  {
    id: 2,
    name: 'Development API Key',
    key: 'pk_test_••••••••••••••••',
    createdDate: '2024-03-20',
    lastUsed: new Date(Date.now() - 86400000),
    status: 'active'
  }
];

const PASSWORD_POLICIES = [
  { key: 'passwordRequireUppercase', label: 'Require Uppercase Letters' },
  { key: 'passwordRequireLowercase', label: 'Require Lowercase Letters' },
  { key: 'passwordRequireNumbers', label: 'Require Numbers' },
  { key: 'passwordRequireSpecialChars', label: 'Require Special Characters' }
];

// Custom Hook
const useSecuritySettings = () => {
  const [settings, setSettings] = useState(SECURITY_SETTINGS_INITIAL);
  const [apiKeys, setApiKeys] = useState(API_KEYS_INITIAL);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApiKeyAction = useCallback((action, apiKeyId) => {
    if (action === 'revoke') {
      setApiKeys(prev => prev.map(key => 
        key.id === apiKeyId ? { ...key, status: 'revoked' } : key
      ));
    } else if (action === 'regenerate') {
      setApiKeys(prev => prev.map(key => 
        key.id === apiKeyId ? { 
          ...key, 
          key: `pk_${key.status === 'active' ? 'live' : 'test'}_••••••••••••••••`,
          lastUsed: new Date()
        } : key
      ));
    }
  }, []);

  const handleCreateApiKey = useCallback((name, type = 'test') => {
    const newApiKey = {
      id: Date.now(),
      name,
      key: `pk_${type}_••••••••••••••••`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: new Date(),
      status: 'active'
    };
    setApiKeys(prev => [...prev, newApiKey]);
  }, []);

  return {
    settings,
    apiKeys,
    handleSettingChange,
    handleApiKeyAction,
    handleCreateApiKey
  };
};

// Sub-components
const SecurityHeader = () => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
    <p className="text-sm text-muted-foreground">
      Configure authentication and security policies
    </p>
  </div>
);

const SectionHeader = ({ icon, title, subtitle, iconColor = 'text-primary' }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`w-10 h-10 ${iconColor}/10 rounded-full flex items-center justify-center`}>
      <Icon name={icon} size={20} className={iconColor} />
    </div>
    <div>
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const ToggleSwitch = ({ enabled, onChange, label }) => (
  <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
    <span className="text-sm font-medium text-foreground">{label}</span>
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-success' : 'bg-muted'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
        enabled ? 'left-6' : 'left-0.5'
      }`} />
    </button>
  </div>
);

const NumberInput = ({ label, value, onChange, min, max, helperText, className = '' }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      {label}
    </label>
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className={`px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${className}`}
    />
    {helperText && (
      <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
    )}
  </div>
);

const PasswordPolicySection = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Lock"
      title="Password Policy"
      subtitle="Configure password requirements"
      iconColor="text-error"
    />

    <div className="space-y-4">
      <NumberInput
        label="Minimum Password Length"
        value={settings.passwordMinLength}
        onChange={(e) => onSettingChange('passwordMinLength', parseInt(e.target.value))}
        min="6"
        max="32"
        className="w-full md:w-48"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PASSWORD_POLICIES.map((policy) => (
          <ToggleSwitch
            key={policy.key}
            enabled={settings[policy.key]}
            onChange={() => onSettingChange(policy.key, !settings[policy.key])}
            label={policy.label}
          />
        ))}
      </div>

      <NumberInput
        label="Password Expiry (days)"
        value={settings.passwordExpiryDays}
        onChange={(e) => onSettingChange('passwordExpiryDays', parseInt(e.target.value))}
        min="0"
        max="365"
        helperText="Set to 0 for no expiry"
        className="w-full md:w-48"
      />
    </div>
  </div>
);

const TwoFactorAuthSection = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
          <Icon name="Shield" size={20} className="text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Two-Factor Authentication</h4>
          <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
        </div>
      </div>
      <ToggleSwitch
        enabled={settings.enable2FA}
        onChange={() => onSettingChange('enable2FA', !settings.enable2FA)}
      />
    </div>
    {settings.enable2FA && (
      <div className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-success">
          <Icon name="CheckCircle" size={16} />
          <span>2FA is enabled for all user accounts</span>
        </div>
      </div>
    )}
  </div>
);

const SessionSecuritySection = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Clock"
      title="Session & Login Security"
      subtitle="Configure session and login attempt limits"
      iconColor="text-primary"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NumberInput
        label="Session Timeout (minutes)"
        value={settings.sessionTimeout}
        onChange={(e) => onSettingChange('sessionTimeout', parseInt(e.target.value))}
        min="5"
        max="480"
      />
      
      <NumberInput
        label="Max Login Attempts"
        value={settings.maxLoginAttempts}
        onChange={(e) => onSettingChange('maxLoginAttempts', parseInt(e.target.value))}
        min="1"
        max="10"
      />
      
      <NumberInput
        label="Lockout Duration (minutes)"
        value={settings.lockoutDuration}
        onChange={(e) => onSettingChange('lockoutDuration', parseInt(e.target.value))}
        min="1"
        max="1440"
      />
    </div>
  </div>
);

const SSOSection = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
          <Icon name="Key" size={20} className="text-secondary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Single Sign-On (SSO)</h4>
          <p className="text-sm text-muted-foreground">Configure enterprise authentication</p>
        </div>
      </div>
      <ToggleSwitch
        enabled={settings.enableSSO}
        onChange={() => onSettingChange('enableSSO', !settings.enableSSO)}
      />
    </div>
    
    {settings.enableSSO && (
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            SSO Provider
          </label>
          <select
            value={settings.ssoProvider}
            onChange={(e) => onSettingChange('ssoProvider', e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="azure">Azure Active Directory</option>
            <option value="okta">Okta</option>
            <option value="google">Google Workspace</option>
            <option value="custom">Custom SAML</option>
          </select>
        </div>
        
        <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-warning">
            <Icon name="AlertTriangle" size={16} />
            <span>SSO configuration requires additional setup</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

const ApiKeysSection = ({ apiKeys, onApiKeyAction, onCreateApiKey }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          icon="Key"
          title="API Keys"
          subtitle="Manage application API keys"
          iconColor="text-success"
        />
        <Button 
          variant="default" 
          size="sm" 
          iconName="Plus"
          onClick={() => setShowCreateModal(true)}
        >
          Create API Key
        </Button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <ApiKeyItem 
            key={apiKey.id} 
            apiKey={apiKey} 
            onAction={onApiKeyAction} 
          />
        ))}
      </div>
    </div>
  );
};

const ApiKeyItem = ({ apiKey, onAction }) => (
  <div className="p-4 bg-accent/30 rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="font-medium text-foreground">{apiKey.name}</div>
        <div className="text-sm font-mono text-muted-foreground">{apiKey.key}</div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        apiKey.status === 'active' 
          ? 'bg-success/10 text-success' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {apiKey.status}
      </span>
    </div>
    
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>Created: {apiKey.createdDate}</span>
        <span>Last used: {apiKey.lastUsed.toLocaleDateString()}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onAction('regenerate', apiKey.id)}
        >
          Regenerate
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAction('revoke', apiKey.id)}
        >
          Revoke
        </Button>
      </div>
    </div>
  </div>
);

// Main Component
const SecuritySettings = () => {
  const {
    settings,
    apiKeys,
    handleSettingChange,
    handleApiKeyAction,
    handleCreateApiKey
  } = useSecuritySettings();

  return (
    <div className="space-y-6">
      <SecurityHeader />
      
      <PasswordPolicySection 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <TwoFactorAuthSection 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <SessionSecuritySection 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <SSOSection 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <ApiKeysSection 
        apiKeys={apiKeys}
        onApiKeyAction={handleApiKeyAction}
        onCreateApiKey={handleCreateApiKey}
      />
    </div>
  );
};

export default SecuritySettings;