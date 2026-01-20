// src/components/employee/learning-path/StreakTracker.jsx
import React from 'react';
import { Flame, TrendingUp, Target, Users, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const StreakTracker = ({ streak, totalPoints, rank, departmentRank }) => {
  const getStreakMessage = () => {
    if (streak === 0) return "Start your learning journey today!";
    if (streak < 3) return "Keep going! You're building momentum.";
    if (streak < 7) return "Great consistency! You're on fire!";
    if (streak < 14) return "Incredible dedication! You're unstoppable!";
    return "Legendary streak! You're an inspiration!";
  };

  const getFlameSize = () => {
    if (streak < 3) return "text-lg";
    if (streak < 7) return "text-xl";
    if (streak < 14) return "text-2xl";
    return "text-3xl";
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Learning Streak & Stats</h3>
          <p className="text-sm text-muted-foreground">{getStreakMessage()}</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <div className={`${getFlameSize()} text-warning animate-pulse`}>
            🔥
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-warning text-white text-xs flex items-center justify-center font-bold">
            {streak}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-background/50 rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold">{streak}</p>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <div className="mt-2 h-1 bg-warning/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-warning to-orange-500 rounded-full"
              style={{ width: `${Math.min(streak * 5, 100)}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-background/50 rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Points</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
            <span className="text-sm text-muted-foreground">pts</span>
          </div>
          <p className="text-xs text-success mt-2">
            <Zap className="h-3 w-3 inline mr-1" />
            Top 20% earners
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-background/50 rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Global Rank</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold">#{rank}</p>
            <span className="text-sm text-muted-foreground">of 1,234</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Move up 3 spots to reach top 50</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-background/50 rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Dept Rank</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold">#{departmentRank}</p>
            <span className="text-sm text-muted-foreground">of 45</span>
          </div>
          <p className="text-xs text-blue-500 mt-2">
            <Target className="h-3 w-3 inline mr-1" />
            Department leader
          </p>
        </motion.div>
      </div>

      <div className="mt-6 pt-6 border-t border-border/20">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Complete a module daily to maintain your streak! Each day adds to your points multiplier.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Today's multiplier:</span>
            <span className="px-2 py-1 bg-warning/20 text-warning rounded-full font-bold">
              x{Math.min(streak + 1, 5)}.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;