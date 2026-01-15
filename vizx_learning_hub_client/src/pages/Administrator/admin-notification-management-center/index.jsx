import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import Button from '../../../components/ui/Button';

import NotificationFilters from './components/NotificationFilters';
import NotificationStats from './components/NotificationStats';
import NotificationList from './components/NotificationList';
import CreateNotificationModal from './components/CreateNotificationModal';
import NotificationTemplates from './components/NotificationTemplates';
import RecentActivity from './components/RecentActivity';

const NotificationManagementCenter = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: 'Weekly Learning Progress Report',
      message: 'Your weekly summary of completed modules and achievements',
      type: 'email',
      recipients: 150,
      status: 'sent',
      scheduledDate: 'Oct 15, 2024',
      scheduledTime: '09:00 AM',
      deliveryRate: 96,
      delivered: 144,
      openRate: 68
    },
    {
      id: 2,
      title: 'New AI Fundamentals Course',
      message: 'Exciting new course on AI basics is now available',
      type: 'push',
      recipients: 89,
      status: 'scheduled',
      scheduledDate: 'Oct 18, 2024',
      scheduledTime: '10:00 AM',
      deliveryRate: 0,
      delivered: 0,
      openRate: 0
    },
    {
      id: 3,
      title: 'Maintain Your Learning Streak',
      message: 'Do not break your 15-day learning streak!',
      type: 'in-app',
      recipients: 67,
      status: 'sent',
      scheduledDate: 'Oct 14, 2024',
      scheduledTime: '08:00 AM',
      deliveryRate: 94,
      delivered: 63,
      openRate: 72
    },
    {
      id: 4,
      title: 'Achievement Unlocked: ML Expert',
      message: 'Congratulations on completing the Machine Learning path',
      type: 'email',
      recipients: 12,
      status: 'sent',
      scheduledDate: 'Oct 13, 2024',
      scheduledTime: '02:30 PM',
      deliveryRate: 100,
      delivered: 12,
      openRate: 85
    },
    {
      id: 5,
      title: 'Upcoming Live Session Reminder',
      message: 'Join us tomorrow for an interactive AI workshop',
      type: 'push',
      recipients: 45,
      status: 'draft',
      scheduledDate: '-',
      scheduledTime: '-',
      deliveryRate: 0,
      delivered: 0,
      openRate: 0
    }
  ];

  const handleCreateNotification = (formData) => {
    console.log('Creating notification:', formData);
    // Add API call here
  };

  const handleEdit = (id) => {
    console.log('Editing notification:', id);
    // Navigate to edit page or open modal
  };

  const handleDelete = (id) => {
    console.log('Deleting notification:', id);
    // Add delete logic with confirmation
  };

  const handleView = (id) => {
    console.log('Viewing notification:', id);
    // Open detailed view modal
  };

  const handleDuplicate = (id) => {
    console.log('Duplicating notification:', id);
    // Clone notification and open create modal
  };

  const handleSelectTemplate = (template) => {
    console.log('Selected template:', template);
    setIsCreateModalOpen(true);
    // Pre-fill modal with template data
  };

  const handleExport = () => {
    console.log('Exporting notifications data');
    // Export to CSV or PDF
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <NavigationSidebar 
        isCollapsed={sidebarCollapsed}
        userRole="admin"
      />

      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}
        pb-16 md:pb-0
      `}>
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                iconName="Menu"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Notification Management Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create, schedule, and manage learner notifications
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                onClick={() => setIsCreateModalOpen(true)}
              >
                New Notification
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 space-y-6">
          {/* Notification Stats */}
          <NotificationStats />

          {/* Filters */}
          <NotificationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            audienceFilter={audienceFilter}
            onAudienceChange={setAudienceFilter}
          />

          {/* Notification List */}
          <NotificationList
            notifications={mockNotifications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDuplicate={handleDuplicate}
          />

          {/* Templates and Activity Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Notification Templates */}
            <div className="xl:col-span-2">
              <NotificationTemplates onSelectTemplate={handleSelectTemplate} />
            </div>

            {/* Recent Activity */}
            <div className="xl:col-span-1">
              <RecentActivity />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                fullWidth
                iconName="Users"
                iconPosition="left"
                onClick={() => navigate('/user-profile-management')}
              >
                Manage Users
              </Button>
              <Button
                variant="outline"
                fullWidth
                iconName="BarChart3"
                iconPosition="left"
                onClick={() => navigate('/cohort-performance-analytics')}
              >
                View Analytics
              </Button>
              <Button
                variant="outline"
                fullWidth
                iconName="Settings"
                iconPosition="left"
                onClick={() => navigate('/administrative-system-configuration')}
              >
                Settings
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNotification}
      />
    </div>
  );
};

export default NotificationManagementCenter;
