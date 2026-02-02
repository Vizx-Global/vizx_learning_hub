import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Flame, Award, Copy, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

const NotificationTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      id: 1,
      name: 'Course Completion Reminder',
      category: 'Engagement',
      description: 'Encourage learners to complete their in-progress courses',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      uses: 342
    },
    {
      id: 2,
      name: 'New Learning Path Available',
      category: 'Announcement',
      description: 'Notify users about new learning opportunities',
      icon: Sparkles,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      uses: 189
    },
    {
      id: 3,
      name: 'Streak Maintenance',
      category: 'Motivation',
      description: 'Remind learners to maintain their learning streaks',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      uses: 521
    },
    {
      id: 4,
      name: 'Achievement Unlocked',
      category: 'Recognition',
      description: 'Celebrate learner milestones and achievements',
      icon: Award,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      uses: 287
    }
  ];

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Copy className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Notification Templates</h3>
            <p className="text-sm text-muted-foreground">Quick-start messages for common scenarios</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase tracking-wider text-xs border-primary/20 text-primary">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative border border-border rounded-[2rem] p-5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${template.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                <template.icon className={template.color} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {template.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <TrendingUp size={10} /> Used {template.uses} times
                  </span>
                </div>
                <div className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{template.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{template.description}</div>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="text-primary" size={18} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const TrendingUp = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);

export default NotificationTemplates;