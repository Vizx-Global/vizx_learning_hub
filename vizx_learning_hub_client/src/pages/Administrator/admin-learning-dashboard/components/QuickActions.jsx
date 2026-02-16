import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/AppIcon';
import { useAuth } from '../../../../contexts/AuthContext';

const QuickActions = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const isManager = hasRole('MANAGER');

  const adminActions = [
    {
      id: 'create-path',
      title: 'Create Path',
      description: 'Design a new career learning journey',
      icon: 'PlusCircle',
      color: 'bg-primary text-primary-foreground',
      action: () => navigate('/learning-path-management'),
      roles: ['ADMIN']
    },
    {
      id: 'team-analytics',
      title: 'Performance',
      description: 'Analyze department learning KPIs',
      icon: 'BarChart3',
      color: 'bg-secondary text-secondary-foreground',
      action: () => navigate('/cohort-performance-analytics'),
      roles: ['MANAGER', 'ADMIN']
    },
    {
      id: 'user-profiles',
      title: 'Manage Users',
      description: 'View and manage team profiles',
      icon: 'Users',
      color: 'bg-success text-success-foreground',
      action: () => navigate('/user-profile-management'),
      roles: ['MANAGER', 'ADMIN']
    },
    {
      id: 'system-config',
      title: 'System Config',
      description: 'Configure platform settings',
      icon: 'Settings',
      color: 'bg-amber-500 text-white',
      action: () => navigate('/administrative-system-configuration'),
      roles: ['ADMIN']
    }
  ];

  const availableActions = adminActions.filter(action => 
    action.roles.some(role => hasRole(role))
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {availableActions.map((action) => (
        <button
          key={action.id}
          onClick={action.action}
          className={`
            relative p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
            ${action.color} group text-left overflow-hidden h-full flex flex-col justify-between
          `}
        >
          <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon name={action.icon} size={48} />
          </div>
          
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm mb-3 relative z-10">
            <Icon name={action.icon} size={16} className="stroke-[2.5]" />
          </div>

          <div className="relative z-10">
            <h4 className="font-black text-[10px] uppercase tracking-tighter leading-tight">{action.title}</h4>
          </div>
        </button>
      ))}

      <button
        onClick={() => navigate('/admin-chat')}
        className="relative p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-violet-600 text-white group text-left overflow-hidden h-full flex flex-col justify-between"
      >
        <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon name="MessageSquare" size={48} />
        </div>
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm mb-3 relative z-10">
          <Icon name="MessageSquare" size={16} className="stroke-[2.5]" />
        </div>
        <div className="relative z-10">
          <h4 className="font-black text-[10px] uppercase tracking-tighter leading-tight">Management Chat</h4>
        </div>
      </button>
    </div>
  );
};

export default QuickActions;
