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
import ViewNotificationModal from './components/ViewNotificationModal';
import notificationService from '../../../api/notificationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const NotificationManagementCenter = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading: isListLoading } = useQuery({
    queryKey: ['admin-notifications', statusFilter, typeFilter, searchQuery],
    queryFn: () => notificationService.getNotifications({ 
      status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined, 
      type: typeFilter !== 'all' ? typeFilter.toUpperCase() : undefined,
      all: 'true',
      search: searchQuery
    })
  });

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-notification-stats'],
    queryFn: () => notificationService.getAdminStats()
  });

  const broadcastMutation = useMutation({
    mutationFn: (data) => notificationService.broadcastNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-stats']);
      toast.success('Notification broadcasted successfully!');
    },
    onError: () => toast.error('Failed to broadcast notification')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['admin-notification-stats']);
      toast.success('Notification deleted');
    }
  });

  const notifications = notificationsData?.data?.data?.notifications || [];

  const handleCreateNotification = (formData) => {
    broadcastMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#1a1b1e',
      color: '#ffffff',
      customClass: {
        popup: 'rounded-[2rem] border border-border shadow-2xl',
        confirmButton: 'rounded-xl font-bold uppercase tracking-widest px-6 py-3',
        cancelButton: 'rounded-xl font-bold uppercase tracking-widest px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleEdit = (id) => {
    console.log('Editing notification:', id);
  };

  const handleView = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setViewingNotification(notification);
      setIsViewModalOpen(true);
    }
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
          <NotificationStats stats={statsData?.data?.data} isLoading={isStatsLoading} />

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
            notifications={notifications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDuplicate={handleDuplicate}
            isLoading={isListLoading}
          />

          {/* Templates and Activity Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Notification Templates */}
            <div className="xl:col-span-2">
              <NotificationTemplates onSelectTemplate={handleSelectTemplate} />
            </div>

            {/* Recent Activity */}
            <div className="xl:col-span-1">
              <RecentActivity activities={notifications.slice(0, 5)} isLoading={isListLoading} />
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

      {/* View Notification Modal */}
      <ViewNotificationModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingNotification(null);
        }}
        notification={viewingNotification}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default NotificationManagementCenter;
