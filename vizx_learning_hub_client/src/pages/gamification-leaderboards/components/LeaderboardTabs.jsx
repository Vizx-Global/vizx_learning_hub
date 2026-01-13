import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const LeaderboardTabs = ({ activeTab, onTabChange, userRole = 'employee' }) => {
  const tabs = [
    {
      id: 'global',
      label: 'Global Rankings',
      icon: 'Globe',
      description: 'All employees across organization',
      roles: ['employee', 'admin', 'manager']
    },
    {
      id: 'department',
      label: 'Department',
      icon: 'Building2',
      description: 'Your department rankings',
      roles: ['employee', 'admin', 'manager']
    },
    {
      id: 'team',
      label: 'My Team',
      icon: 'Users',
      description: 'Team-specific leaderboard',
      roles: ['manager', 'admin']
    },
    {
      id: 'cohorts',
      label: 'Learning Cohorts',
      icon: 'GraduationCap',
      description: 'Custom learning groups',
      roles: ['admin', 'manager']
    },
    {
      id: 'skills',
      label: 'Skills-Based',
      icon: 'Target',
      description: 'Rankings by skill category',
      roles: ['employee', 'admin', 'manager']
    }
  ];

  const filteredTabs = tabs?.filter(tab => tab?.roles?.includes(userRole));

  return (
    <div className="bg-card border border-border rounded-lg p-1">
      <div className="flex flex-wrap gap-1">
        {filteredTabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium
              transition-all duration-200 ease-out group relative
              ${activeTab === tab?.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }
            `}
          >
            <Icon 
              name={tab?.icon} 
              size={16} 
              className={`
                transition-colors duration-200
                ${activeTab === tab?.id ? 'text-primary-foreground' : 'text-current'}
              `}
            />
            <div className="flex flex-col items-start">
              <span className="font-semibold">{tab?.label}</span>
              <span className={`
                text-xs opacity-80 hidden sm:block
                ${activeTab === tab?.id ? 'text-primary-foreground' : 'text-muted-foreground'}
              `}>
                {tab?.description}
              </span>
            </div>
            
            {activeTab === tab?.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTabs;