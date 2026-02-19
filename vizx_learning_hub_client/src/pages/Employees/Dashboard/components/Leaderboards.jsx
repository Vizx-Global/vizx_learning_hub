import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Crown, Medal, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500 drop-shadow-glow" />;
  if (rank === 2) return <Medal className="w-8 h-8 text-slate-400 drop-shadow-glow" />;
  if (rank === 3) return <Medal className="w-8 h-8 text-amber-700 drop-shadow-glow" />;
  return <span className="text-xl font-bold text-muted-foreground">#{rank}</span>;
};

const LeaderboardRow = ({ user, rank, isCurrentUser }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`flex items-center p-4 rounded-xl mb-3 backdrop-blur-md border ${
        isCurrentUser 
          ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(229,116,55,0.1)]' 
          : 'bg-card border-border hover:bg-muted/50'
      } transition-all duration-300`}
    >
      <div className="w-16 flex justify-center">
        <RankBadge rank={rank} />
      </div>
      
      <div className="flex items-center flex-1 gap-4">
        <div className="relative">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
            alt={user.name}
            className="w-12 h-12 rounded-full border-2 border-border"
          />
          {rank === 1 && <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"><Star size={10} className="text-black" /></div>}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
            {user.name} {isCurrentUser && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-2">You</span>}
          </h3>
          <p className="text-xs text-muted-foreground">{user.department?.name || user.department} • {user.jobTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-8 mr-0 sm:mr-4">
        <div className="flex flex-col items-end hidden lg:flex">
          <div className="flex items-center gap-2 text-primary">
            <Flame size={18} className={user.currentStreak > 0 ? "fill-primary animate-pulse" : ""} />
            <span className="font-bold">{user.currentStreak} Day Streak</span>
          </div>
          <span className="text-xs text-muted-foreground">Longest: {user.longestStreak}</span>
        </div>

        <div className="w-20 sm:w-24 text-right">
          <div className="font-black text-xl sm:text-2xl text-primary">
            {user.points.toLocaleString()}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Points</p>
        </div>
      </div>
    </motion.div>
  );
};

const Leaderboards = ({ leaderboard, currentUser }) => {
  return (
    <div className="bg-card rounded-3xl border border-border p-8 flex flex-col shadow-lg h-full">
      <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Top Learners</h3>
            <p className="text-sm text-muted-foreground">This Week's Leaderboard</p>
          </div>
        </div>
        <Link to="/employee-leaderboards" className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest hover:bg-secondary/20 transition-colors">
           View Full Ranking
        </Link>
      </div>

      <div className="space-y-4 flex-1">
        {leaderboard?.length > 0 ? leaderboard.slice(0, 5).map((u, i) => (
          <LeaderboardRow 
            key={u.id || i}
            user={u}
            rank={i + 1}
            isCurrentUser={currentUser?.id === u.id}
          />
        )) : (
          <div className="text-center py-10 text-muted-foreground">No leaderboard data available yet.</div>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;
