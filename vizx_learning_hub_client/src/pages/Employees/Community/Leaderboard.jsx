
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, Star, Crown } from 'lucide-react';
import leaderboardService from '../services/leaderboardService';
import { useAuth } from '../../../contexts/AuthContext';

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Crown className="w-8 h-8 text-primary drop-shadow-glow" />;
  if (rank === 2) return <Medal className="w-8 h-8 text-slate-300 drop-shadow-glow" />;
  if (rank === 3) return <Medal className="w-8 h-8 text-amber-600 drop-shadow-glow" />;
  return <span className="text-xl font-bold text-gray-400">#{rank}</span>;
};

const LeaderboardRow = ({ user, rank, isCurrentUser }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`flex items-center p-4 rounded-xl mb-3 backdrop-blur-md border ${
        isCurrentUser 
          ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
          : 'bg-white/5 border-white/10 hover:bg-white/10'
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
            className="w-12 h-12 rounded-full border-2 border-white/20"
          />
          {rank === 1 && <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1"><Star size={10} className="text-black" /></div>}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
            {user.name} {isCurrentUser && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full ml-2">You</span>}
          </h3>
          <p className="text-xs text-gray-400">{user.department} • {user.jobTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-8 mr-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-orange-400">
            <Flame size={18} className={user.currentStreak > 0 ? "fill-orange-400 animate-pulse" : ""} />
            <span className="font-bold">{user.currentStreak} Day Streak</span>
          </div>
          <span className="text-xs text-gray-500">Longest: {user.longestStreak}</span>
        </div>

        <div className="w-24 text-right">
          <div className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            {user.points.toLocaleString()}
          </div>
          <p className="text-xs text-blue-300/70 uppercase tracking-wider">Points</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Leaderboards() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('General'); // 'General' or 'Departmental'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const result = await leaderboardService.getLeaderboard();
        if (result.success) {
          setUsers(result.data);
          setFilteredUsers(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'Departmental' && currentUser?.department) {
      const userDept = typeof currentUser.department === 'string' ? currentUser.department : currentUser.department?.name;
      setFilteredUsers(users.filter(u => u.department === userDept));
    } else {
      setFilteredUsers(users);
    }
  }, [activeTab, users, currentUser]);

  if (loading) {
    return <div className="flex justify-center items-center h-full text-white">Loading Leaderboard...</div>;
  }

  const userRank = filteredUsers.findIndex(u => u.id === currentUser?.id) + 1;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-transparent">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
            <Trophy className="text-primary h-10 w-10" />
            Rankings
          </h1>
          <p className="text-gray-400">Compete with your peers and rise to the top</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Tabs UI */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
            {['General', 'Departmental'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/30 flex items-center gap-4 w-full sm:w-auto">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg">
              {userRank > 0 ? userRank : '-'}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-primary/70">Your Rank</p>
              <p className="font-bold text-white leading-none">{activeTab} Stats</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl mx-auto">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <LeaderboardRow 
              key={user.id} 
              user={user} 
              rank={index + 1} 
              isCurrentUser={user.id === currentUser?.id}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-gray-500 font-medium">No rankings found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
