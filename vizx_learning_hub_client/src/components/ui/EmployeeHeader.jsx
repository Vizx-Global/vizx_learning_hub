import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';

const EmployeeHeader = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Mobile Menu Toggle & Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden p-2 hover:bg-accent rounded-lg"
                    >
                        <Icon name="Menu" size={24} />
                    </button>

                    <div className="md:hidden flex items-center gap-2">
                        <span className="font-semibold text-lg">My Dashboard</span>
                    </div>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-4 ml-auto">
                    {/* Simple Stats Summary */}
                    <div className="hidden md:flex items-center gap-4 mr-4 bg-muted/50 px-4 py-1.5 rounded-full border border-border">
                        <div className="flex items-center gap-1.5" title="Current Streak">
                            <Icon name="Flame" size={16} className="text-warning animate-pulse" />
                            <span className="font-mono font-medium text-sm">{user?.currentStreak || 0}</span>
                        </div>
                        <div className="w-px h-4 bg-border"></div>
                        <div className="flex items-center gap-1.5" title="Total Points">
                            <Icon name="Star" size={16} className="text-success" />
                            <span className="font-mono font-medium text-sm">{user?.totalPoints || 0} pts</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <span className="text-xs font-semibold text-primary">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                            title="Logout"
                        >
                            <Icon name="LogOut" size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default EmployeeHeader;