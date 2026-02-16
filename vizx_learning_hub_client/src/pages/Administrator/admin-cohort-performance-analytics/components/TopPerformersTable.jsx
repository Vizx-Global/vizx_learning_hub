import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';

const TopPerformersTable = ({ performers = [], onViewAll }) => {
  return (
    <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Icon name="Award" size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Elite Performers</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Top cohort contributors</p>
          </div>
        </div>
        <button 
          onClick={onViewAll}
          className="px-5 py-2 rounded-xl bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border/50 hover:bg-muted/50 transition-all"
        >
          View All Operatives
        </button>
      </div>
      <div className="space-y-4 flex-1">
        {performers.length > 0 ? (
          performers.map((performer, index) => (
            <div key={performer.id} className="flex items-center gap-6 p-5 bg-card/30 rounded-2xl border border-border/40 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-5 flex-1">
                <div className="text-3xl font-black text-muted-foreground/30 w-10 group-hover:text-primary transition-colors text-center">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image src={performer.avatar} alt={performer.name} className="w-14 h-14 rounded-full border-2 border-border/50 object-cover relative z-10" />
                </div>
                <div>
                    <div className="font-black text-sm uppercase tracking-tight text-foreground">{performer.name}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{performer.cohort}</div>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-center">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Completion</div>
                    <div className="font-black text-emerald-500 text-sm">{performer.completion}%</div>
                </div>
                <div className="text-center">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Score</div>
                    <div className="font-black text-primary text-sm">{performer.score}%</div>
                </div>
                <div className="hidden sm:block text-center pr-4">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Streak</div>
                    <div className="font-black text-amber-500 text-sm flex items-center justify-center gap-1.5 leading-none">
                      <Icon name="Flame" size={14} className="stroke-[2.5]" />
                      {performer.streak}
                    </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Icon name="Users" size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No operational data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPerformersTable;