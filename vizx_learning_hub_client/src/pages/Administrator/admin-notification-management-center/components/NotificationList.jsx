import React from 'react';
import Icon from '../../../../components/AppIcon';

const NotificationList = ({ 
  notifications = [], 
  onEdit, 
  onDelete, 
  onView, 
  onDuplicate,
  isLoading
}) => {
  const getStatusBadge = (status) => {
    const badges = {
      UNREAD: 'bg-primary/10 text-primary',
      READ: 'bg-muted text-muted-foreground',
      ARCHIVED: 'bg-warning/10 text-warning',
      DELETED: 'bg-destructive/10 text-destructive'
    };
    return badges[status] || badges.UNREAD;
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: 'Mail',
      push: 'Bell',
      'in-app': 'MessageSquare',
      sms: 'MessageSquare',
      SYSTEM: 'ShieldAlert',
      ACHIEVEMENT: 'Award',
      WELCOME: 'UserPlus'
    };
    return icons[type] || 'Bell';
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">No Notifications Found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first notification to engage with learners
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">Notification</th>
              <th className="text-left p-4 font-semibold text-foreground">Type</th>
              <th className="text-left p-4 font-semibold text-foreground">Status</th>
              <th className="text-left p-4 font-semibold text-foreground">Date</th>
              <th className="text-left p-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr
                key={notification.id}
                className="border-b border-border hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <div className="font-semibold text-foreground">{notification.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {notification.message}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={getTypeIcon(notification.type)} 
                      size={16} 
                      className="text-muted-foreground" 
                    />
                    <span className="text-sm text-foreground capitalize">
                      {notification.type?.toLowerCase()}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(notification.status)}`}>
                    {notification.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">{new Date(notification.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(notification.id)}
                      className="p-1.5 hover:bg-accent rounded-lg transition-colors group"
                      title="View"
                    >
                      <Icon name="Eye" size={16} className="text-muted-foreground group-hover:text-primary" />
                    </button>
                    <button
                      onClick={() => onDelete(notification.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors group"
                      title="Delete"
                    >
                      <Icon name="Trash" size={16} className="text-muted-foreground group-hover:text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationList;