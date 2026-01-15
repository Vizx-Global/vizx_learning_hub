import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const EmployeeSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            section: 'Overview',
            items: [
                { label: 'Dashboard', path: '/employee-dashboard', icon: 'LayoutDashboard' },
            ]
        },
        {
            section: 'My Learning',
            items: [
                { label: 'My Courses', path: '/employee-courses', icon: 'BookOpen' },
                { label: 'Learning Paths', path: '/employee-learning-paths', icon: 'Compass' },
            ]
        },
        {
            section: 'Community & Games',
            items: [
                { label: 'Leaderboards', path: '/employee-leaderboards', icon: 'Trophy' },
                { label: 'Learning Games', path: '/employee-games', icon: 'Gamepad2' },
            ]
        },
        {
            section: 'Account',
            items: [
                { label: 'Profile Settings', path: '/employee-profile', icon: 'Settings' }
            ]
        }
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed left-0 top-0 h-full bg-card border-r border-border z-50
                w-64 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:h-screen
            `}>
                {/* Header content matches EmployeeLayout branding but simplified */}
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Icon name="GraduationCap" size={20} color="white" />
                        </div>
                        <span className="font-bold text-lg">Learning Hub</span>
                    </div>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
                    {menuItems.map((section, idx) => (
                        <div key={idx}>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                                {section.section}
                            </h4>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => {
                                            navigate(item.path);
                                            if (window.innerWidth < 768) onClose();
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${isActive(item.path)
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }
                                        `}
                                    >
                                        <Icon name={item.icon} size={18} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default EmployeeSidebar;