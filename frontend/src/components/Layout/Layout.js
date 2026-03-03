import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Proposals', href: '/proposals', icon: DocumentTextIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Time Tracking', href: '/time', icon: ClockIcon },
];

function Layout({ children, user, onLogout }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200/80">
        {/* Logo */}
        <div className="flex items-center h-20 px-8 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 
                            flex items-center justify-center shadow-lg shadow-violet-500/30">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 
                             bg-clip-text text-transparent">AgencySync</h1>
              <p className="text-xs text-gray-400 font-medium">Client Management</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl
                           transition-all duration-200 group ${
                  isActive
                    ? 'text-violet-600 bg-violet-50 border border-violet-100 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 
                              flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.company_name || 'Agency Owner'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-600 
                         hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-72">
        <main className="p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;