import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Flame, 
  Activity, 
  Trophy, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StatCard = ({ title, value, icon: Icon, color, bgGradient, subText }) => (
  <motion.div 
    variants={itemVariants}
    className={`relative overflow-hidden rounded-3xl p-6 border border-border bg-card ${bgGradient} group h-full shadow-lg hover:shadow-xl transition-all duration-300`}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${color}`}></div>
    
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500 ${color.replace('bg-', 'text-')}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} bg-opacity-20 backdrop-blur-md shadow-lg border border-white/10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <h3 className="text-muted-foreground dark:text-white/60 font-medium text-sm uppercase tracking-wider mb-1 opacity-80">{title}</h3>
        <div className="text-3xl font-black text-foreground dark:text-white tracking-tight">{value}</div>
      </div>
      {subText && (
        <p className="text-xs text-muted-foreground dark:text-white/40 mt-4 font-medium flex items-center gap-1">
          <Activity size={12} className="opacity-50" /> {subText}
        </p>
      )}
    </div>
  </motion.div>
);

const KPICards = ({ user, stats, activePreset }) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Total Points */}
      <StatCard 
        title="Total Points" 
        value={user?.totalPoints?.toLocaleString()} 
        icon={Award} 
        color="bg-amber-500"
        bgGradient="bg-gradient-to-br from-amber-500/10 via-card to-card dark:from-amber-600/20 dark:via-[#1e1b4b] dark:to-[#1e1b4b]"
        subText="Global Rank: Top 5%"
      />
      
      {/* Streak Card */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-6 border border-border bg-card group h-full shadow-lg hover:shadow-primary/10 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Flame size={100} className={user?.currentStreak > 0 ? "text-primary animate-pulse" : "text-muted-foreground"} />
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/20 backdrop-blur-md text-primary shadow-lg shadow-primary/20">
                <Flame size={24} className={user?.currentStreak > 0 ? "fill-primary" : ""} />
             </div>
              <div>
                <h3 className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Current Streak</h3>
                <div className="text-3xl font-black text-foreground">{user?.currentStreak || 0} <span className="text-sm font-bold text-muted-foreground">Days</span></div>
              </div>
          </div>
          
           <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
             <div className="flex justify-between items-end gap-1 h-8">
                {['M','T','W','T','F'].map((day, i) => {
                  const active = user?.currentStreak > 0 && i < Math.min(user.currentStreak, 5);
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 items-center group/day">
                      <div className={`w-full rounded-t-sm transition-all duration-500 ${active ? 'bg-primary h-full shadow-[0_0_8px_rgba(229,116,55,0.5)]' : 'bg-muted h-2 group-hover/day:bg-muted/80'}`}></div>
                      <span className="text-[8px] font-bold text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
             </div>
           </div>
        </div>
      </motion.div>

      {/* Total Enrollments */}
      <StatCard 
        title="Total Enrollments" 
        value={stats?.totalEnrollments}
        icon={Activity} 
        color="bg-blue-500"
        bgGradient="bg-gradient-to-br from-blue-500/10 via-card to-card dark:from-blue-600/20 dark:via-[#0f172a] dark:to-[#0f172a]"
        subText="Active Learning Paths"
      />

      {/* Completed Paths */}
      <StatCard 
        title="Completed Paths" 
        value={stats?.completedPaths} 
        icon={Trophy} 
        color="bg-emerald-500"
        bgGradient="bg-gradient-to-br from-emerald-500/10 via-card to-card dark:from-emerald-600/20 dark:via-[#022c22] dark:to-[#022c22]"
        subText={`${activePreset} Completion`}
      />
      
      {/* Total Modules */}
      <StatCard 
        title="Total Modules" 
        value={stats?.totalModules} 
        icon={Layers} 
        color="bg-violet-500"
        bgGradient="bg-gradient-to-br from-violet-500/10 via-card to-card dark:from-violet-600/20 dark:via-[#2e1065] dark:to-[#2e1065]"
        subText="Across all paths"
      />

      {/* Modules Finished */}
      <StatCard 
        title="Modules Finished" 
        value={stats?.completedModules} 
        icon={CheckCircle2} 
        color="bg-cyan-500"
        bgGradient="bg-gradient-to-br from-cyan-500/10 via-card to-card dark:from-cyan-600/20 dark:via-[#083344] dark:to-[#083344]"
        subText={`${Math.round((stats?.completedModules / (stats?.totalModules || 1)) * 100)}% Completion Rate`}
      />
    </motion.div>
  );
};

export default KPICards;
