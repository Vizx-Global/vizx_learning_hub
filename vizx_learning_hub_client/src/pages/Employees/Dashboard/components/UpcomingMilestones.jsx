import React from 'react';
import { Target, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const UpcomingMilestones = ({ lastAccessed }) => {
  // Mock milestones if not provided via API
  const milestones = [
    {
      id: 1,
      title: "Path Completion",
      description: `Finish "${lastAccessed?.path?.title || 'Current Path'}"`,
      progress: lastAccessed?.progress || 0,
      target: `${lastAccessed?.totalModules - lastAccessed?.completedModules} modules remaining`,
      reward: "1000 Points + Certificate",
      color: "bg-primary"
    },
    {
      id: 2,
      title: "Learning Streak",
      description: "Complete modules 3 days in a row",
      progress: 60,
      target: "1 day to go",
      reward: "Streak Badge + 200 Points",
      color: "bg-secondary"
    }
  ];

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-lg h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Target size={18} className="text-primary" />
          Upcoming Milestones
        </h3>
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
      </div>

      <div className="space-y-8">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-sm font-black text-foreground">
                  {milestone.title}
                </div>
                <div className="text-xs font-medium text-muted-foreground leading-relaxed">
                  {milestone.description}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-primary">
                  {Math.round(milestone.progress)}%
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  {milestone.target}
                </div>
              </div>
            </div>

            <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${milestone.progress}%` }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className={`h-full ${milestone.color} rounded-full`}
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-success/5 border border-success/10 rounded-xl">
               <Gift size={12} className="text-success" />
               <span className="text-[10px] font-black text-success uppercase tracking-widest">
                 REWARD: {milestone.reward}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMilestones;
