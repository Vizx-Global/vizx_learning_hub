import React from 'react';
import Icon from '../../../../components/AppIcon';
import LiveUpdateIndicator from '../../../../components/ui/LiveUpdateIndicator';

const AdminHeader = ({ 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  isLoading, 
  lastSyncTime, 
  userInfo,
  user,
  title = "Command Center",
  icon = "Activity"
}) => {
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 w-full">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-accent/50 hover:bg-accent transition-all"
          >
            <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Icon name={icon} size={20} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <LiveUpdateIndicator
            type="sync"
            status={isLoading ? "syncing" : "connected"}
            lastUpdate={lastSyncTime ? new Date(lastSyncTime) : null}
            size="sm"
          />
          <div className="flex items-center gap-3 pl-4 border-l border-border/50">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">{userInfo?.name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{userInfo?.role || 'Admin'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-[2px]">
              <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center font-black text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
