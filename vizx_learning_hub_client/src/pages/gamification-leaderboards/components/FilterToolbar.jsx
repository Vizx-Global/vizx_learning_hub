import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterToolbar = ({ 
  timeRange, 
  onTimeRangeChange, 
  department, 
  onDepartmentChange,
  skillCategory,
  onSkillCategoryChange,
  onRefresh,
  isLive = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const timeRangeOptions = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'quarterly', label: 'This Quarter' },
    { value: 'yearly', label: 'This Year' },
    { value: 'all-time', label: 'All Time' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'design', label: 'Design' }
  ];

  const skillCategoryOptions = [
    { value: 'all', label: 'All Skills' },
    { value: 'ai-fundamentals', label: 'AI Fundamentals' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'cloud-computing', label: 'Cloud Computing' },
    { value: 'programming', label: 'Programming' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'automation', label: 'Automation' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Leaderboard Filters</h3>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success font-medium">Live Updates</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={onRefresh}
          >
            Refresh
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'} Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Time Range"
          options={timeRangeOptions}
          value={timeRange}
          onChange={onTimeRangeChange}
          className="w-full"
        />
        
        <Select
          label="Department"
          options={departmentOptions}
          value={department}
          onChange={onDepartmentChange}
          className="w-full"
        />
        
        <Select
          label="Skill Category"
          options={skillCategoryOptions}
          value={skillCategory}
          onChange={onSkillCategoryChange}
          className="w-full"
        />
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-streaks"
                className="rounded border-border"
              />
              <label htmlFor="show-streaks" className="text-sm text-foreground">
                Show Learning Streaks
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-achievements"
                className="rounded border-border"
              />
              <label htmlFor="show-achievements" className="text-sm text-foreground">
                Recent Achievements
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hide-inactive"
                className="rounded border-border"
              />
              <label htmlFor="hide-inactive" className="text-sm text-foreground">
                Hide Inactive Users
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-trends"
                className="rounded border-border"
              />
              <label htmlFor="show-trends" className="text-sm text-foreground">
                Show Trend Indicators
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;