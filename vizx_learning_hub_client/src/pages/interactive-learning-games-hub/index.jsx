import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import GameCard from './components/GameCard';
import GameFilters from './components/GameFilters';
import TournamentBracket from './components/TournamentBracket';
import LiveGameSession from './components/LiveGameSession';
import GameCreationModal from './components/GameCreationModal';

const InteractiveLearningGamesHub = () => {
  const navigate = useNavigate();
  const [userRole] = useState('employee'); // This would come from auth context
  const [activeView, setActiveView] = useState('games'); // 'games', 'tournaments', 'playing'
  const [selectedGame, setSelectedGame] = useState(null);
  const [isGameSessionActive, setIsGameSessionActive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    type: 'all',
    status: 'all',
    sortBy: 'newest'
  });

  // Mock data for games
  const [games, setGames] = useState([
    {
      id: 1,
      title: "Azure AI Fundamentals Challenge",
      description: "Test your knowledge of Azure Cognitive Services, Machine Learning basics, and AI ethics through interactive scenarios.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
      category: "azure-ai",
      difficulty: "beginner",
      type: "quiz",
      participants: 234,
      maxParticipants: 500,
      avgTime: "12 min",
      rating: 4.8,
      skills: ["Azure AI", "Machine Learning", "AI Ethics"],
      status: "active",
      isNew: true,
      isLive: false,
      timeLimit: 720
    },
    {
      id: 2,
      title: "Machine Learning Model Battle",
      description: "Compete in real-time to build and optimize ML models. Test different algorithms and see who achieves the best accuracy.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      category: "machine-learning",
      difficulty: "intermediate",
      type: "challenge",
      participants: 89,
      maxParticipants: 100,
      avgTime: "25 min",
      rating: 4.9,
      skills: ["Python", "Scikit-learn", "Model Optimization"],
      status: "active",
      isNew: false,
      isLive: true,
      timeLimit: 1500
    },
    {
      id: 3,
      title: "Data Science Detective",
      description: "Solve data mysteries using statistical analysis, data visualization, and machine learning techniques in this scenario-based game.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      category: "data-science",
      difficulty: "advanced",
      type: "scenario",
      participants: 156,
      maxParticipants: 200,
      avgTime: "35 min",
      rating: 4.7,
      skills: ["Data Analysis", "Statistics", "Python", "Visualization"],
      status: "active",
      isNew: false,
      isLive: false,
      timeLimit: 2100
    },
    {
      id: 4,
      title: "Neural Network Builder",
      description: "Drag and drop components to build neural networks. Learn about layers, activation functions, and optimization techniques.",
      image: "https://images.pixabay.com/photo/2017/05/10/19/29/robot-2301646_1280.jpg?w=400&h=300&fit=crop",
      category: "machine-learning",
      difficulty: "intermediate",
      type: "drag-drop",
      participants: 67,
      maxParticipants: 150,
      avgTime: "18 min",
      rating: 4.6,
      skills: ["Neural Networks", "Deep Learning", "TensorFlow"],
      status: "active",
      isNew: true,
      isLive: false,
      timeLimit: 1080
    },
    {
      id: 5,
      title: "AI Ethics Dilemma",
      description: "Navigate complex ethical scenarios in AI development. Make decisions about bias, privacy, and responsible AI practices.",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=400&h=300&fit=crop",
      category: "ai-fundamentals",
      difficulty: "beginner",
      type: "scenario",
      participants: 198,
      maxParticipants: 300,
      avgTime: "15 min",
      rating: 4.5,
      skills: ["AI Ethics", "Responsible AI", "Decision Making"],
      status: "active",
      isNew: false,
      isLive: false,
      timeLimit: 900
    },
    {
      id: 6,
      title: "Computer Vision Championship",
      description: "Tournament-style competition focusing on image recognition, object detection, and computer vision algorithms.",
      image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=300&fit=crop",
      category: "cognitive-services",
      difficulty: "advanced",
      type: "tournament",
      participants: 45,
      maxParticipants: 64,
      avgTime: "45 min",
      rating: 4.9,
      skills: ["Computer Vision", "OpenCV", "Image Processing"],
      status: "live",
      isNew: false,
      isLive: true,
      timeLimit: 2700
    }
  ]);

  // Mock tournament data
  const [tournaments, setTournaments] = useState([
    {
      id: 1,
      title: "AI Masters Championship 2024",
      description: "The ultimate test of AI knowledge across all domains. Compete for the title of AI Master and exclusive learning resources.",
      status: "live",
      participants: 128,
      maxParticipants: 128,
      prizePool: "5000 Learning Points",
      currentRound: 3,
      totalRounds: 4,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      rounds: [
        {
          matches: [
            {
              player1: { name: "Sarah Chen", score: 95 },
              player2: { name: "Mike Rodriguez", score: 87 },
              status: "completed",
              winner: "Sarah Chen"
            },
            {
              player1: { name: "Alex Johnson", score: 92 },
              player2: { name: "Emily Davis", score: 89 },
              status: "completed",
              winner: "Alex Johnson"
            }
          ]
        },
        {
          matches: [
            {
              player1: { name: "Sarah Chen", score: 88 },
              player2: { name: "Alex Johnson", score: 91 },
              status: "live",
              winner: null
            }
          ]
        }
      ]
    }
  ]);

  const gameStats = {
    total: games?.length,
    active: games?.filter(g => g?.status === 'active')?.length,
    live: games?.filter(g => g?.isLive)?.length,
    tournaments: tournaments?.length
  };

  const filteredGames = games?.filter(game => {
    if (filters?.search && !game?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) && 
        !game?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
      return false;
    }
    if (filters?.category !== 'all' && game?.category !== filters?.category) return false;
    if (filters?.difficulty !== 'all' && game?.difficulty !== filters?.difficulty) return false;
    if (filters?.type !== 'all' && game?.type !== filters?.type) return false;
    if (filters?.status !== 'all') {
      if (filters?.status === 'live' && !game?.isLive) return false;
      if (filters?.status === 'active' && game?.status !== 'active') return false;
    }
    return true;
  })?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'popular':
        return b?.participants - a?.participants;
      case 'rating':
        return b?.rating - a?.rating;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder?.[a?.difficulty] - difficultyOrder?.[b?.difficulty];
      default:
        return b?.id - a?.id; // newest first
    }
  });

  const handlePlayGame = (game) => {
    setSelectedGame(game);
    setIsGameSessionActive(true);
  };

  const handleGameComplete = (results) => {
    console.log('Game completed:', results);
    setIsGameSessionActive(false);
    setSelectedGame(null);
    // Here you would typically update user progress, leaderboards, etc.
  };

  const handleGameExit = () => {
    setIsGameSessionActive(false);
    setSelectedGame(null);
  };

  const handleCreateGame = (newGame) => {
    setGames([newGame, ...games]);
    console.log('New game created:', newGame);
  };

  const handleJoinTournament = (tournament) => {
    console.log('Joining tournament:', tournament?.id);
    // Here you would handle tournament registration
  };

  const handleViewDetails = (item) => {
    console.log('Viewing details for:', item?.id);
    // Here you would show detailed view/modal
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e?.ctrlKey || e?.metaKey) {
        switch (e?.key) {
          case '1':
            e?.preventDefault();
            setActiveView('games');
            break;
          case '2':
            e?.preventDefault();
            setActiveView('tournaments');
            break;
          case 'n':
            e?.preventDefault();
            if (userRole === 'admin') {
              setShowCreateModal(true);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [userRole]);

  if (isGameSessionActive && selectedGame) {
    return (
      <LiveGameSession
        game={selectedGame}
        onGameComplete={handleGameComplete}
        onGameExit={handleGameExit}
        userRole={userRole}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar userRole={userRole} />
      <div className="ml-0 md:ml-72">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Icon name="Gamepad2" size={24} color="white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Interactive Learning Games</h1>
                  <p className="text-muted-foreground">Enhance your AI knowledge through gamified learning experiences</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Live Indicator */}
                <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{gameStats?.live} Live Games</span>
                </div>

                {userRole === 'admin' && (
                  <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Game
                  </Button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-4">
              <button
                onClick={() => setActiveView('games')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeView === 'games' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <Icon name="Gamepad2" size={16} className="inline mr-2" />
                Games ({filteredGames?.length})
              </button>
              <button
                onClick={() => setActiveView('tournaments')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeView === 'tournaments' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <Icon name="Trophy" size={16} className="inline mr-2" />
                Tournaments ({tournaments?.length})
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {activeView === 'games' && (
            <div className="space-y-6">
              {/* Filters */}
              <GameFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={() => setFilters({
                  search: '',
                  category: 'all',
                  difficulty: 'all',
                  type: 'all',
                  status: 'all',
                  sortBy: 'newest'
                })}
                gameStats={gameStats}
              />

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Zap" size={24} />
                    <div>
                      <p className="font-semibold">Quick Match</p>
                      <p className="text-sm opacity-90">Find a game now</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-success to-success/80 text-success-foreground rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Target" size={24} />
                    <div>
                      <p className="font-semibold">Daily Challenge</p>
                      <p className="text-sm opacity-90">Earn bonus points</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Users" size={24} />
                    <div>
                      <p className="font-semibold">Team Battle</p>
                      <p className="text-sm opacity-90">Compete with colleagues</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-error to-error/80 text-error-foreground rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Trophy" size={24} />
                    <div>
                      <p className="font-semibold">Leaderboard</p>
                      <p className="text-sm opacity-90">Check your rank</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Games Grid */}
              {filteredGames?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGames?.map((game) => (
                    <GameCard
                      key={game?.id}
                      game={game}
                      onPlay={handlePlayGame}
                      onViewDetails={handleViewDetails}
                      userRole={userRole}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No games found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                  <Button
                    variant="outline"
                    iconName="RefreshCw"
                    iconPosition="left"
                    onClick={() => setFilters({
                      search: '',
                      category: 'all',
                      difficulty: 'all',
                      type: 'all',
                      status: 'all',
                      sortBy: 'newest'
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeView === 'tournaments' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon name="Trophy" size={24} className="text-warning" />
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Active Tournaments</h2>
                      <p className="text-muted-foreground">Compete for prizes and recognition</p>
                    </div>
                  </div>
                  
                  {userRole === 'admin' && (
                    <Button
                      variant="outline"
                      iconName="Plus"
                      iconPosition="left"
                    >
                      Create Tournament
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {tournaments?.map((tournament) => (
                    <TournamentBracket
                      key={tournament?.id}
                      tournament={tournament}
                      onJoinTournament={handleJoinTournament}
                      onViewDetails={handleViewDetails}
                      userRole={userRole}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Keyboard" size={14} />
          <span className="font-medium">Shortcuts:</span>
        </div>
        <div>Ctrl+1: Games • Ctrl+2: Tournaments {userRole === 'admin' && '• Ctrl+N: Create'}</div>
      </div>
      {/* Game Creation Modal */}
      <GameCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGame={handleCreateGame}
        userRole={userRole}
      />
    </div>
  );
};

export default InteractiveLearningGamesHub;