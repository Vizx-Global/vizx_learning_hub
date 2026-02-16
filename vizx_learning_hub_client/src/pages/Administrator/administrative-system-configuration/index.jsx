import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Import all admin components
import SystemSettings from './components/SystemSettings';
import UserManagement from './components/UserManagement';
import ContentSyncConfig from './components/ContentSyncConfiguration';
import GamificationSettings from './components/GamificationSettings';
import NotificationConfig from './components/NotificationConfig';
import SecuritySettings from './components/SecuritySettings';
import IntegrationSettings from './components/IntegrationSettings';
import AuditLogViewer from './components/AuditLogViewer';

// Constants
const TABS = [
  { id: 'system', label: 'System Settings', icon: 'Settings', component: SystemSettings },
  { id: 'users', label: 'User Management', icon: 'Users', component: UserManagement },
  { id: 'content', label: 'Content Sync', icon: 'Cloud', component: ContentSyncConfig },
  { id: 'gamification', label: 'Gamification', icon: 'Trophy', component: GamificationSettings },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', component: NotificationConfig },
  { id: 'security', label: 'Security', icon: 'Shield', component: SecuritySettings },
  { id: 'integrations', label: 'Integrations', icon: 'Plug', component: IntegrationSettings },
  { id: 'audit', label: 'Audit Logs', icon: 'FileText', component: AuditLogViewer }
];

const PAGE_TITLE = 'System Configuration - AI Learning Hub';
const PAGE_DESCRIPTION = 'Administrative system configuration and management';

const AdministrativeSystemConfiguration = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeComponent = useMemo(() => {
    const tab = TABS.find(tab => tab.id === activeTab);
    return tab?.component || null;
  }, [activeTab]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const mainContentClass = `transition-all duration-300 ease-in-out ${
    sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
  } pb-20 md:pb-0`;

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <NavigationSidebar 
          isCollapsed={sidebarCollapsed}
          userRole="admin"
        />

        <div className={mainContentClass}>
          <Header 
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          <TabNavigation 
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <MainContent activeComponent={activeComponent} />
        </div>
      </div>
    </>
  );
};

// Header Component
const Header = ({ sidebarCollapsed, onToggleSidebar, searchTerm, onSearchChange }) => (
  <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <SidebarToggle 
          collapsed={sidebarCollapsed}
          onToggle={onToggleSidebar}
        />
        <PageTitle />
      </div>

      <div className="flex items-center gap-3">
        <SearchInput 
          value={searchTerm}
          onChange={onSearchChange}
        />
        <Button variant="outline" size="sm" iconName="HelpCircle">
          Help
        </Button>
      </div>
    </div>
  </header>
);

// Sidebar Toggle Component
const SidebarToggle = ({ collapsed, onToggle }) => (
  <button
    onClick={onToggle}
    className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    <Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
  </button>
);

// Page Title Component
const PageTitle = () => (
  <div>
    <h1 className="text-xl font-semibold text-foreground">System Configuration</h1>
    <p className="text-sm text-muted-foreground">
      Manage platform settings and configurations
    </p>
  </div>
);

// Search Input Component
const SearchInput = ({ value, onChange }) => (
  <div className="relative hidden md:block">
    <Icon 
      name="Search" 
      size={18} 
      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
    />
    <input
      type="text"
      placeholder="Search settings..."
      value={value}
      onChange={onChange}
      className="pl-10 pr-4 py-2 w-64 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
    />
  </div>
);

// Tab Navigation Component
const TabNavigation = ({ tabs, activeTab, onTabChange }) => (
  <div className="bg-card border-b border-border overflow-x-auto">
    <div className="flex gap-1 p-2 min-w-max">
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  </div>
);

// Individual Tab Button Component
const TabButton = ({ tab, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    }`}
    aria-selected={isActive}
  >
    <Icon name={tab.icon} size={18} />
    <span className="text-sm whitespace-nowrap">{tab.label}</span>
  </button>
);

// Main Content Component
const MainContent = ({ activeComponent: ActiveComponent }) => (
  <main className="p-6">
    <div className="max-w-7xl mx-auto">
      {ActiveComponent ? <ActiveComponent /> : (
        <div className="text-center text-muted-foreground">
          No component selected
        </div>
      )}
    </div>
  </main>
);

export default AdministrativeSystemConfiguration;