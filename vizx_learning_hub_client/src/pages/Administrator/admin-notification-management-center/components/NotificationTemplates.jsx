import React from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const NotificationTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      id: 1,
      name: 'Course Completion Reminder',
      category: 'Engagement',
      description: 'Encourage learners to complete their in-progress courses',
      icon: 'Target',
      uses: 342
    },
    {
      id: 2,
      name: 'New Learning Path Available',
      category: 'Announcement',
      description: 'Notify users about new learning opportunities',
      icon: 'Sparkles',
      uses: 189
    },
    {
      id: 3,
      name: 'Streak Maintenance',
      category: 'Motivation',
      description: 'Remind learners to maintain their learning streaks',
      icon: 'Flame',
      uses: 521
    },
    {
      id: 4,
      name: 'Achievement Unlocked',
      category: 'Recognition',
      description: 'Celebrate learner milestones and achievements',
      icon: 'Award',
      uses: 287
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="Copy" size={24} className="text-primary" />
          <h3 className="text-xl font-bold text-foreground">Notification Templates</h3>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border border-border rounded-lg p-4 hover:border-primary hover:bg-accent/50 transition-all cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={template.icon} size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground mb-1">{template.name}</div>
                <div className="text-xs text-muted-foreground mb-2">{template.description}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                    {template.category}
                  </span>
                  <span className="text-muted-foreground">Used {template.uses} times</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationTemplates;