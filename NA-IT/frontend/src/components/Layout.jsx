import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AuthContext from '../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors hidden md:block"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          
          {/* User Info and Logout */}
          <div className="flex items-center">
            <span className="mr-4 text-gray-700 font-medium">
              Welcome, {user?.user?.username} ({user?.user?.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Logout
            </button>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 