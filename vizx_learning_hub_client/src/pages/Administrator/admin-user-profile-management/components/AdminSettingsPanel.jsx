import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';

const AdminSettingsPanel = ({ user, onUpdate, userRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    learningGoals: user?.adminSettings?.learningGoals || {
      monthlyModules: 4,
      weeklyHours: 8,
      skillTargets: []
    },
    restrictions: user?.adminSettings?.restrictions || {
      maxDailyHours: 8,
      allowedCategories: [],
      blockedContent: []
    },
    customAchievements: user?.adminSettings?.customAchievements || [],
    notes: user?.adminSettings?.notes || ''
  });

  const handleSave = () => {
    onUpdate({ ...user, adminSettings });
    setIsEditing(false);
  };

  const addCustomAchievement = () => {
    const newAchievement = {
      id: Date.now(),
      title: 'Custom Achievement',
      description: 'Custom achievement description',
      points: 100,
      type: 'custom',
      awarded: false,
      awardedDate: null
    };
    setAdminSettings(prev => ({
      ...prev,
      customAchievements: [...prev?.customAchievements, newAchievement]
    }));
  };

  const removeCustomAchievement = (id) => {
    setAdminSettings(prev => ({
      ...prev,
      customAchievements: prev?.customAchievements?.filter(a => a?.id !== id)
    }));
  };

  const awardAchievement = (id) => {
    setAdminSettings(prev => ({
      ...prev,
      customAchievements: prev?.customAchievements?.map(a =>
        a?.id === id ? { ...a, awarded: true, awardedDate: new Date()?.toISOString()?.split('T')?.[0] } : a
      )
    }));
  };

  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center py-8">
          <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">You don't have permission to view administrative settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Administrative Settings</h2>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Icon name="Edit2" size={16} className="mr-2" />
              Edit Settings
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-8">
        {/* Learning Goals */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Target" size={20} />
            Learning Goals
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Monthly Module Target
              </label>
              <Input
                type="number"
                value={adminSettings?.learningGoals?.monthlyModules}
                onChange={(e) => setAdminSettings(prev => ({
                  ...prev,
                  learningGoals: { ...prev?.learningGoals, monthlyModules: parseInt(e?.target?.value) }
                }))}
                disabled={!isEditing}
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Weekly Hours Target
              </label>
              <Input
                type="number"
                value={adminSettings?.learningGoals?.weeklyHours}
                onChange={(e) => setAdminSettings(prev => ({
                  ...prev,
                  learningGoals: { ...prev?.learningGoals, weeklyHours: parseInt(e?.target?.value) }
                }))}
                disabled={!isEditing}
                min="1"
                max="40"
              />
            </div>
          </div>
        </div>

        {/* Access Restrictions */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Shield" size={20} />
            Access Restrictions
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Maximum Daily Learning Hours
              </label>
              <Input
                type="number"
                value={adminSettings?.restrictions?.maxDailyHours}
                onChange={(e) => setAdminSettings(prev => ({
                  ...prev,
                  restrictions: { ...prev?.restrictions, maxDailyHours: parseInt(e?.target?.value) }
                }))}
                disabled={!isEditing}
                min="1"
                max="12"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Allowed Categories
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['AI Fundamentals', 'Machine Learning', 'Data Science', 'Cloud Computing', 'Programming']?.map(category => (
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adminSettings?.restrictions?.allowedCategories?.includes(category)}
                        onChange={(e) => {
                          const categories = e?.target?.checked
                            ? [...adminSettings?.restrictions?.allowedCategories, category]
                            : adminSettings?.restrictions?.allowedCategories?.filter(c => c !== category);
                          setAdminSettings(prev => ({
                            ...prev,
                            restrictions: { ...prev?.restrictions, allowedCategories: categories }
                          }));
                        }}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content Restrictions
                </label>
                <div className="space-y-2">
                  {['Advanced Topics', 'Beta Content', 'External Links']?.map(restriction => (
                    <label key={restriction} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adminSettings?.restrictions?.blockedContent?.includes(restriction)}
                        onChange={(e) => {
                          const blocked = e?.target?.checked
                            ? [...adminSettings?.restrictions?.blockedContent, restriction]
                            : adminSettings?.restrictions?.blockedContent?.filter(b => b !== restriction);
                          setAdminSettings(prev => ({
                            ...prev,
                            restrictions: { ...prev?.restrictions, blockedContent: blocked }
                          }));
                        }}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Icon name="Award" size={20} />
              Custom Achievements
            </h3>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={addCustomAchievement}>
                <Icon name="Plus" size={16} className="mr-2" />
                Add Achievement
              </Button>
            )}
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {adminSettings?.customAchievements?.map((achievement) => (
              <div key={achievement?.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${achievement?.awarded ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}
                `}>
                  <Icon name="Award" size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{achievement?.title}</div>
                  <div className="text-sm text-muted-foreground">{achievement?.description}</div>
                  <div className="text-xs text-muted-foreground">+{achievement?.points} points</div>
                </div>
                <div className="flex items-center gap-2">
                  {!achievement?.awarded && isEditing && (
                    <Button variant="outline" size="sm" onClick={() => awardAchievement(achievement?.id)}>
                      Award
                    </Button>
                  )}
                  {achievement?.awarded && (
                    <span className="text-xs text-success">Awarded {achievement?.awardedDate}</span>
                  )}
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => removeCustomAchievement(achievement?.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {adminSettings?.customAchievements?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Award" size={32} className="mx-auto mb-2 opacity-50" />
                <p>No custom achievements created</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Administrative Notes
          </h3>
          <textarea
            value={adminSettings?.notes}
            onChange={(e) => setAdminSettings(prev => ({ ...prev, notes: e?.target?.value }))}
            disabled={!isEditing}
            placeholder="Add notes about this user's learning progress, special considerations, or administrative actions..."
            className="w-full h-32 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Action History */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="History" size={20} />
            Recent Administrative Actions
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[
              { action: 'Learning goal updated', admin: 'Sarah Johnson', date: '2025-10-05', time: '14:30' },
              { action: 'Custom achievement awarded', admin: 'Mike Chen', date: '2025-10-03', time: '09:15' },
              { action: 'Access restrictions modified', admin: 'Sarah Johnson', date: '2025-10-01', time: '16:45' }
            ]?.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{entry?.action}</div>
                  <div className="text-sm text-muted-foreground">by {entry?.admin}</div>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div>{entry?.date}</div>
                  <div>{entry?.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPanel;