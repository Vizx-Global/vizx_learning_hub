import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, LogOut, Settings, Bell, HelpCircle, LayoutDashboard, BookOpen, Compass, Trophy, Gamepad2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const employeeNavItems = [
  { title: 'Dashboard', href: '/employee-dashboard', icon: LayoutDashboard },
  { title: 'My Courses', href: '/employee-courses', icon: BookOpen },
  { title: 'Learning Paths', href: '/employee-learning-paths', icon: Compass },
  { title: 'Leaderboards', href: '/employee-leaderboards', icon: Trophy },
  { title: 'Learning Games', href: '/employee-games', icon: Gamepad2 },
  { title: 'Notifications', href: '/employee-notifications', icon: Bell, showBadge: true },
  { title: 'Profile Settings', href: '/employee-profile', icon: Settings },
];

const EmployeeSidebar = ({ isOpen = true, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = location.pathname;
  const [isHovering, setIsHovering] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const initial = {};
    employeeNavItems.forEach((item) => {
      if (item.isDropdown) initial[item.title.toLowerCase()] = pathname === item.href;
    });
    return initial;
  });

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const getUserRoleDisplay = () => user?.jobTitle || 'Employee';
  const userInitials = getUserInitials();
  const userRoleDisplay = getUserRoleDisplay();
  const isExpanded = isOpen || isHovering;

  const toggleDropdown = (title, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdowns((prev) => ({ ...prev, [title.toLowerCase()]: !prev[title.toLowerCase()] }));
  };

  const handleLinkClick = (href) => {
    navigate(href);
    if (window.innerWidth < 768 && setIsOpen) setIsOpen(false);
  };

  const isExactActive = (href) => pathname === href;
  const hasActiveChild = (items) => items?.some((subItem) => isExactActive(subItem.href)) || false;

  useEffect(() => {
    const updatedDropdowns = { ...openDropdowns };
    employeeNavItems.forEach((item) => {
      if (item.isDropdown && item.items && item.items.some((subItem) => isExactActive(subItem.href))) {
        updatedDropdowns[item.title.toLowerCase()] = true;
      }
    });
    setOpenDropdowns(updatedDropdowns);
  }, [pathname]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try { await logout(); navigate('/login'); } catch (error) { console.error('Logout failed:', error); }
  };

  return (
    <div className={`h-screen transition-all duration-300 ease-in-out relative flex flex-col ${isExpanded ? 'w-[210px]' : 'w-[70px]'} border-r border-border/40 bg-gradient-to-b from-card/95 to-card/85 backdrop-blur-sm overflow-hidden`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <a href="/employee-dashboard" onClick={(e) => { e.preventDefault(); handleLinkClick('/employee-dashboard'); }} className="h-16 border-b border-border/30 flex items-center justify-center relative group cursor-pointer">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div key="expanded-logo" className="flex items-center justify-center px-4 w-full h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
              <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" alt="Learning Hub" className="h-10 w-auto object-contain" />
            </motion.div>
          ) : (
            <motion.div key="collapsed-logo" className="relative group-hover:scale-110 transition-transform duration-200" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.3 }}>
              <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1768516447/Untitled_design__4__1-removebg-preview_ivfmvy.png" alt="LH" className="h-8 w-8 object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </a>

      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden space-y-1">
        {employeeNavItems.map((item) => {
          const isItemActive = isExactActive(item.href);
          const dropdownHasActiveChild = item.isDropdown ? hasActiveChild(item.items) : false;

          return (
            <div key={item.title} className="space-y-0.5">
              {item.isDropdown ? (
                <>
                  <button onClick={(e) => toggleDropdown(item.title, e)} className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 group relative overflow-hidden', isItemActive && 'bg-primary/5 text-primary', dropdownHasActiveChild && !isItemActive && 'text-primary/80')}>
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                    <div className="flex items-center gap-3 min-w-0 relative z-10">
                      <motion.div className={cn('h-7 w-7 rounded-md flex items-center justify-center transition-all duration-200', isItemActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground group-hover:text-primary/80 group-hover:bg-primary/5')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><item.icon className="h-3.5 w-3.5" /></motion.div>
                      <AnimatePresence>{isExpanded && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden tracking-wide">{item.title}</motion.span>}</AnimatePresence>
                    </div>
                    {isExpanded && <motion.div className="flex-shrink-0 ml-2 relative z-10" animate={{ rotate: openDropdowns[item.title.toLowerCase()] ? 0 : 0 }}>{openDropdowns[item.title.toLowerCase()] ? <ChevronDown className="h-3 w-3 text-muted-foreground/70" /> : <ChevronRight className="h-3 w-3 text-muted-foreground/70" />}</motion.div>}
                  </button>
                  <AnimatePresence>
                    {isExpanded && openDropdowns[item.title.toLowerCase()] && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="ml-11 space-y-0.5 overflow-hidden">
                        {item.items.map((subItem) => {
                          const isSubItemActive = isExactActive(subItem.href);
                          return (
                            <a key={subItem.title} href={subItem.href} onClick={(e) => { e.preventDefault(); handleLinkClick(subItem.href); }} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-150 relative overflow-hidden group', isSubItemActive && 'bg-primary/5 text-primary')}>
                              <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                              <motion.div className={cn('h-6 w-6 rounded-sm flex items-center justify-center relative z-10 transition-all duration-200', isSubItemActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground/70 group-hover:text-primary/80 group-hover:bg-primary/5')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><subItem.icon className="h-3 w-3" /></motion.div>
                              <span className="whitespace-nowrap tracking-wide relative z-10">{subItem.title}</span>
                            </a>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <a href={item.href} onClick={(e) => { e.preventDefault(); handleLinkClick(item.href); }} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 relative overflow-hidden group', isItemActive && 'bg-primary/5 text-primary')}>
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                  <motion.div className={cn('h-7 w-7 rounded-md flex items-center justify-center transition-all duration-200 relative z-10', isItemActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground group-hover:text-primary/80 group-hover:bg-primary/5')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><item.icon className="h-3.5 w-3.5" /></motion.div>
                  <AnimatePresence>{isExpanded && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden tracking-wide relative z-10">{item.title}</motion.span>}</AnimatePresence>
                  {item.showBadge && unreadCount > 0 && (
                    <div className={cn("ml-auto bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center relative z-10", !isExpanded && "absolute top-1 right-1")}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </a>
              )}
            </div>
          );
        })}
      </nav>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-3 pb-3 space-y-1">
            <div className="grid grid-cols-3 gap-1">
              <motion.button className="h-8 rounded-md flex items-center justify-center hover:bg-primary/5 transition-all duration-200 group relative overflow-hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleLinkClick('/employee-dashboard/settings')}>
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                <Settings className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary/80 transition-colors relative z-10" />
              </motion.button>
              <motion.button className="h-8 rounded-md flex items-center justify-center hover:bg-primary/5 transition-all duration-200 group relative overflow-hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleLinkClick('/employee-dashboard/notifications')}>
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                <Bell className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary/80 transition-colors relative z-10" />
              </motion.button>
              <motion.button className="h-8 rounded-md flex items-center justify-center hover:bg-primary/5 transition-all duration-200 group relative overflow-hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleLinkClick('/employee-dashboard/help')}>
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary/80 transition-colors relative z-10" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("border-t border-border/30 p-4 transition-all duration-300", !isExpanded && "px-2")}>
        <AnimatePresence>
          {isExpanded ? (
            <motion.div key="expanded-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm">{userInitials}</div>
                <div className="hidden md:flex flex-col items-start min-w-0"><span className="text-sm font-medium truncate w-full">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}</span><span className="text-xs text-muted-foreground/70 truncate w-full">{userRoleDisplay}</span></div>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-red-500/80 hover:text-red-600 hover:bg-red-50/50 text-xs font-normal transition-colors" onClick={handleLogout}><LogOut className="h-3.5 w-3.5" />Logout</Button>
            </motion.div>
          ) : (
            <motion.div key="collapsed-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500/80 hover:text-red-600 hover:bg-red-50/50 flex items-center justify-center transition-colors" onClick={handleLogout} title="Logout"><LogOut className="h-5 w-5" /></Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>{isExpanded && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-3"><div className="pt-2 border-t border-border/20"><p className="text-xs text-muted-foreground/60 text-center">v1.0.0</p></div></motion.div>}</AnimatePresence>
    </div>
  );
};

export default EmployeeSidebar;