import React from 'react';
import Icon from '../../../components/AppIcon';

const NotificationStats = () => {
  const stats = [
    {
      icon: 'Send',
      iconColor: 'text-primary',
      value: 1247,
      label: 'Total Sent',
      change: '+18%',
      trend: 'up'
    },
    {
      icon: 'Clock',
      iconColor: 'text-warning',
      value: 23,
      label: 'Scheduled',
      change: '+5',
      trend: 'up'
    },
    {
      icon: 'CheckCircle',
      iconColor: 'text-success',
      value: '94.2%',
      label: 'Delivery Rate',
      change: '+2.1%',
      trend: 'up'
    },
    {
      icon: 'TrendingUp',
      iconColor: 'text-success',
      value: '68%',
      label: 'Open Rate',
      change: '+12%',
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name={stat.icon} size={24} className={stat.iconColor} />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}>
              {stat.change}
            </span>
          </div>
          <div className="text-3xl font-bold text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default NotificationStats;