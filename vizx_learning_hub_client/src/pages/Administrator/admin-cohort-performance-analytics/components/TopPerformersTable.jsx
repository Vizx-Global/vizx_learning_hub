import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';

const TopPerformersTable = ({ performers = [], onViewAll }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><Icon name="Award" size={24} className="text-warning" /><h3 className="text-xl font-bold text-foreground">Top Performers</h3></div>
        <Button variant="outline" size="sm" onClick={onViewAll}>View All</Button>
      </div>
      <div className="space-y-3">
        {performers.map((performer, index) => (
          <div key={performer.id} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</div>
              <Image src={performer.avatar} alt={performer.name} className="w-12 h-12 rounded-full object-cover" />
              <div><div className="font-semibold text-foreground">{performer.name}</div><div className="text-sm text-muted-foreground">{performer.cohort}</div></div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div><div className="text-xs text-muted-foreground mb-1">Completion</div><div className="font-bold text-success">{performer.completion}%</div></div>
              <div><div className="text-xs text-muted-foreground mb-1">Score</div><div className="font-bold text-primary">{performer.score}%</div></div>
              <div><div className="text-xs text-muted-foreground mb-1">Streak</div><div className="font-bold text-warning flex items-center justify-center gap-1"><Icon name="Flame" size={14} />{performer.streak}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformersTable;