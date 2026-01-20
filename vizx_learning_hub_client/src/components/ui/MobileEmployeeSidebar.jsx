import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Compass, Gamepad2, Menu as MenuIcon, X, Settings, Trophy, LogOut, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { Button } from './Button';

const MobileEmployeeSidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pathname = location.pathname;

  const quickLinks = [
    { title: 'Home', href: '/employee-dashboard', icon: LayoutDashboard },
    { title: 'Courses', href: '/employee-courses', icon: BookOpen },
    { title: 'Paths', href: '/employee-learning-paths', icon: Compass },
    { title: 'Games', href: '/employee-games', icon: Gamepad2 },
  ];

  const fullMenuLinks = [
    { title: 'Dashboard', href: '/employee-dashboard', icon: LayoutDashboard },
    { title: 'My Courses', href: '/employee-courses', icon: BookOpen },
    { title: 'Learning Paths', href: '/employee-learning-paths', icon: Compass },
    { title: 'Leaderboards', href: '/employee-leaderboards', icon: Trophy },
    { title: 'Learning Games', href: '/employee-games', icon: Gamepad2 },
    { title: 'Profile Settings', href: '/employee-profile', icon: Settings },
    { title: 'Notifications', href: '/employee-notifications', icon: Bell },
    { title: 'Help & Support', href: '/employee-help', icon: HelpCircle },
  ];

  const handleNavigate = (href) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/40 px-2 py-2 safe-area-bottom shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around">
          {quickLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <button key={link.title} onClick={() => handleNavigate(link.href)} className={cn("flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px]", isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70")}>
                <motion.div whileTap={{ scale: 0.9 }} className={cn("p-1.5 rounded-lg transition-colors", isActive && "bg-primary/10")}>
                  <link.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                </motion.div>
                <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{link.title}</span>
              </button>
            );
          })}
          <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-primary transition-all duration-200 min-w-[64px]">
            <motion.div whileTap={{ scale: 0.9 }} className="p-1.5 rounded-lg"><MenuIcon className="h-5 w-5" /></motion.div>
            <span className="text-[10px] font-medium tracking-tight">Menu</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden" />
            <motion.div initial={{ x: '-100%', y: '-100%', scale: 0.95, opacity: 0 }} animate={{ x: 0, y: 0, scale: 1, opacity: 1 }} exit={{ x: '-100%', y: '-100%', scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-4 left-4 z-[70] w-[calc(100%-32px)] max-w-sm max-h-[calc(100%-80px)] overflow-hidden bg-card rounded-3xl shadow-2xl border border-border/40 md:hidden flex flex-col">
              <div className="p-5 border-b border-border/30 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md">{getUserInitials()}</div>
                  <div>
                    <h3 className="font-bold text-sm leading-none mb-1 text-foreground">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{user?.jobTitle || 'Employee Account'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="rounded-full h-8 w-8 hover:bg-primary/10"><X className="h-4 w-4" /></Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <div className="px-2 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Main Navigation</div>
                {fullMenuLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <button key={link.title} onClick={() => handleNavigate(link.href)} className={cn("w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200", isActive ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-muted-foreground hover:bg-primary/5 hover:text-primary")}>
                      <link.icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : "text-primary/70")} />
                      <span>{link.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-4 border-t border-border/30 bg-secondary/10">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Sign Out</span>
                </button>
                <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between px-2">
                  <span className="text-[10px] font-medium text-muted-foreground/50 tracking-wider">VIZX HUB v1.0</span>
                  <div className="flex gap-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Connected</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileEmployeeSidebar;
