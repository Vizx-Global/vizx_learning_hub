import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import EmployeeSidebar from '../components/ui/EmployeeSidebar';
import EmployeeHeader from '../components/ui/EmployeeHeader';
import MobileEmployeeSidebar from '../components/ui/MobileEmployeeSidebar';

const EmployeeLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [prevLocation, setPrevLocation] = useState(useLocation());
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.pathname !== prevLocation.pathname) {
      setIsLoading(true);
      setPrevLocation(location);
    }
  }, [location, prevLocation]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="h-screen flex-shrink-0 overflow-hidden hidden md:block">
        <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      <MobileEmployeeSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-shrink-0">
          <EmployeeHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-1 sm:px-3 pb-20 sm:pb-20 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;