import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PlayIcon, StopIcon, TrashIcon, ClockIcon, InformationCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { formatDate, formatDateTime, formatDuration, parseDurationToHours } from '../../utils/formatters';

function TimeTracking({ user }) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [timerDescription, setTimerDescription] = useState('');
  const [timerClient, setTimerClient] = useState('');
  const [timerTask, setTimerTask] = useState('');
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [formData, setFormData] = useState({ description: '', client_id: '', task_id: '', hours: '', date: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    fetchData();
    return () => { if (timerInterval) clearInterval(timerInterval); };
  }, [timerInterval]);

  const fetchData = async () => {
    try {
      const [entriesRes, clientsRes, tasksRes] = await Promise.all([axios.get('/api/time'), axios.get('/api/clients'), axios.get('/api/tasks')]);
      setEntries(entriesRes.data);
      setClients(clientsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (!timerDescription) { alert(t('description') + ' *'); return; }
    setIsTimerRunning(true);
    setTimerStartTime(new Date().toISOString());
    const interval = setInterval(() => { setTimerSeconds(prev => prev + 1); }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = async () => {
    if (timerInterval) clearInterval(timerInterval);
    const hours = (timerSeconds / 3600).toFixed(2);
    const endTime = new Date().toISOString();
    try {
      await axios.post('/api/time', {
        description: timerDescription, client_id: timerClient || null, task_id: timerTask || null,
        hours: parseFloat(hours), date: format(new Date(), 'yyyy-MM-dd'),
        start_time: timerStartTime, end_time: endTime
      });
      setIsTimerRunning(false);
      setTimerSeconds(0);
      setTimerStartTime(null);
      setTimerDescription(''); setTimerClient(''); setTimerTask('');
      fetchData();
    } catch (error) { console.error('Error saving time entry:', error); }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert standard HH:mm into floating hours for proper DB schema parity
      const submitData = {
        ...formData,
        hours: parseDurationToHours(formData.hours)
      };
      await axios.post('/api/time', submitData);
      fetchData();
      closeModal();
    } catch (error) { console.error('Error saving time entry:', error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      await axios.delete(`/api/time/${id}`);
      fetchData();
    } catch (error) { console.error('Error deleting time entry:', error); }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ description: '', client_id: '', task_id: '', hours: '', date: format(new Date(), 'yyyy-MM-dd') });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Client', 'Task', 'Start Time', 'End Time', 'Hours'];
    const rows = entries.map(e => [
      `"${formatDate(e.date, user?.date_format)}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.client_name || ''}"`,
      `"${e.task_title || ''}"`,
      `"${e.start_time ? formatDateTime(e.start_time, user?.date_format, user?.time_format) : ''}"`,
      `"${e.end_time ? formatDateTime(e.end_time, user?.date_format, user?.time_format) : ''}"`,
      `"${formatDuration(e.hours)}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(row => row.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "time_tracking_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">{t('time_tracking')}</h1>
          <p className="page-subtitle">{t('track_billable')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="btn-secondary flex items-center bg-white dark:bg-slate-800">
            <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
            Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" /> {t('add_entry')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Timer Section */}
        <div className="glass-card lg:col-span-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-violet-500" /> {t('live_timer')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('description')}</label>
              <input type="text" placeholder={t('what_working_on')} className="input-field" value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} disabled={isTimerRunning} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('clients')}</label>
              <select className="input-field py-3 text-sm" value={timerClient} onChange={(e) => setTimerClient(e.target.value)} disabled={isTimerRunning}>
                <option value="">{t('select_client')}</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('tasks')}</label>
              <select className="input-field py-3 text-sm" value={timerTask} onChange={(e) => setTimerTask(e.target.value)} disabled={isTimerRunning}>
                <option value="">{t('select_task')}</option>
                {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              {!isTimerRunning ? (
                <button onClick={startTimer} className="w-full flex items-center justify-center p-3 h-[46px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                  <PlayIcon className="h-5 w-5" />
                </button>
              ) : (
                <button onClick={stopTimer} className="w-full flex items-center justify-center p-3 h-[46px] rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all animate-pulse">
                  <StopIcon className="h-5 w-5 mr-1" /> {formatTime(timerSeconds)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Total Hours Stat */}
        <div className="glass-card flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
            <ClockIcon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('total_logged')}</p>
          <p className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
            {formatDuration(totalHours)}
          </p>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="glass-card flex-1 overflow-hidden flex flex-col p-0 mt-6">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('recent_entries')}</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-violet-500 rounded-full animate-spin border-t-transparent" /></div>
        ) : entries.length > 0 ? (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('date')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('description')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('clients')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('hours')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{formatDate(entry.date, user?.date_format)}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">{entry.description}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                      {entry.client_name ? <span className="badge badge-neutral">{entry.client_name}</span> : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-violet-600 dark:text-violet-400">{formatDuration(entry.hours)}</td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                      <button onClick={() => setViewEntry(entry)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title={t('details')}>
                        <InformationCircleIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title={t('delete')}>
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            No time entries yet. Start the timer or add a manual entry.
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6"> {t('add_entry')} </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('description')} *</label>
                  <input type="text" required className="input-field" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('clients')}</label>
                  <select className="input-field" value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}>
                    <option value="">{t('select_client')}</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('tasks')}</label>
                  <select className="input-field" value={formData.task_id} onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}>
                    <option value="">{t('select_task')}</option>
                    {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('hours')} *</label>
                    <input type="text" placeholder="HH:mm or HH:mm:ss" required className="input-field" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('date')} *</label>
                    <input type="date" required className="input-field" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                  <button type="button" onClick={closeModal} className="btn-secondary">{t('cancel')}</button>
                  <button type="submit" className="btn-primary">{t('add_entry')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {viewEntry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('details')}</h2>
              <p className="text-slate-500 mb-6">{viewEntry.description}</p>

              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500">{t('clients')}:</span>
                  <span className="text-sm font-medium">{viewEntry.client_name || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500">{t('tasks')}:</span>
                  <span className="text-sm font-medium">{viewEntry.task_title || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500">{t('start_time')}:</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {viewEntry.start_time ? formatDateTime(viewEntry.start_time, user?.date_format, user?.time_format) : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500">{t('end_time')}:</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {viewEntry.end_time ? formatDateTime(viewEntry.end_time, user?.date_format, user?.time_format) : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">{t('hours')}:</span>
                  <span className="text-lg font-black text-violet-600 dark:text-violet-400">{formatDuration(viewEntry.hours)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-4">
                <button type="button" onClick={() => setViewEntry(null)} className="btn-primary w-full">{t('cancel')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TimeTracking;