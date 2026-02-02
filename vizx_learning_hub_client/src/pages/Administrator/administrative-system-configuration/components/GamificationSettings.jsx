import React, { useState, useCallback, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import achievementService from '../../../../api/achievementService';
import Swal from 'sweetalert2';

// Constants
const INITIAL_SETTINGS = {
  enableGamification: true,
  moduleCompletionPoints: 100,
  pathCompletionPoints: 500,
  dailyStreakPoints: 50,
  quizPassPoints: 75,
  challengeWinPoints: 200,
  enableLeaderboards: true,
  leaderboardResetFrequency: 'weekly',
  enableLevels: true,
  pointsPerLevel: 1000,
  maxLevel: 50
};

const POINT_SETTINGS = [
  { key: 'moduleCompletionPoints', label: 'Module Completion', icon: 'BookOpen' },
  { key: 'pathCompletionPoints', label: 'Path Completion', icon: 'Target' },
  { key: 'dailyStreakPoints', label: 'Daily Streak', icon: 'Flame' },
  { key: 'quizPassPoints', label: 'Quiz Pass', icon: 'CheckCircle' },
  { key: 'challengeWinPoints', label: 'Challenge Win', icon: 'Trophy' }
];

// Custom Hook
const useGamification = () => {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await achievementService.getAllAchievements();
      setBadges(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAddBadge = useCallback(async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Achievement',
      html:
        '<input id="swal-title" class="swal2-input" placeholder="Title">' +
        '<input id="swal-description" class="swal2-input" placeholder="Description">' +
        '<input id="swal-points" type="number" class="swal2-input" placeholder="Points">',
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById('swal-title').value;
        const description = document.getElementById('swal-description').value;
        const points = parseInt(document.getElementById('swal-points').value);
        
        if (!title || !description || isNaN(points)) {
          Swal.showValidationMessage('Please fill in all fields correctly');
          return false;
        }

        return {
          title,
          description,
          points,
          type: 'MILESTONE',
          requirement: {}
        }
      }
    });

    if (formValues) {
      try {
        await achievementService.createAchievement(formValues);
        Swal.fire('Success', 'Achievement created successfully!', 'success');
        fetchAchievements();
      } catch (error) {
        Swal.fire('Error', 'Failed to create achievement', 'error');
      }
    }
  }, [fetchAchievements]);

  const handleToggleBadge = useCallback(async (badgeId, currentStatus) => {
    try {
      await achievementService.updateAchievement(badgeId, { isActive: !currentStatus });
      fetchAchievements();
    } catch (error) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  }, [fetchAchievements]);

  const handleDeleteBadge = useCallback(async (badgeId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Users who earned this will still keep it, but it won't be available to new users.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await achievementService.deleteAchievement(badgeId);
        Swal.fire('Deleted!', 'Achievement has been removed.', 'success');
        fetchAchievements();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete achievement', 'error');
      }
    }
  }, [fetchAchievements]);

  return {
    settings,
    badges,
    loading,
    handleSettingChange,
    handleAddBadge,
    handleToggleBadge,
    handleDeleteBadge
  };
};

// Sub-components
const GamificationHeader = () => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h3 className="text-2xl font-black text-foreground tracking-tight">Gamification Engine</h3>
      <p className="text-sm text-muted-foreground">
        Configure rewards, benchmarks, and progression logic
      </p>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, subtitle, iconColor = 'text-primary' }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`w-12 h-12 ${iconColor}/10 rounded-2xl flex items-center justify-center border border-${iconColor}/20`}>
      <Icon name={icon} size={22} className={iconColor} />
    </div>
    <div>
      <h4 className="font-bold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const ToggleSetting = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all">
    <div>
      <div className="font-bold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
        enabled ? 'bg-primary' : 'bg-muted'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${
        enabled ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  </div>
);

const PointsSystem = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
    <SectionHeader
      icon="Award"
      title="Point Allocation"
      subtitle="Define point rewards for behavioral triggers"
      iconColor="text-primary"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {POINT_SETTINGS.map((point) => (
        <div key={point.key} className="p-5 bg-accent/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name={point.icon} size={18} className="text-primary" />
            </div>
            <label className="text-sm font-bold text-foreground">{point.label}</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={settings[point.key]}
              onChange={(e) => onSettingChange(point.key, parseInt(e.target.value))}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">PTS</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BadgesManagement = ({ badges, loading, onAddBadge, onToggleBadge, onDeleteBadge }) => (
  <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
    <div className="flex items-center justify-between mb-8">
      <SectionHeader
        icon="Trophy"
        title="Achievements Catalog"
        subtitle="Manage earnable badges and career milestones"
        iconColor="text-warning"
      />
      <Button 
        variant="default" 
        className="rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary/90" 
        iconName="Plus" 
        iconPosition="left" 
        onClick={onAddBadge}
      >
        Create Achievement
      </Button>
    </div>

    {loading ? (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
      </div>
    ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <BadgeItem 
            key={badge.id} 
            badge={badge} 
            onToggle={() => onToggleBadge(badge.id, badge.isActive)} 
            onDelete={() => onDeleteBadge(badge.id)}
          />
        ))}
        {badges.length === 0 && (
          <div className="col-span-2 py-12 text-center border-2 border-dashed border-border rounded-3xl">
            <Icon name="Award" size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">No achievements defined yet.</p>
          </div>
        )}
      </div>
    )}
  </div>
);

const BadgeItem = ({ badge, onToggle, onDelete }) => (
  <div className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:shadow-md hover:border-warning/30 transition-all group">
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center border border-warning/10 transition-transform group-hover:scale-110">
        <Icon name={badge.icon || 'Award'} size={24} className="text-warning" />
      </div>
      <div>
        <div className="font-bold text-foreground text-lg tracking-tight">{badge.title || badge.name}</div>
        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">{badge.description}</div>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-warning/10 text-warning rounded-md text-[10px] font-black uppercase tracking-widest">
            {badge.points} XP
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
            {badge.type || 'Standard'}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-1">
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-all mx-2 ${
          badge.isActive ? 'bg-success' : 'bg-muted'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
          badge.isActive ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
      <button 
        className="p-3 hover:bg-error/10 hover:text-error rounded-xl transition-colors text-muted-foreground"
        onClick={onDelete}
      >
        <Icon name="Trash2" size={18} />
      </button>
    </div>
  </div>
);

// Main Component
const GamificationSettings = () => {
  const {
    settings,
    badges,
    loading,
    handleSettingChange,
    handleAddBadge,
    handleToggleBadge,
    handleDeleteBadge
  } = useGamification();

  return (
    <div className="space-y-10 pb-12">
      <GamificationHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PointsSystem 
          settings={settings} 
          onSettingChange={handleSettingChange} 
        />
        
        <div className="space-y-8">
          <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
            <SectionHeader
              icon="TrendingUp"
              title="Progression Logic"
              subtitle="Control how users advance through ranks"
              iconColor="text-success"
            />
            <div className="space-y-4">
              <ToggleSetting
                label="Level System"
                description="Enable XP-based user level progression"
                enabled={settings.enableLevels}
                onChange={() => handleSettingChange('enableLevels', !settings.enableLevels)}
              />
              <ToggleSetting
                label="Global Leaderboards"
                description="Enable competitive rankings across the company"
                enabled={settings.enableLeaderboards}
                onChange={() => handleSettingChange('enableLeaderboards', !settings.enableLeaderboards)}
              />
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
            <SectionHeader
              icon="Trophy"
              title="Rank Reset"
              subtitle="Schedule when competitive ranks are archived"
              iconColor="text-secondary"
            />
            <select
              value={settings.leaderboardResetFrequency}
              onChange={(e) => handleSettingChange('leaderboardResetFrequency', e.target.value)}
              className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold"
            >
              <option value="never">Never Reset</option>
              <option value="weekly">Weekly Reset</option>
              <option value="monthly">Monthly Reset</option>
              <option value="quarterly">Quarterly Reset</option>
            </select>
          </div>
        </div>
      </div>
      
      <BadgesManagement 
        badges={badges}
        loading={loading}
        onAddBadge={handleAddBadge}
        onToggleBadge={handleToggleBadge}
        onDeleteBadge={handleDeleteBadge}
      />
    </div>
  );
};

export default GamificationSettings;