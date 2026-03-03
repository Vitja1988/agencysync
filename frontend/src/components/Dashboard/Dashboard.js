import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UsersIcon, DocumentTextIcon, ClipboardDocumentListIcon, ClockIcon } from '@heroicons/react/24/outline';

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
    { name: 'Total Clients', value: stats.clients, icon: UsersIcon, color: 'bg-blue-500' },
    { name: 'Active Proposals', value: stats.proposals, icon: DocumentTextIcon, color: 'bg-green-500' },
    { name: 'Pending Tasks', value: stats.tasks.pending, icon: ClipboardDocumentListIcon, color: 'bg-yellow-500' },
    { name: 'Hours Logged', value: stats.hours.toFixed(1), icon: ClockIcon, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Clients */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Clients</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentClients.length > 0 ? (
            recentClients.map((client) => (
              <div key={client.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {client.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No clients yet. <a href="/clients" className="text-primary-600 hover:text-primary-500">Add your first client</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;