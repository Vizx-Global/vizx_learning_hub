import React, { useState } from 'react';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import UserContextHeader from '../../../components/ui/UserContextHeader';
import ChatWindow from '../../../components/Chat/ChatWindow';

const AdminChat = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'} h-screen`}>
        <main className="h-full w-full overflow-hidden">
          <ChatWindow fullPage={true} />
        </main>
      </div>
    </div>
  );
};

export default AdminChat;
