import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  Lock, 
  CheckCircle,
  TrendingUp,
  Star,
  Award,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../../utils/cn';

const LearningPathCard = ({ path, isEnrolled, currentEnrollment, onEnroll, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  
  const activePathId = currentEnrollment?.learningPathId || currentEnrollment?.path?.id;
  const canEnroll = !currentEnrollment || activePathId === path.id;
  const isCurrentPath = activePathId === path.id;

  const handleCardClick = () => {
    navigate(`/employee-learning-paths/${path.id}`);
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    if (!canEnroll && !isEnrolled) {
      const currentTitle = currentEnrollment?.path?.title || 'your current path';
      alert(`Please complete ${currentTitle} before enrolling in a new one.`);
      return;
    }
    onEnroll();
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-600';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-600';
      case 'advanced': return 'bg-red-500/10 text-red-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Technical': return 'bg-blue-500/10 text-blue-600';
      case 'Soft Skills': return 'bg-purple-500/10 text-purple-600';
      case 'Data': return 'bg-cyan-500/10 text-cyan-600';
      case 'Cloud': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex",
        viewMode === 'grid' ? "flex-col" : "flex-row",
        isEnrolled && "border-primary/30"
      )}
      onClick={handleCardClick}
    >
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
           <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm",
                getDifficultyColor(path.difficulty)
              )}>
                {path.difficulty}
              </span>
              <span className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter",
                getCategoryColor(path.category)
              )}>
                {path.category}
              </span>
           </div>
           
           {isEnrolled && (
             <span className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full ring-1 ring-primary/20">
                <CheckCircle className="h-3 w-3" />
                Enrolled
             </span>
           )}
        </div>

        <h3 className="font-black text-lg mb-2 tracking-tight group-hover:text-primary transition-colors">
          {path.title}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-6 line-clamp-2 leading-relaxed opacity-80">
          {path.description}
        </p>

        <div className="mt-auto flex flex-row items-center justify-between gap-4">
          {/* Progress Section */}
          <div className="flex-1 min-w-[120px]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter">Progress</p>
              <span className="text-[10px] font-black text-primary">{path.completionRate}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: path.completionRate }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (isEnrolled) {
                navigate('/employee-courses', { state: { learningPathId: path.id } });
              } else {
                handleEnrollClick(e);
              }
            }}
            disabled={!canEnroll && !isEnrolled}
            className={cn(
              "h-10 w-fit rounded-xl font-black text-[10px] uppercase tracking-widest transition-all px-6 shrink-0",
              isEnrolled
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : canEnroll
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            )}
          >
            {isEnrolled ? (
              <span className="flex items-center gap-2">
                Continue Training <ChevronRight className="h-4 w-4" />
              </span>
            ) : canEnroll ? (
              'Start Learning Path'
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Locked
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningPathCard;