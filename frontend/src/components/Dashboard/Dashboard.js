import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation, Trans } from 'react-i18next';
import {
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  XMarkIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency, getCurrencySymbol } from '../../utils/formatters';

function Dashboard({ user }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    clients: 0, proposals: 0, tasks: { total: 0, pending: 0 }, hours: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('hideTutorial') !== 'true';
  });

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hideTutorial', 'true');
  };

  const getColorGradient = (colorName) => {
    const gradients = {
      violet: 'from-violet-500 to-violet-600',
      indigo: 'from-indigo-500 to-indigo-600',
      blue: 'from-blue-500 to-blue-600',
      emerald: 'from-emerald-500 to-emerald-600',
      teal: 'from-teal-500 to-teal-600',
      rose: 'from-rose-500 to-rose-600',
      amber: 'from-amber-500 to-amber-600',
      fuchsia: 'from-fuchsia-500 to-fuchsia-600'
    };
    return gradients[colorName] || gradients.violet;
  };

  // Mock data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4780 },
    { name: 'May', value: 5890 },
    { name: 'Jun', value: 6390 },
  ];

  const timeData = [
    { name: 'Mon', hours: 6 },
    { name: 'Tue', hours: 7.5 },
    { name: 'Wed', hours: 5 },
    { name: 'Thu', hours: 8 },
    { name: 'Fri', hours: 4.5 },
  ];

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
        tasks: { total: tasks.length, pending: tasks.filter(t => t.status !== 'done').length },
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
    { name: t('clients'), value: stats.clients, icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', href: '/clients' },
    { name: t('proposals'), value: stats.proposals, icon: DocumentTextIcon, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', href: '/proposals' },
    { name: t('tasks'), value: stats.tasks.pending, icon: ClipboardDocumentListIcon, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', href: '/tasks' },
    { name: t('time_tracking'), value: stats.hours.toFixed(1) + 'h', icon: ClockIcon, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', href: '/time' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 h-full">
        <SparklesIcon className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="page-header relative z-10">
        <div>
          <h1 className="page-title">{t('dashboard')}</h1>
          <p className="page-subtitle">{t('welcome')}! Here's your agency overview.</p>
        </div>
        <button className="btn-primary">
          <SparklesIcon className="w-5 h-5" />
          {t('generate_report')}
        </button>
      </div>

      {/* Quick Start Tutorial */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="p-8 relative z-10">
            <button
              onClick={dismissTutorial}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <PlayIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{t('tutorial_title')}</h2>
            </div>

            <p className="text-indigo-100 mb-8 max-w-2xl text-lg">
              {t('tutorial_intro')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold">{t('tutorial_ai_title')}</h3>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  <Trans i18nKey="tutorial_ai_desc">
                    Go to <strong>Settings &gt; Integrations</strong>, add your OpenAI key, then click "New Proposal" to instantly draft pitches using the AI Magic button.
                  </Trans>
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-300" />
                  <h3 className="font-bold">{t('tutorial_sevdesk_title')}</h3>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  {t('tutorial_sevdesk_desc')}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold">{t('tutorial_kanban_title')}</h3>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  <Trans i18nKey="tutorial_kanban_desc">
                    Head over to the <strong>Tasks</strong> tab. We've built a premium drag-and-drop Kanban board so you can visually track your team's progress.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={stat.href} className="glass-card flex items-center gap-4 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 group cursor-pointer h-full">
              <div className={`p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="glass-card lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('revenue_overview')}</h2>
            <span className="badge badge-success flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-3 h-3" /> +12.5%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(v) => `${getCurrencySymbol(user?.currency)}${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Tracking Chart */}
        <div className="glass-card h-full flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Hours Logged (This Week)</h2>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('recent_clients')}</h2>
          <Link to="/clients" className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline">
            {t('view_all')}
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentClients.length > 0 ? (
            recentClients.map((client) => (
              <div key={client.id} className="py-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColorGradient(client.color)} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{client.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{client.email || 'No email'}</p>
                  </div>
                </div>
                <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                  {client.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">No clients found. Add some!</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;