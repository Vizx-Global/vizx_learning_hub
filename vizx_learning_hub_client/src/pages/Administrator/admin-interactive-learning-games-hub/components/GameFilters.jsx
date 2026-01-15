import React from 'react';
import Select from '../../../../components/ui/Select';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';

const GameFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  gameStats = {}
}) => {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'ai-fundamentals', label: 'AI Fundamentals' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'azure-ai', label: 'Azure AI Services' },
    { value: 'cognitive-services', label: 'Cognitive Services' },
    { value: 'bot-framework', label: 'Bot Framework' },
    { value: 'power-platform', label: 'Power Platform AI' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'quiz', label: 'Quiz Games' },
    { value: 'challenge', label: 'Challenges' },
    { value: 'tournament', label: 'Tournaments' },
    { value: 'scenario', label: 'Scenarios' },
    { value: 'drag-drop', label: 'Interactive' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'live', label: 'Live Now' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'participants', label: 'Most Players' },
    { value: 'difficulty', label: 'Difficulty' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value && value !== 'all' && value !== ''
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="Filter" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Filter Games</h2>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        )}
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{gameStats?.total || 0}</p>
          <p className="text-xs text-muted-foreground">Total Games</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{gameStats?.active || 0}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">{gameStats?.live || 0}</p>
          <p className="text-xs text-muted-foreground">Live Now</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-error">{gameStats?.tournaments || 0}</p>
          <p className="text-xs text-muted-foreground">Tournaments</p>
        </div>
      </div>
      {/* Search */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search games by title, description, or skills..."
          value={filters?.search || ''}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="w-full"
        />
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Select
          label="Category"
          options={categoryOptions}
          value={filters?.category || 'all'}
          onChange={(value) => handleFilterChange('category', value)}
        />

        <Select
          label="Difficulty"
          options={difficultyOptions}
          value={filters?.difficulty || 'all'}
          onChange={(value) => handleFilterChange('difficulty', value)}
        />

        <Select
          label="Game Type"
          options={typeOptions}
          value={filters?.type || 'all'}
          onChange={(value) => handleFilterChange('type', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status || 'all'}
          onChange={(value) => handleFilterChange('status', value)}
        />

        <Select
          label="Sort By"
          options={sortOptions}
          value={filters?.sortBy || 'newest'}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />

        <div className="flex items-end">
          <Button
            variant="outline"
            fullWidth
            iconName="RefreshCw"
            iconPosition="left"
            onClick={() => window.location?.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(filters)?.map(([key, value]) => {
            if (!value || value === 'all' || value === '') return null;
            
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
              >
                {key}: {value}
                <button
                  onClick={() => handleFilterChange(key, key === 'sortBy' ? 'newest' : 'all')}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameFilters;