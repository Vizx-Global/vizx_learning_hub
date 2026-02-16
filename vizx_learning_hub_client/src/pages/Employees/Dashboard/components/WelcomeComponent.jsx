import React from 'react';
import { motion } from 'framer-motion';

const WelcomeComponent = ({ user, activePreset }) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[2rem] border border-primary p-6 sm:p-8 md:p-12 shadow-2xl text-white"
    >
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-black/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3 flex-wrap text-white">
            Hello, {user.firstName}
            <motion.span 
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ delay: 1, duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
              className="inline-block origin-bottom-right"
            >👋</motion.span>
          </h1>
          <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed opacity-90">
            Here's your personal learning progress for <span className="text-white font-bold underline decoration-white/30 decoration-2 underline-offset-4">{activePreset === 'All Time' ? 'all time' : activePreset?.toLowerCase()}</span>.
          </p>
        </div>
        
        <div className="glass-panel px-6 py-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Current Level</p>
            <p className="text-xl font-black text-white">Level {user.currentLevel || 1}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center font-black border-4 border-white/20">
            {user.currentLevel || 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeComponent;
