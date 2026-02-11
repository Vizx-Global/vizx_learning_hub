import React, { useState } from 'react';
import ChatWindow from '../../../components/Chat/ChatWindow';
import EmployeeSidebar from '../../../components/ui/EmployeeSidebar';
import MobileEmployeeSidebar from '../../../components/ui/MobileEmployeeSidebar';

const EmployeeChat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <div className="h-screen flex-shrink-0 overflow-hidden hidden md:block">
        <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      <MobileEmployeeSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <main className="h-full w-full overflow-hidden pb-20 md:pb-0">
          <ChatWindow fullPage={true} />
        </main>
      </div>
    </div>
  );
};

export default EmployeeChat;
