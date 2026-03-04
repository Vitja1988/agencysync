import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', notes: '', color: 'violet' });

  const presetColors = ['violet', 'indigo', 'blue', 'emerald', 'teal', 'rose', 'amber', 'fuchsia'];

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

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get('/api/clients');
      setClients(res.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) await axios.put(`/api/clients/${editingClient.id}`, formData);
      else await axios.post('/api/clients', formData);
      fetchClients();
      closeModal();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      await axios.delete(`/api/clients/${id}`);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name, email: client.email || '', phone: client.phone || '',
        company: client.company || '', notes: client.notes || '', color: client.color || 'violet'
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', company: '', notes: '', color: presetColors[Math.floor(Math.random() * presetColors.length)] });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Notes'];
    const rows = clients.map(c => [
      `"${c.name}"`, `"${c.email || ''}"`, `"${c.phone || ''}"`, `"${c.company || ''}"`, `"${c.status}"`, `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('clients')}</h1>
          <p className="page-subtitle">{t('manage_clients')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="btn-secondary flex items-center bg-white dark:bg-slate-800">
            <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
            Export CSV
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            {t('add_client')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder={t('search_clients')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12 glass-panel"
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-violet-500 rounded-full animate-spin border-t-transparent" /></div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredClients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setViewingClient(client)}
                className="glass-card flex flex-col h-full cursor-pointer hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorGradient(client.color)} flex items-center justify-center shadow-lg`}>
                      <span className="text-lg font-bold text-white">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{client.name}</h3>
                      {client.company && (
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                          <BuildingOfficeIcon className="h-3.5 w-3.5 mr-1" />
                          {client.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                    {client.status === 'active' ? t('active') : t('inactive')}
                  </span>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  {client.email && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-slate-400" />
                      {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-slate-400" />
                      {client.phone}
                    </p>
                  )}
                </div>

                {client.notes && (
                  <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-2 mb-4 flex-1 italic">"{client.notes}"</p>
                )}

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={(e) => { e.stopPropagation(); openModal(client); }} className="p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 glass-card">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <MagnifyingGlassIcon className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm ? 'No clients found' : t('no_clients')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {searchTerm ? 'Try a different search term' : t('add_first_client')}
          </p>
          {!searchTerm && (
            <button onClick={() => openModal()} className="btn-primary mx-auto">
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('add_client')}
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {editingClient ? t('edit') : t('add_client')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('name')} *</label>
                  <input required className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('email')}</label>
                  <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('phone')}</label>
                  <input type="tel" className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('company')}</label>
                  <input type="text" className="input-field" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('notes')}</label>
                  <textarea rows="3" className="input-field resize-none" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Avatar Color</label>
                  <div className="flex items-center gap-3">
                    {presetColors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c })}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColorGradient(c)} transition-transform ${formData.color === c ? 'scale-110 ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-slate-900' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                  <button type="button" onClick={closeModal} className="btn-secondary">{t('cancel')}</button>
                  <button type="submit" className="btn-primary">{editingClient ? t('update') : t('create')}</button>
                </div>
              </form>
            </motion.div>
            {/* View Details Modal */}
            <AnimatePresence>
              {viewingClient && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColorGradient(viewingClient.color)} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl font-bold text-white">
                          {viewingClient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{viewingClient.name}</h2>
                        <span className={`badge mt-1 ${viewingClient.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                          {viewingClient.status === 'active' ? t('active') : t('inactive')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">{t('company')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingClient.company || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">{t('email')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white break-all">{viewingClient.email || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <PhoneIcon className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">{t('phone')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingClient.phone || '-'}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-slate-500 font-semibold mb-1">{t('notes')}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap">{(viewingClient.notes) ? `"${viewingClient.notes}"` : '-'}</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-4">
                      <button type="button" onClick={() => setViewingClient(null)} className="btn-primary w-full">{t('cancel')}</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Clients;