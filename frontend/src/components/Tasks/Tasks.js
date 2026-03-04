import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatters';

function Tasks({ user }) {
  const { t } = useTranslation();

  const COLUMNS = useMemo(() => [
    { id: 'todo', title: t('todo'), color: 'bg-slate-100 dark:bg-slate-800/50 border-t-slate-300 dark:border-t-slate-700' },
    { id: 'in-progress', title: t('in_progress'), color: 'bg-blue-50 dark:bg-blue-900/10 border-t-blue-400' },
    { id: 'review', title: t('review'), color: 'bg-amber-50 dark:bg-amber-900/10 border-t-amber-400' },
    { id: 'done', title: t('done'), color: 'bg-emerald-50 dark:bg-emerald-900/10 border-t-emerald-400' }
  ], [t]);

  const PRIORITIES = useMemo(() => ({
    low: { color: 'badge-neutral', label: t('priority_low') },
    medium: { color: 'badge-warning', label: t('priority_medium') },
    high: { color: 'badge-danger', label: t('priority_high') }
  }), [t]);

  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', client_id: '', status: 'todo', priority: 'medium', due_date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, clientsRes] = await Promise.all([axios.get('/api/tasks'), axios.get('/api/clients')]);
      setTasks(tasksRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) await axios.put(`/api/tasks/${editingTask.id}`, formData);
      else await axios.post('/api/tasks', formData);
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      try {
        await axios.put(`/api/tasks/${draggedTask.id}`, { ...draggedTask, status });
        fetchData();
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
    setDraggedTask(null);
  };

  const openModal = (task = null, defaultStatus = 'todo') => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title, description: task.description || '', client_id: task.client_id || '',
        status: task.status, priority: task.priority, due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', client_id: '', status: defaultStatus, priority: 'medium', due_date: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title">{t('tasks')}</h1>
          <p className="page-subtitle">{t('manage_workflow')}</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-1" /> {t('add_task')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-violet-500 rounded-full animate-spin border-t-transparent" /></div>
      ) : (
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
          <div className="flex gap-6 h-full min-w-max pb-4 px-1">
            {COLUMNS.map((column, i) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card flex flex-col border-t-4 flex-1 min-w-[250px] max-w-[320px] ${column.color}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{column.title}</h3>
                  <span className="bg-white/50 dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    {getTasksByStatus(column.id).length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-2">
                  <AnimatePresence>
                    {getTasksByStatus(column.id).map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 
                                 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-slate-900 dark:text-white leading-tight pr-2">{task.title}</h4>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(task)} className="text-slate-400 hover:text-violet-600"><PencilIcon className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                          </div>
                        </div>

                        {task.description && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>}

                        <div className="mt-4 flex items-center justify-between">
                          {task.client_name ? (
                            <span className="text-[10px] font-medium tracking-wide uppercase text-slate-400">{task.client_name}</span>
                          ) : <span />}
                          <span className={`badge text-[10px] py-0.5 px-2 ${PRIORITIES[task.priority]?.color || PRIORITIES.medium.color}`}>
                            {PRIORITIES[task.priority]?.label || t('priority_medium')}
                          </span>
                        </div>

                        {task.due_date && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                            {formatDate(task.due_date, user?.date_format)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => openModal(null, column.id)}
                  className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 
                           text-slate-500 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 
                           transition-colors flex items-center justify-center"
                >
                  <PlusIcon className="w-4 h-4 mr-1" /> {t('create')}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6"> {editingTask ? t('edit') : t('create')} </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('title')} *</label>
                  <input type="text" required className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('description')}</label>
                  <textarea rows="3" className="input-field resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('clients')}</label>
                  <select className="input-field" value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}>
                    <option value="">{t('select_client')}</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                    <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                    <select className="input-field" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="low">{t('priority_low')}</option>
                      <option value="medium">{t('priority_medium')}</option>
                      <option value="high">{t('priority_high')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('due_date')}</label>
                  <input type="date" className="input-field" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                  <button type="button" onClick={closeModal} className="btn-secondary">{t('cancel')}</button>
                  <button type="submit" className="btn-primary">{editingTask ? t('update') : t('create')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Tasks;