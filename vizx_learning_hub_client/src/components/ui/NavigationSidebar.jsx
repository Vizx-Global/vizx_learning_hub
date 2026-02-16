import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Icon from '../AppIcon';

const NavigationSidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, hasRole, logout } = useAuth();
  const { chatUnreadCount, unreadCount } = useNotifications();
  
  const navigationItems = [
    { section: 'My Learning', items: [{ label: 'Dashboard', path: '/admin-learning-dashboard', icon: 'LayoutDashboard', roles: ['ADMIN', 'MANAGER'] }] },
    { section: 'Content Management', items: [
      { label: 'Learning Paths', path: '/learning-path-management', icon: 'BookOpen', roles: ['ADMIN'] },
      { label: 'Content Categories', path: '/content-categories-management', icon: 'Tags', roles: ['ADMIN'] }
    ] },
     { section: 'User Administration', items: [
      { label: 'User Profiles', path: '/user-profile-management', icon: 'Users', roles: ['ADMIN', 'MANAGER'] },
      { label: 'Departments', path: '/department-management', icon: 'Building', roles: ['ADMIN', 'MANAGER'] }
    ] },
     { section: 'Competition', items: [{ label: 'Leaderboards', path: '/gamification-leaderboards', icon: 'Trophy', roles: ['ADMIN', 'MANAGER'] }] },
     { section: 'Communication', items: [
      { label: 'Live Chat', path: '/admin-chat', icon: 'MessageSquare', roles: ['ADMIN', 'MANAGER'] }
    ] },
        { section: 'Notification Manager', items: [{ label: 'Notifications', path: '/notification-management-center', icon: 'Bell', roles: ['ADMIN'] }] },
    { section: 'Performance Analytics', items: [{ label: 'Cohort Analytics', path: '/cohort-performance-analytics', icon: 'Activity', roles: ['ADMIN', 'MANAGER'] }] },
    { section: 'Games & Challenges', items: [{ label: 'Learning Games', path: '/interactive-learning-games-hub', icon: 'Gamepad2', roles: ['ADMIN', 'MANAGER'] }] },
    // { section: 'System Integration', items: [{ label: 'Content Sync', path: '/learning-content-synchronization', icon: 'RefreshCw', roles: ['ADMIN'] }] },
    { section: 'System Configuration', items: [{ label: 'System Configuration', path: '/administrative-system-configuration', icon: 'Settings', roles: ['ADMIN'] }] }
  ];

  const hasAccess = (requiredRoles) => requiredRoles.some(role => hasRole(role));
  
  const filteredNavigation = navigationItems
    .map(section => ({ ...section, items: section.items.filter(item => hasAccess(item.roles)) }))
    .filter(section => section.items.length > 0);

  const handleNavigation = (path) => { navigate(path); setIsMobileOpen(false); };
  const handleLogout = () => { logout(); setIsMobileOpen(false); };
  const isActive = (path) => location.pathname === path;

  const getUserDisplayInfo = () => {
    if (!user) return { name: 'Loading...', points: 0, streak: 0 };
    return {
      name: `${user.firstName} ${user.lastName}`,
      points: user.totalPoints || 0,
      streak: user.currentStreak || 0,
      department: user.department || 'Not assigned'
    };
  };

  const userInfo = getUserDisplayInfo();

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setIsMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return (
      <aside className={`fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-transform duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'} md:translate-x-0`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />}
      <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="fixed top-4 left-4 z-50 md:hidden bg-card p-2 rounded-lg shadow-md">
        <Icon name="Menu" size={24} />
      </button>

      <aside className={`fixed left-0 top-0 h-full bg-[#000000] border-r border-border z-50 transition-transform duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <a 
              href="/admin-learning-dashboard" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/admin-learning-dashboard'); }} 
              className="flex items-center justify-center relative group cursor-pointer h-12"
            >
              <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.div 
                    key="expanded-logo" 
                    className="flex items-center justify-center px-2 w-full h-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" alt="Learning Hub" className="h-10 w-auto object-contain" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="collapsed-logo" 
                    className="relative group-hover:scale-110 transition-transform duration-200"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1768516447/Untitled_design__4__1-removebg-preview_ivfmvy.png" alt="LH" className="h-8 w-8 object-contain" />
                  </motion.div>
                )}
              </AnimatePresence>
            </a>
          </div>
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"><span className="text-white font-semibold text-sm">{user.firstName?.[0]}{user.lastName?.[0]}</span></div>
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground capitalize">{userInfo.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1"><Icon name="Flame" size={14} color="var(--color-warning)" /><span className="text-xs font-mono text-warning">{userInfo.streak} day streak</span></div>
                    <div className="flex items-center gap-1"><Icon name="Star" size={14} color="var(--color-success)" /><span className="text-xs font-mono text-success">{userInfo.points} pts</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {filteredNavigation.map((section, sectionIndex) => (
                <div key={section.section}>
                  {!isCollapsed && <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{section.section}</h3>}
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button key={item.path} onClick={() => handleNavigation(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ease-out group relative ${isActive(item.path) ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                        <div className="relative">
                          <Icon name={item.icon} size={20} className={`${isActive(item.path) ? 'text-primary-foreground' : 'text-current'}`} />
                          {isCollapsed && (
                            item.label === 'Live Chat' ? chatUnreadCount > 0 : 
                            item.label === 'Notifications' ? unreadCount > 0 : false
                          ) && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border border-card" />
                          )}
                        </div>
                        {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                        {!isCollapsed && (item.label === 'Live Chat' || item.label === 'Notifications') && (
                          (item.label === 'Live Chat' ? chatUnreadCount : unreadCount) > 0
                        ) && (
                          <div className={`ml-auto text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ${isActive(item.path) ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'}`}>
                            {(item.label === 'Live Chat' ? chatUnreadCount : unreadCount) > 9 ? '9+' : (item.label === 'Live Chat' ? chatUnreadCount : unreadCount)}
                          </div>
                        )}
                        {isActive(item.path) && !((item.label === 'Live Chat' || item.label === 'Notifications') && (item.label === 'Live Chat' ? chatUnreadCount : unreadCount) > 0) && (
                          <div className="ml-auto">
                            <div className={`w-2 h-2 rounded-full opacity-60 ${isActive(item.path) ? 'bg-primary-foreground' : 'bg-primary'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {sectionIndex < filteredNavigation.length - 1 && <div className="mt-6 border-t border-border" />}
                </div>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              {!isCollapsed && <div className="flex items-center gap-2"><div className="w-2 h-2 bg-success rounded-full animate-pulse" /><span className="text-xs text-muted-foreground">System Online</span></div>}
              <div className="flex items-center gap-2"><Icon name="Wifi" size={16} className="text-success" />{!isCollapsed && <span className="text-xs text-muted-foreground">Connected</span>}</div>
            </div>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ease-out text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${isCollapsed ? 'justify-center' : ''}`}>
              <Icon name="LogOut" size={20} />
              {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 md:hidden">
        <div className="flex items-center justify-around py-2">
          {filteredNavigation.slice(0, 4).map((section) =>
            section.items.map((item) => (
              <button key={item.path} onClick={() => handleNavigation(item.path)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon name={item.icon} size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NavigationSidebar;