import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AuthContext from '../context/AuthContext';

const Sidebar = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const userRole = user?.user?.role;

  // Define navigation links based on user role
  const getNavLinks = () => {
    const baseLinks = [
      { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['Admin', 'Operator', 'Management'] },
    ];

    const roleSpecificLinks = [
      // Admin: Full access
      { to: '/items', label: 'Items List', icon: CubeIcon, roles: ['Admin', 'Operator', 'Management'] },
      { to: '/add-item', label: 'Add Item', icon: CubeIcon, roles: ['Admin', 'Operator'] },

      { to: '/issuance', label: 'Issuance', icon: ClipboardDocumentListIcon, roles: ['Admin', 'Operator'] },
      { to: '/employees', label: 'Employees', icon: UsersIcon, roles: ['Admin'] },
      { to: '/categories', label: 'Categories', icon: Cog6ToothIcon, roles: ['Admin'] },
      { to: '/reports', label: 'Reports', icon: ChartBarIcon, roles: ['Admin', 'Management'] },
      { to: '/users', label: 'Users', icon: UsersIcon, roles: ['Admin'] },
    ];

    return [...baseLinks, ...roleSpecificLinks].filter(link => 
      link.roles.includes(userRole)
    );
  };

    const navLinks = getNavLinks();

  return (
    <aside className={`h-screen bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out z-50 ${
      isOpen ? 'w-64' : 'w-0 overflow-hidden'
    } md:relative fixed md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 min-w-[16rem]">
        <span className="text-xl font-bold text-blue-700 tracking-wide">NA Inventory</span>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 py-6 px-2 space-y-2 min-w-[16rem]">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-150 text-gray-700 hover:bg-blue-50 hover:text-blue-700 ${location.pathname.startsWith(to) ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
          >
            <Icon className="h-5 w-5 mr-3" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 