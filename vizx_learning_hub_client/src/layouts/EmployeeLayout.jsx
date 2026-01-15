import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/ui/EmployeeSidebar';
import EmployeeHeader from '../components/ui/EmployeeHeader';

const EmployeeLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <EmployeeSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
                {/* Header */}
                <EmployeeHeader
                    toggleSidebar={() => setIsSidebarOpen(true)}
                />

                {/* Main Content Area */}
                <main className="flex-1 container mx-auto px-4 py-8 overflow-x-hidden">
                    <Outlet />
                </main>

                {/* Simple Footer */}
                <footer className="border-t border-border py-6 bg-muted/20 mt-auto">
                    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} AI Learning Hub. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default EmployeeLayout;