import React from 'react';
import Icon from '../../../../components/AppIcon';

const AIInsightsPanel = ({ insights = [] }) => {
  const getIconColor = (color) => {
    const colors = { 
      success: 'text-emerald-500', 
      warning: 'text-amber-500', 
      primary: 'text-primary', 
      destructive: 'text-rose-500' 
    };
    return colors[color] || 'text-muted-foreground';
  };

  return (
    <div className="bg-[#000000] border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-violet-600/10 text-violet-600 border border-violet-600/20">
          <Icon name="Zap" size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Diagnostic Insights</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Neural pattern detection</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-card/30 rounded-[1.5rem] p-5 border border-border/40 group hover:border-primary/40 transition-all cursor-default relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-current/5 blur-3xl -mr-12 -mt-12 rounded-full ${getIconColor(insight.color)}`} />
            <div className="flex items-center gap-2 mb-3">
              <Icon name={insight.icon} size={20} className={getIconColor(insight.color)} />
              <span className="font-black text-xs uppercase tracking-tight text-foreground">{insight.title}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightsPanel;