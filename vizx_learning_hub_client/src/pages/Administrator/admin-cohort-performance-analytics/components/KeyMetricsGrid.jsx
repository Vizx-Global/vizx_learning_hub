import React from 'react';
import Icon from '../../../../components/AppIcon';

const KeyMetricsGrid = ({ cohort }) => {
  const metrics = [
    { 
      icon: 'Users', 
      iconColor: 'text-primary', 
      value: cohort?.members || 0, 
      label: 'Active Learners', 
      change: cohort?.memberChange || null, 
      trend: cohort?.memberTrend || 'up' 
    },
    { 
      icon: 'Target', 
      iconColor: 'text-emerald-500', 
      value: `${cohort?.avgCompletion || 0}%`, 
      label: 'Avg Completion', 
      change: cohort?.completionChange || null, 
      trend: cohort?.completionTrend || 'up' 
    },
    { 
      icon: 'Award', 
      iconColor: 'text-amber-500', 
      value: `${cohort?.avgScore || 0}%`, 
      label: 'Avg Assessment Score', 
      change: cohort?.scoreChange || null, 
      trend: cohort?.scoreTrend || 'up' 
    },
    { 
      icon: 'Flame', 
      iconColor: 'text-orange-500', 
      value: cohort?.avgStreak || 0, 
      label: 'Avg Streak (days)', 
      change: cohort?.streakChange || null, 
      trend: cohort?.streakTrend || 'up' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-[#000000] border border-border/50 rounded-[2.5rem] p-8 shadow-sm group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-2xl bg-current/10 ${metric.iconColor} border border-current/20`}>
              <Icon name={metric.icon} size={24} className="stroke-[2.5]" />
            </div>
            {metric.change && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <Icon name={metric.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={12} className="stroke-[3]" />
                {metric.change}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-black text-foreground tracking-tight">{metric.value}</div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{metric.label}</div>
          </div>
          {metric.change && (
            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Variation from previous cycle
                </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsGrid;