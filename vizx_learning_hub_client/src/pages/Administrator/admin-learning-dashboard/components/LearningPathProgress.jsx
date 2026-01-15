import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const LearningPathProgress = ({ userRole = 'employee' }) => {
  const [currentPath, setCurrentPath] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const learningPaths = [
    {
      id: 1,
      title: "AI Fundamentals for Business",
      description: "Essential AI concepts for business professionals",
      totalModules: 8,
      completedModules: 5,
      estimatedTime: "12 hours",
      difficulty: "Beginner",
      category: "Foundation",
      modules: [
        { id: 1, title: "Introduction to AI", completed: true, timeSpent: 45 },
        { id: 2, title: "Machine Learning Basics", completed: true, timeSpent: 60 },
        { id: 3, title: "AI in Business Context", completed: true, timeSpent: 55 },
        { id: 4, title: "Data and AI Ethics", completed: true, timeSpent: 40 },
        { id: 5, title: "AI Tools Overview", completed: true, timeSpent: 50 },
        { id: 6, title: "Implementing AI Solutions", completed: false, timeSpent: 0 },
        { id: 7, title: "AI Project Management", completed: false, timeSpent: 0 },
        { id: 8, title: "Future of AI in Business", completed: false, timeSpent: 0 }
      ]
    }
  ];

  const userAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Completed your first AI module",
      icon: "Award",
      earned: true,
      earnedDate: "2025-09-28"
    },
    {
      id: 2,
      title: "Streak Master",
      description: "7-day learning streak",
      icon: "Flame",
      earned: true,
      earnedDate: "2025-10-01"
    },
    {
      id: 3,
      title: "Knowledge Seeker",
      description: "Complete 5 modules in a path",
      icon: "BookOpen",
      earned: true,
      earnedDate: "2025-10-05"
    },
    {
      id: 4,
      title: "AI Expert",
      description: "Complete an entire learning path",
      icon: "Trophy",
      earned: false,
      earnedDate: null
    }
  ];

  const upcomingMilestones = [
    {
      id: 1,
      title: "Path Completion",
      description: "Complete AI Fundamentals path",
      progress: 62.5,
      target: "3 modules remaining",
      reward: "500 points + Certificate"
    },
    {
      id: 2,
      title: "Monthly Goal",
      description: "Complete 10 modules this month",
      progress: 80,
      target: "2 modules remaining",
      reward: "300 points + Badge"
    }
  ];

  useEffect(() => {
    setCurrentPath(learningPaths?.[0]);
    setAchievements(userAchievements);
    setMilestones(upcomingMilestones);
  }, []);

  const getProgressPercentage = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-success bg-success/10';
      case 'intermediate': return 'text-warning bg-warning/10';
      case 'advanced': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (!currentPath) return null;

  const progressPercentage = getProgressPercentage(currentPath?.completedModules, currentPath?.totalModules);

  return (
    <div className="space-y-6">
      {/* Current Learning Path */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {currentPath?.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {currentPath?.description}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(currentPath?.difficulty)}`}>
                {currentPath?.difficulty}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Icon name="Clock" size={14} />
                <span>{currentPath?.estimatedTime}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Icon name="BookOpen" size={14} />
                <span>{currentPath?.totalModules} modules</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1">
              {progressPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {currentPath?.completedModules}/{currentPath?.totalModules} completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground mb-3">Module Progress</h4>
          {currentPath?.modules?.slice(0, 6)?.map((module, index) => (
            <div key={module.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${module.completed 
                  ? 'bg-success text-success-foreground' 
                  : index === currentPath?.completedModules 
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {module.completed ? (
                  <Icon name="Check" size={14} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {module.title}
                </div>
                {module.completed && module.timeSpent > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Completed in {module.timeSpent} minutes
                  </div>
                )}
              </div>
              {index === currentPath?.completedModules && !module.completed && (
                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  Next
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Achievements */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-foreground">Recent Achievements</h3>
          <Icon name="Award" size={20} className="text-warning" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements?.filter(a => a?.earned)?.slice(0, 4)?.map((achievement) => (
            <div key={achievement?.id} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name={achievement?.icon} size={20} className="text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {achievement?.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(achievement.earnedDate)?.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Upcoming Milestones */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-foreground">Upcoming Milestones</h3>
          <Icon name="Target" size={20} className="text-primary" />
        </div>
        <div className="space-y-4">
          {milestones?.map((milestone) => (
            <div key={milestone?.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {milestone?.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {milestone?.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">
                    {milestone?.progress}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {milestone?.target}
                  </div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                  style={{ width: `${milestone?.progress}%` }}
                />
              </div>
              <div className="text-xs text-success font-medium">
                🎁 {milestone?.reward}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPathProgress;