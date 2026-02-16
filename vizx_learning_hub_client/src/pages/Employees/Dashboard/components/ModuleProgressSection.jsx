import React, { useState, useEffect } from 'react';
import { Check, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import moduleProgressService from '../../../../api/moduleProgressService';

const ModuleProgressSection = ({ lastAccessed }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      if (lastAccessed?.enrollmentId) {
        setLoading(true);
        try {
          const res = await moduleProgressService.getProgressSummary(lastAccessed.enrollmentId);
          if (res.data?.success) {
            setModules(res.data.data.modules || []);
          }
        } catch (err) {
          console.error("Failed to fetch module progress", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchModules();
  }, [lastAccessed?.enrollmentId]);

  if (!lastAccessed) return null;

  const progressPercentage = Math.round(lastAccessed.progress || 0);

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-lg space-y-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-foreground mb-2">
            {lastAccessed.path?.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {lastAccessed.path?.description}
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1 text-primary">
              <Clock size={14} />
              <span>{lastAccessed.path?.estimatedTime || 'Self-paced'}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen size={14} />
              <span>{lastAccessed.totalModules} modules</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-primary mb-1">
            {progressPercentage}%
          </div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {lastAccessed.completedModules}/{lastAccessed.totalModules} completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden border border-border">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full bg-primary rounded-full relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-30"></div>
        </motion.div>
      </div>

      {/* Module List */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
          Module Progress
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.slice(0, 8).map((module, index) => {
            const isCompleted = module.progress?.status === 'COMPLETED' || module.progress?.progress === 100;
            const isCurrent = !isCompleted && (index === 0 || (modules[index-1]?.progress?.status === 'COMPLETED'));
            
            return (
              <div 
                key={module.id} 
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/20' 
                    : isCurrent 
                      ? 'bg-card border-primary shadow-lg shadow-primary/5 scale-[1.02]' 
                      : 'bg-muted/30 border-transparent opacity-60'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                  ${isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-primary/20 text-primary animate-pulse border border-primary/30'
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                    {module.title}
                  </div>
                  {isCompleted && (
                    <div className="text-[10px] font-bold text-primary/70 uppercase tracking-tighter">
                      Completed
                    </div>
                  )}
                  {isCurrent && (
                    <div className="text-[10px] font-bold text-primary uppercase tracking-tighter flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-primary animate-ping"></div>
                      In Progress
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <ArrowRight size={16} className="text-primary hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleProgressSection;
