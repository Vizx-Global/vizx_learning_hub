import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      action: 'Notification sent',
      title: 'Weekly Progress Update',
      timestamp: '2 minutes ago',
      status: 'success',
      recipients: 150
    },
    {
      id: 2,
      action: 'Notification scheduled',
      title: 'New AI Course Launch',
      timestamp: '15 minutes ago',
      status: 'scheduled',
      recipients: 89
    },
    {
      id: 3,
      action: 'Template created',
      title: 'Custom Engagement Template',
      timestamp: '1 hour ago',
      status: 'success',
      recipients: 0
    },
    {
      id: 4,
      action: 'Notification failed',
      title: 'System Maintenance Alert',
      timestamp: '3 hours ago',
      status: 'failed',
      recipients: 12
    },
    {
      id: 5,
      action: 'Notification sent',
      title: 'Achievement Celebration',
      timestamp: '5 hours ago',
      status: 'success',
      recipients: 24
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      success: 'text-success',
      scheduled: 'text-warning',
      failed: 'text-destructive'
    };
    return colors[status] || 'text-muted-foreground';
  };

  const getStatusIcon = (status) => {
    const icons = {
      success: 'CheckCircle',
      scheduled: 'Clock',
      failed: 'AlertCircle'
    };
    return icons[status] || 'CheckCircle';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
              <Icon name={getStatusIcon(activity.status)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">
                  {activity.action}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </span>
              </div>
              
              <p className="text-sm text-foreground font-medium mb-1">
                {activity.title}
              </p>
              
              {activity.recipients > 0 && (
                <p className="text-xs text-muted-foreground">
                  {activity.recipients} recipients
                </p>
              )}
            </div>
            
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(activity.status)} bg-muted`}>
              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;