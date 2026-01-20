import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';

const GameCard = ({ game, onPlay, onViewDetails, userRole = 'employee', className = '' }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-success bg-success/10';
      case 'intermediate': return 'text-warning bg-warning/10';
      case 'advanced': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getGameTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'quiz': return 'HelpCircle';
      case 'challenge': return 'Target';
      case 'tournament': return 'Trophy';
      case 'scenario': return 'Map';
      case 'drag-drop': return 'Move';
      default: return 'Gamepad2';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}>
      <div className="relative h-48 overflow-hidden">
        <Image src={game?.image} alt={game?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3"><div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full"><Icon name={getGameTypeIcon(game?.type)} size={16} /><span className="text-sm font-medium capitalize">{game?.type}</span></div></div>
        {game?.isNew && <div className="absolute top-3 right-3"><span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">New</span></div>}
        <div className="absolute bottom-3 left-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game?.difficulty)}`}>{game?.difficulty}</span></div>
        {game?.isLive && <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-success text-success-foreground px-2 py-1 rounded-full"><div className="w-2 h-2 bg-success-foreground rounded-full animate-pulse" /><span className="text-xs font-medium">Live</span></div>}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">{game?.title}</h3>
          <div className="flex items-center gap-1 ml-2"><Icon name="Star" size={16} className="text-warning fill-current" /><span className="text-sm font-medium text-foreground">{game?.rating}</span></div>
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{game?.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2"><Icon name="Users" size={16} className="text-muted-foreground" /><div><p className="text-sm font-medium text-foreground">{game?.participants}</p><p className="text-xs text-muted-foreground">Players</p></div></div>
          <div className="flex items-center gap-2"><Icon name="Clock" size={16} className="text-muted-foreground" /><div><p className="text-sm font-medium text-foreground">{game?.avgTime}</p><p className="text-xs text-muted-foreground">Avg Time</p></div></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">{game?.skills?.slice(0, 3)?.map((skill, index) => (<span key={index} className="bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-medium">{skill}</span>))}{game?.skills?.length > 3 && <span className="text-xs text-muted-foreground px-2 py-1">+{game?.skills?.length - 3} more</span>}</div>
        <div className="flex gap-2"><Button variant="default" size="sm" fullWidth iconName="Play" iconPosition="left" onClick={() => onPlay(game)} disabled={game?.status === 'maintenance'}>{game?.status === 'maintenance' ? 'Maintenance' : 'Play Now'}</Button><Button variant="outline" size="sm" iconName="Info" onClick={() => onViewDetails(game)} /></div>
        {userRole === 'admin' && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-border"><Button variant="ghost" size="xs" iconName="Settings" iconPosition="left" className="flex-1">Configure</Button><Button variant="ghost" size="xs" iconName="BarChart3" iconPosition="left" className="flex-1">Analytics</Button></div>
        )}
      </div>
    </div>
  );
};

export default GameCard;