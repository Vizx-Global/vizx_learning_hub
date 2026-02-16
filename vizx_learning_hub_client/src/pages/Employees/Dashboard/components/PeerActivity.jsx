import React, { useState, useEffect } from 'react';
import { Users, Bell, Flame, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import socialService from '../../../../api/socialService';

const PeerActivity = () => {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nudging, setNudging] = useState({});

  useEffect(() => {
    fetchPeers();
  }, []);

  const fetchPeers = async () => {
    try {
      setLoading(true);
      const res = await socialService.getPeersStatus();
      if (res.data?.success) {
        setPeers(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch peers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNudge = async (peerId) => {
    try {
      setNudging(prev => ({ ...prev, [peerId]: true }));
      const res = await socialService.nudgePeer(peerId);
      if (res.data?.success) {
        // Optimistically update or show success
        setPeers(prev => prev.map(p => p.id === peerId ? { ...p, nudged: true } : p));
      }
    } catch (err) {
      console.error("Failed to nudge peer", err);
    } finally {
      setNudging(prev => ({ ...prev, [peerId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-6 border border-border animate-pulse h-full">
        <div className="h-6 w-32 bg-muted rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-muted rounded"></div>
                <div className="h-2 w-16 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-xl flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Users size={20} />
          </div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
            Peer Activity
          </h3>
        </div>
        <button 
          onClick={fetchPeers}
          className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-tighter"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
        {peers.length > 0 ? (
          peers.map((peer) => (
            <motion.div 
              key={peer.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={peer.avatar || `https://ui-avatars.com/api/?name=${peer.name}&background=random`} 
                    alt={peer.name}
                    className="w-10 h-10 rounded-full border border-border shadow-sm"
                  />
                  {peer.isStreakSafe ? (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-card">
                      <CheckCircle2 size={10} />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-card">
                      <AlertCircle size={10} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {peer.firstName}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Flame size={10} className={peer.streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"} />
                    <span className="text-[10px] font-bold text-muted-foreground">{peer.streak} day streak</span>
                  </div>
                </div>
              </div>

              <div>
                {peer.isStreakSafe ? (
                  <div className="px-3 py-1 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-tighter">
                    Safe
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={nudging[peer.id] || peer.nudged}
                    onClick={() => handleNudge(peer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      peer.nudged 
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30'
                    }`}
                  >
                    {nudging[peer.id] ? (
                      <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : peer.nudged ? (
                      <>
                        <CheckCircle2 size={10} />
                        Sent
                      </>
                    ) : (
                      <>
                        <Bell size={10} />
                        Nudge
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-50 grayscale">
            <Users size={40} className="mb-3 text-muted-foreground" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">
              No team activity today
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[10px] font-medium text-muted-foreground text-center italic">
            "Teamwork makes the dream work. Nudge 
            colleagues to keep the collective streak alive!"
          </p>
        </div>
      </div>
    </div>
  );
};

export default PeerActivity;
