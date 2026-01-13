import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const PreferencesPanel = ({ preferences, onSave }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = (category, key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localPreferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Learning Preferences</h2>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-8">
        {/* Learning Preferences */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="BookOpen" size={20} />
            Learning Preferences
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preferred Learning Style
              </label>
              <select
                value={localPreferences?.learning?.style}
                onChange={(e) => handlePreferenceChange('learning', 'style', e?.target?.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
                <option value="reading">Reading/Writing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Difficulty Preference
              </label>
              <select
                value={localPreferences?.learning?.difficulty}
                onChange={(e) => handlePreferenceChange('learning', 'difficulty', e?.target?.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="adaptive">Adaptive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Session Duration (minutes)
              </label>
              <Input
                type="number"
                value={localPreferences?.learning?.sessionDuration}
                onChange={(e) => handlePreferenceChange('learning', 'sessionDuration', parseInt(e?.target?.value))}
                min="15"
                max="180"
                step="15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Daily Goal (minutes)
              </label>
              <Input
                type="number"
                value={localPreferences?.learning?.dailyGoal}
                onChange={(e) => handlePreferenceChange('learning', 'dailyGoal', parseInt(e?.target?.value))}
                min="15"
                max="480"
                step="15"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localPreferences?.learning?.autoAdvance}
                onChange={(e) => handlePreferenceChange('learning', 'autoAdvance', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
              <span className="text-sm text-foreground">Auto-advance to next module upon completion</span>
            </label>
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive learning updates via email</div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences?.notifications?.email}
                onChange={(e) => handlePreferenceChange('notifications', 'email', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Push Notifications</div>
                <div className="text-sm text-muted-foreground">Browser notifications for reminders</div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences?.notifications?.push}
                onChange={(e) => handlePreferenceChange('notifications', 'push', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Achievement Notifications</div>
                <div className="text-sm text-muted-foreground">Celebrate achievements and milestones</div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences?.notifications?.achievements}
                onChange={(e) => handlePreferenceChange('notifications', 'achievements', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Weekly Progress Reports</div>
                <div className="text-sm text-muted-foreground">Summary of weekly learning activity</div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences?.notifications?.weeklyReport}
                onChange={(e) => handlePreferenceChange('notifications', 'weeklyReport', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
            </label>
          </div>
        </div>

        {/* Privacy & Data Preferences */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Shield" size={20} />
            Privacy & Data
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Share Progress with Team</div>
                <div className="text-sm text-muted-foreground">Allow team members to see your learning progress</div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences?.privacy?.shareProgress}
                onChange={(e) => handlePreferenceChange('privacy', 'shareProgress', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Include in Leaderboards</div>
                <div className="text-sm text-muted-foreground">Participate in company-wide leaderboards</div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences?.privacy?.leaderboards}
                onChange={(e) => handlePreferenceChange('privacy', 'leaderboards', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Analytics Data Collection</div>
                <div className="text-sm text-muted-foreground">Help improve the platform with usage analytics</div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences?.privacy?.analytics}
                onChange={(e) => handlePreferenceChange('privacy', 'analytics', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
            </label>
          </div>
        </div>

        {/* Interface Preferences */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Interface
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Theme Preference
              </label>
              <select
                value={localPreferences?.interface?.theme}
                onChange={(e) => handlePreferenceChange('interface', 'theme', e?.target?.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Language
              </label>
              <select
                value={localPreferences?.interface?.language}
                onChange={(e) => handlePreferenceChange('interface', 'language', e?.target?.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPanel;