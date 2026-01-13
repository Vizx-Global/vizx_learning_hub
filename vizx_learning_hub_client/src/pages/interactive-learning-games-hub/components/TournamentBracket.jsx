import React from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';

const TournamentBracket = ({ 
  tournament, 
  onJoinTournament, 
  onViewDetails,
  userRole = 'employee' 
}) => {
  const getRoundName = (round) => {
    const roundNames = {
      1: 'First Round',
      2: 'Quarter Finals',
      3: 'Semi Finals',
      4: 'Finals'
    };
    return roundNames?.[round] || `Round ${round}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'text-success bg-success/10';
      case 'upcoming':
        return 'text-warning bg-warning/10';
      case 'completed':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Tournament Header */}
      <div className="relative h-32 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-6 h-full flex items-center justify-between text-white">
          <div>
            <h3 className="text-xl font-bold mb-1">{tournament?.title}</h3>
            <p className="text-sm opacity-90">{tournament?.description}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament?.status)}`}>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              {tournament?.status}
            </div>
          </div>
        </div>
      </div>
      {/* Tournament Info */}
      <div className="p-6 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Icon name="Users" size={20} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{tournament?.participants}/{tournament?.maxParticipants}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Icon name="Trophy" size={20} className="text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">{tournament?.prizePool}</p>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Icon name="Clock" size={20} className="text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">{formatTimeRemaining(tournament?.endTime)}</p>
              <p className="text-xs text-muted-foreground">Time Left</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Icon name="Target" size={20} className="text-error" />
            <div>
              <p className="text-sm font-medium text-foreground">{tournament?.currentRound}/{tournament?.totalRounds}</p>
              <p className="text-xs text-muted-foreground">Round</p>
            </div>
          </div>
        </div>
      </div>
      {/* Bracket Visualization */}
      <div className="p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="GitBranch" size={18} />
          Tournament Bracket
        </h4>
        
        <div className="space-y-4">
          {tournament?.rounds?.map((round, roundIndex) => (
            <div key={roundIndex} className="border border-border rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Icon name="Circle" size={12} className="text-primary" />
                {getRoundName(roundIndex + 1)}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {round?.matches?.map((match, matchIndex) => (
                  <div key={matchIndex} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      {/* Player 1 */}
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-foreground">
                            {match?.player1?.name?.charAt(0) || 'P1'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {match?.player1?.name || 'TBD'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Score: {match?.player1?.score || 0}
                          </p>
                        </div>
                      </div>

                      {/* VS */}
                      <div className="px-3">
                        <span className="text-xs font-medium text-muted-foreground">VS</span>
                      </div>

                      {/* Player 2 */}
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div>
                          <p className="text-sm font-medium text-foreground text-right">
                            {match?.player2?.name || 'TBD'}
                          </p>
                          <p className="text-xs text-muted-foreground text-right">
                            Score: {match?.player2?.score || 0}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-secondary-foreground">
                            {match?.player2?.name?.charAt(0) || 'P2'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Status */}
                    <div className="mt-2 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(match?.status)}`}>
                        {match?.status === 'live' ? 'Playing Now' : 
                         match?.status === 'completed' ? `Winner: ${match?.winner}` : 
                         'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="p-6 border-t border-border bg-muted/20">
        <div className="flex gap-3">
          <Button
            variant="default"
            iconName="UserPlus"
            iconPosition="left"
            onClick={() => onJoinTournament(tournament)}
            disabled={tournament?.participants >= tournament?.maxParticipants || tournament?.status === 'completed'}
            className="flex-1"
          >
            {tournament?.participants >= tournament?.maxParticipants ? 'Tournament Full' : 'Join Tournament'}
          </Button>
          
          <Button
            variant="outline"
            iconName="Eye"
            iconPosition="left"
            onClick={() => onViewDetails(tournament)}
          >
            View Details
          </Button>

          {userRole === 'admin' && (
            <Button
              variant="ghost"
              iconName="Settings"
              onClick={() => console.log('Configure tournament')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;