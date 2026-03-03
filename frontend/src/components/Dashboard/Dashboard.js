import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UsersIcon, DocumentTextIcon, ClipboardDocumentListIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    proposals: 0,
    tasks: { total: 0, pending: 0 },
    hours: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, proposalsRes, tasksRes, timeRes] = await Promise.all([
        axios.get('/api/clients'),
        axios.get('/api/proposals'),
        axios.get('/api/tasks'),
        axios.get('/api/time')
      ]);

      const clients = clientsRes.data;
      const proposals = proposalsRes.data;
      const tasks = tasksRes.data;
      const timeEntries = timeRes.data;

      setStats({
        clients: clients.length,
        proposals: proposals.length,
        tasks: {
          total: tasks.length,
          pending: tasks.filter(t => t.status !== 'done').length
        },
        hours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
      });

      setRecentClients(clients.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      name: 'Total Clients', 
      value: stats.clients, 
      icon: UsersIcon, 
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      name: 'Active Proposals', 
      value: stats.proposals, 
      icon: DocumentTextIcon, 
      gradient: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600'
    },
    { 
      name: 'Pending Tasks', 
      value: stats.tasks.pending, 
      icon: ClipboardDocumentListIcon, 
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    { 
      name: 'Hours Logged', 
      value: stats.hours.toFixed(1), 
      icon: ClockIcon, 
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-500">Welcome back! Here's what's happening with your agency.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div 
            key={stat.name} 
            className="group relative bg-white rounded-2xl p-6 border border-gray-100
                       shadow-sm hover:shadow-xl hover:shadow-gray-200/50 
                       hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient top border */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 font-medium">Active</span>
              <span className="text-gray-400 ml-2">this month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Clients</h2>
              <p className="text-sm text-gray-500 mt-0.5">Your latest additions</p>
            </div>
            <a href="/clients" className="text-sm font-medium text-violet-600 hover:text-violet-700 
                                          hover:underline transition-colors">
              View all
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentClients.length > 0 ? (
              recentClients.map((client, index) => (
                <div 
                  key={client.id} 
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 
                             transition-colors animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 
                                    flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-700">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email || 'No email'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    client.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {client.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No clients yet</h3>
                <p className="text-sm text-gray-500 mb-4">Start by adding your first client</p>
                <a href="/clients" 
                   className="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm 
                              font-medium rounded-lg hover:bg-violet-700 transition-colors">
                  Add Client
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
          <p className="text-violet-100 mb-6">Get things done faster</p>
          
          <div className="space-y-3">
            <a href="/clients" 
               className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl 
                          hover:bg-white/20 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-4">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Add New Client</p>
                <p className="text-sm text-violet-200">Create a new client profile</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center
                              group-hover:translate-x-1 transition-transform">
                →
              </div>
            </a>
            
            <a href="/proposals" 
               className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl 
                          hover:bg-white/20 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-4">
                <DocumentTextIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Create Proposal</p>
                <p className="text-sm text-violet-200">Send a new quote to client</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center
                              group-hover:translate-x-1 transition-transform">
                →
              </div>
            </a>
            
            <a href="/tasks" 
               className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl 
                          hover:bg-white/20 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-4">
                <ClipboardDocumentListIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Manage Tasks</p>
                <p className="text-sm text-violet-200">View and update your kanban board</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center
                              group-hover:translate-x-1 transition-transform">
                →
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;