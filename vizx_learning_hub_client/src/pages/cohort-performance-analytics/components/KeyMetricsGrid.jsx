
import React from 'react';
import Icon from '../../../components/AppIcon';

const KeyMetricsGrid = ({ cohort }) => {
  const metrics = [
    {
      icon: 'Users',
      iconColor: 'text-primary',
      value: cohort?.members || 0,
      label: 'Active Learners',
      change: '+12%',
      trend: 'up'
    },
    {
      icon: 'Target',
      iconColor: 'text-success',
      value: `${cohort?.avgCompletion || 0}%`,
      label: 'Avg Completion',
      change: '+8%',
      trend: 'up'
    },
    {
      icon: 'Award',
      iconColor: 'text-warning',
      value: `${cohort?.avgScore || 0}%`,
      label: 'Avg Assessment Score',
      change: '+5%',
      trend: 'up'
    },
    {
      icon: 'Flame',
      iconColor: 'text-destructive',
      value: 18,
      label: 'Avg Streak (days)',
      change: '-2 days',
      trend: 'down'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name={metric.icon} size={24} className={metric.iconColor} />
            <Icon 
              name={metric.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
              size={16} 
              className={metric.trend === 'up' ? 'text-success' : 'text-destructive'} 
            />
          </div>
          <div className="text-3xl font-bold text-foreground">{metric.value}</div>
          <div className="text-sm text-muted-foreground">{metric.label}</div>
          <div className={`mt-2 text-xs ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            {metric.change} from last period
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsGrid;