import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ lastAccessed }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(2);
  const [syncStatus, setSyncStatus] = useState('connected');

  const handleResume = () => {
    if (lastAccessed) {
      navigate('/employee-courses', { 
        state: { 
          moduleId: lastAccessed.module?.id, 
          learningPathId: lastAccessed.path?.id 
        } 
      });
    } else {
      navigate('/employee-courses');
    }
  };

  const quickActions = [
    {
      id: 'continue-learning',
      title: 'Continue Learning',
      description: lastAccessed ? `Resume ${lastAccessed.path?.title}` : 'Jump back into your courses',
      icon: 'Play',
      color: 'bg-primary text-primary-foreground',
      action: handleResume,
      shortcut: 'Space'
    },
    {
      id: 'my-library',
      title: 'My Library',
      description: 'Browse all enrolled courses',
      icon: 'BookOpen',
      color: 'bg-secondary text-secondary-foreground',
      action: () => navigate('/employee-courses'),
      shortcut: 'B'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'Check your global ranking',
      icon: 'Trophy',
      color: 'bg-success text-success-foreground',
      action: () => navigate('/employee-leaderboards'),
      shortcut: 'L'
    },
    {
      id: 'team-chat',
      title: 'Team Chat',
      description: 'Connect with your peers',
      icon: 'Users',
      color: 'bg-amber-500 text-white',
      action: () => navigate('/employee-chat'),
      shortcut: 'C'
    }
  ];

  const handleKeyPress = (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    const key = e.key.toLowerCase();
    const action = quickActions.find(a => a.shortcut.toLowerCase() === key);
    
    if (action) {
      e.preventDefault();
      action.action();
    } else if (e.code === 'Space' && quickActions[0].shortcut === 'Space') {
      e.preventDefault();
      quickActions[0].action();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [lastAccessed]);

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-foreground">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Jump back into your learning journey</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`
                relative p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                ${action.color} group text-left overflow-hidden
              `}
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon name={action.icon} size={80} />
              </div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Icon name={action.icon} size={20} className="stroke-[2.5]" />
                </div>
                {action.shortcut && (
                  <span className="bg-white/20 text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest backdrop-blur-sm">
                    {action.shortcut}
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <h4 className="font-black text-sm mb-1 uppercase tracking-tight">{action.title}</h4>
                <p className="text-xs opacity-90 line-clamp-1 font-medium">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Streak Reminder */}
      <div className="bg-gradient-to-r from-warning/10 via-warning/5 to-card rounded-2xl border border-warning/20 p-4 shadow-md group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center text-warning shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-warning/5 border border-warning/20">
            <Icon name="Flame" size={24} className="fill-warning/20" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-sm text-foreground uppercase tracking-tight">
              Protect your streak! 🔥
            </h4>
            <p className="text-xs text-muted-foreground font-medium line-clamp-1">
              You're on a 7-day learning spree. Keep the heat going today!
            </p>
          </div>
          <Button
            variant="warning"
            size="sm"
            iconName="Play"
            iconPosition="left"
            className="font-black text-[10px] uppercase tracking-widest hidden sm:flex h-9 shadow-lg shadow-warning/20"
            onClick={handleResume}
          >
            Keep Streaking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
