import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { learningPathService } from '../../../../api';

const LearningPathProgress = () => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredPath, setFeaturedPath] = useState(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setLoading(true);
        const response = await learningPathService.getAllLearningPaths();
        const pathData = response.data.data.learningPaths || [];
        setPaths(pathData);
        if (pathData.length > 0) {
          setFeaturedPath(pathData[0]);
        }
      } catch (error) {
        console.error("Error fetching paths:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-emerald-500 bg-emerald-500/10';
      case 'intermediate': return 'text-amber-500 bg-amber-500/10';
      case 'advanced': return 'text-rose-500 bg-rose-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#000000] rounded-[2rem] border border-border/50 p-8 shadow-sm animate-pulse">
        <div className="h-6 w-1/3 bg-muted rounded mb-4" />
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded mb-8" />
        <div className="h-2 w-full bg-muted rounded-full" />
      </div>
    );
  }

  if (!featuredPath) {
    return (
      <div className="bg-[#000000] rounded-[2rem] border border-border/50 p-12 shadow-sm text-center flex flex-col items-center gap-4">
        <Icon name="Layout" size={48} className="text-muted-foreground opacity-20" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Curriculum Published</p>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] rounded-[2rem] border border-border/50 p-8 shadow-sm group hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getDifficultyColor(featuredPath.difficulty)}`}>
              {featuredPath.difficulty}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{featuredPath.categoryRef?.name || 'Technical'}</span>
          </div>
          <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
            {featuredPath.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {featuredPath.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs">
            <Icon name="Clock" size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Duration</p>
            <p className="text-sm font-black">{featuredPath.estimatedHours}h Total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-xs">
            <Icon name="BookOpen" size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Curriculum</p>
            <p className="text-sm font-black">{featuredPath.modules?.length || 0} Modules</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Department Adoption</h4>
          <span className="text-sm font-black text-primary">84%</span>
        </div>
        <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
            style={{ width: '84%' }}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold shadow-sm">
              U{i}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-card bg-primary text-white flex items-center justify-center text-[8px] font-bold shadow-sm">
            +12
          </div>
        </div>
        <button className="text-xs font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform flex items-center gap-2">
          Manage Path <Icon name="ArrowRight" size={14} />
        </button>
      </div>
    </div>
  );
};

export default LearningPathProgress;
