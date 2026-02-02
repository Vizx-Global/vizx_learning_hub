import React from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bgGradient, change, trend, isLoading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-[2rem] p-6 border border-border bg-card ${bgGradient} group h-full shadow-lg hover:shadow-xl transition-all duration-300`}
  >
    {/* Ambient Glow Effect */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${color}`}></div>
    
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500 ${color.replace('bg-', 'text-')}`}>
      <Icon size={80} />
    </div>
    
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} bg-opacity-20 backdrop-blur-md shadow-lg border border-white/10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        {!isLoading && change && (
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {change}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-muted-foreground font-medium text-xs uppercase tracking-widest mb-1 opacity-80">{title}</h3>
        {isLoading ? (
          <div className="h-9 w-24 bg-muted animate-pulse rounded-lg"></div>
        ) : (
          <div className="text-3xl font-black text-foreground tracking-tight">{value}</div>
        )}
      </div>
    </div>
  </motion.div>
);

const NotificationStats = ({ stats, isLoading }) => {
  const displayStats = [
    {
      title: 'Total Sent',
      value: stats?.totalSent || '0',
      icon: Send,
      color: 'bg-primary',
      bgGradient: 'from-primary/5 via-transparent to-transparent',
      change: '+18%', // Mock change for now
      trend: 'up'
    },
    {
      title: 'Unread',
      value: stats?.unread || '0',
      icon: AlertCircle,
      color: 'bg-amber-500',
      bgGradient: 'from-amber-500/5 via-transparent to-transparent',
      change: '+5',
      trend: 'up'
    },
    {
      title: 'Delivery Rate',
      value: `${stats?.deliveryRate || '100'}%`,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      bgGradient: 'from-emerald-500/5 via-transparent to-transparent',
      change: '+2.1%',
      trend: 'up'
    },
    {
      title: 'Open Rate',
      value: `${stats?.openRate || '0'}%`,
      icon: TrendingUp,
      color: 'bg-violet-500',
      bgGradient: 'from-violet-500/5 via-transparent to-transparent',
      change: '+12%',
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat, index) => (
        <StatCard key={index} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
};

export default NotificationStats;