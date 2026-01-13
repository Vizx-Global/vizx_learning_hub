import React from 'react';
import Icon from '../../../components/AppIcon';

const NotificationList = ({ 
  notifications = [], 
  onEdit, 
  onDelete, 
  onView, 
  onDuplicate 
}) => {
  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-muted text-muted-foreground',
      scheduled: 'bg-warning/10 text-warning',
      sent: 'bg-success/10 text-success',
      failed: 'bg-destructive/10 text-destructive'
    };
    return badges[status] || badges.draft;
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: 'Mail',
      push: 'Bell',
      'in-app': 'MessageSquare',
      sms: 'MessageSquare'
    };
    return icons[type] || 'Bell';
  };

  if (notifications.length === 0) {
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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">Notification</th>
              <th className="text-left p-4 font-semibold text-foreground">Type</th>
              <th className="text-left p-4 font-semibold text-foreground">Audience</th>
              <th className="text-left p-4 font-semibold text-foreground">Status</th>
              <th className="text-left p-4 font-semibold text-foreground">Scheduled</th>
              <th className="text-left p-4 font-semibold text-foreground">Delivery</th>
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
                      {notification.type}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{notification.recipients}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(notification.status)}`}>
                    {notification.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">{notification.scheduledDate}</div>
                  <div className="text-xs text-muted-foreground">{notification.scheduledTime}</div>
                </td>
                <td className="p-4">
                  {notification.status === 'sent' && (
                    <div>
                      <div className="text-sm font-semibold text-success">
                        {notification.deliveryRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {notification.delivered}/{notification.recipients} delivered
                      </div>
                    </div>
                  )}
                  {notification.status === 'scheduled' && (
                    <div className="text-sm text-muted-foreground">Pending</div>
                  )}
                  {notification.status === 'draft' && (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(notification.id)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                      title="View"
                    >
                      <Icon name="Eye" size={18} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onEdit(notification.id)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                      title="Edit"
                    >
                      <Icon name="Edit" size={18} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onDuplicate(notification.id)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                      title="Duplicate"
                    >
                      <Icon name="Copy" size={18} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onDelete(notification.id)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                      title="Delete"
                    >
                      <Icon name="Trash" size={18} className="text-destructive" />
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