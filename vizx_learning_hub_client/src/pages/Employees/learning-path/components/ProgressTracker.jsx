import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  Award,
  Calendar,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Progress } from '../../../../components/ui/Progress';
import { Button } from '../../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const ProgressTracker = ({ enrollment, className = '' }) => {
  const navigate = useNavigate();
  const { path, progress } = enrollment;
  
  const completionPercentage = Math.round(
    (progress.completedModules.length / path.totalModules) * 100
  );
  
  const modulesLeft = path.totalModules - progress.completedModules.length;
  const estimatedDaysLeft = Math.ceil(modulesLeft * 2); // Assuming 2 days per module
  
  const currentModule = path.modules.find(m => m.id === progress.currentModule) || path.modules[0];

  return (
    <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Current Learning Path</h3>
          <p className="text-muted-foreground">You're enrolled in <span className="font-semibold text-primary">{path.title}</span></p>
        </div>
        <Button
          onClick={() => navigate(`/employee-learning-paths/${path.id}`)}
          className="gap-2"
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Progress</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{completionPercentage}%</span>
            <span className="text-sm text-muted-foreground">
              ({progress.completedModules.length}/{path.totalModules} modules)
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-warning" />
            <span className="text-sm text-muted-foreground">Points Earned</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{progress.totalPointsEarned}</span>
            <span className="text-sm text-muted-foreground">/ {path.pointsReward}</span>
          </div>
          <div className="text-sm">
            <span className="text-success">+{progress.totalPointsEarned / path.totalModules} avg per module</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Time Left</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{estimatedDaysLeft}</span>
            <span className="text-sm text-muted-foreground">days estimated</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">{modulesLeft} modules remaining</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">Current Module</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold truncate">{currentModule?.title}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Module {currentModule?.order} of {path.totalModules}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Started on</p>
            <p className="font-medium">{new Date(progress.startedDate).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/employee-learning-paths/${path.id}/modules/${currentModule?.id}`)}
          >
            Continue Learning
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate(`/employee-learning-paths/${path.id}/modules`)}
            className="text-primary"
          >
            View All Modules
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;