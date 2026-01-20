import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Bell, Plus, ChevronDown, Menu, User, LogOut, Eye, CheckCircle, Clock, AlertTriangle, FileText, Settings, Calendar } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../ThemeToggle';

const Link = ({ href, children, className, onClick, ...props }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) { onClick(e); return; }
    window.history.pushState({}, "", href);
    window.dispatchEvent(new Event("popstate"));
  };
  return <a href={href} className={className} onClick={handleClick} {...props}>{children}</a>;
};

const EmployeeHeader = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const userInitials = getUserInitials();

  const quickActions = [
    { label: 'New Task', icon: CheckCircle, href: '/employee-dashboard/tasks/new', color: 'from-emerald-500 to-teal-500' },
    { label: 'Log Time', icon: Clock, href: '/employee-dashboard/attendance/log', color: 'from-blue-500 to-cyan-500' },
    { label: 'Report Issue', icon: AlertTriangle, href: '/employee-dashboard/issues/new', color: 'from-amber-500 to-orange-500' },
    { label: 'Submit Report', icon: FileText, href: '/employee-dashboard/reports/new', color: 'from-violet-500 to-purple-500' },
  ];

  const notifications = [
    { id: 1, title: 'Task Assigned', description: 'New task from your manager', time: '1 hour ago', type: 'info' },
    { id: 2, title: 'Meeting Reminder', description: 'Team meeting in 30 minutes', time: '2 hours ago', type: 'warning' },
    { id: 3, title: 'Timesheet Approved', description: 'Last week\'s timesheet has been approved', time: '1 day ago', type: 'success' },
  ];

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleKeyDown = (e) => { if (e.key === 'Enter' && searchQuery.trim()) console.log('Searching for:', searchQuery); };
  const handleLogout = async () => { try { await logout(); navigate('/login'); } catch (error) { console.error('Logout failed:', error); } };
  const handleViewAllNotifications = () => { window.history.pushState({}, '', '/employee-dashboard/notifications'); window.dispatchEvent(new Event('popstate')); };

  return (
    <header className="sticky px-4 py-4 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/40 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-primary text-white hidden md:flex items-center justify-center transition-colors" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input placeholder="Search tasks, reports..." className="pl-10 pr-4 h-9 rounded-lg bg-secondary/30 border-border/40 focus-visible:ring-primary/30 text-sm" value={searchQuery} onChange={handleSearch} onKeyDown={handleKeyDown} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="hidden sm:flex gap-2 h-9 px-3 rounded-lg bg-primary text-white shadow-sm hover:shadow transition-all duration-200">
              <Plus className="h-3.5 w-3.5" /><span className="text-sm font-medium">Quick Actions</span><ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl border-border/40 shadow-lg backdrop-blur-sm bg-background/95">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground/80 px-2 py-1.5">Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-border/30" />
            {quickActions.map((action) => (
              <DropdownMenuItem key={action.label} className="p-2 rounded-lg hover:bg-secondary/50 focus:bg-secondary/50 cursor-pointer transition-colors">
                <Link href={action.href} className="flex items-center w-full cursor-pointer gap-3">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm`}><action.icon className="h-4 w-4 text-white" /></div>
                  <div className="flex flex-col"><span className="text-sm font-medium">{action.label}</span><span className="text-xs text-muted-foreground/70">Click to create</span></div>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden sm:block"><ThemeToggle /></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-primary/10">
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 text-white border-2 border-background text-xs font-semibold">{notifications.length}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 rounded-xl border-border/40 shadow-lg backdrop-blur-sm bg-background/95">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground/80 p-0">Notifications</DropdownMenuLabel>
              <Badge className="text-xs px-2 py-0.5 bg-primary/10 text-primary">{notifications.length} New</Badge>
            </div>
            <DropdownMenuSeparator className="my-1 bg-border/30" />
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 gap-2 hover:bg-secondary/50 rounded-lg cursor-pointer border-b border-border/20 last:border-0" onClick={() => { console.log('Notification clicked:', notification.id); }}>
                  <div className="flex items-start justify-between w-full gap-3">
                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1"><p className="text-sm font-medium truncate">{notification.title}</p><span className="text-xs text-muted-foreground/70 whitespace-nowrap">{notification.time}</span></div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">{notification.description}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="my-1 bg-border/30" />
            <DropdownMenuItem className="justify-center text-sm font-medium text-primary hover:text-primary/90 cursor-pointer py-2" onClick={handleViewAllNotifications}><Eye className="h-3.5 w-3.5 mr-2" />View all notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative rounded-xl h-10 px-2 gap-2 hover:bg-primary/10">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm">{userInitials}</div>
              <div className="hidden md:flex flex-col items-start"><span className="text-sm font-medium">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}</span><span className="text-xs text-muted-foreground/70">{user?.jobTitle || 'Employee'}</span></div>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-border/40 shadow-lg backdrop-blur-sm bg-background/95">
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm">{userInitials}</div>
                <div className="flex flex-col"><span className="text-sm font-medium">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}</span><span className="text-xs text-muted-foreground/70">{user?.email || 'No email'}</span></div>
              </div>
            </div>
            <DropdownMenuSeparator className="my-1 bg-border/30" />
            <DropdownMenuItem className="p-2.5 rounded-lg hover:bg-secondary/50 focus:bg-secondary/50 cursor-pointer gap-3"><User className="h-4 w-4 text-muted-foreground" /><Link href="/employee-dashboard/profile" className="w-full cursor-pointer text-sm">My Profile</Link></DropdownMenuItem>
            <DropdownMenuItem className="p-2.5 rounded-lg hover:bg-secondary/50 focus:bg-secondary/50 cursor-pointer gap-3"><Settings className="h-4 w-4 text-muted-foreground" /><Link href="/employee-dashboard/settings" className="w-full cursor-pointer text-sm">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem className="p-2.5 rounded-lg hover:bg-secondary/50 focus:bg-secondary/50 cursor-pointer gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><Link href="/employee-dashboard/attendance" className="w-full cursor-pointer text-sm">Attendance</Link></DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-border/30" />
            <DropdownMenuItem className="p-2.5 rounded-lg hover:bg-red-50/50 focus:bg-red-50/50 cursor-pointer gap-3 text-red-500 hover:text-red-600" onClick={handleLogout}><LogOut className="h-4 w-4" /><span className="text-sm font-medium">Logout</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default EmployeeHeader;