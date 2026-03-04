import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';

function Proposals({ user }) {
  const { t } = useTranslation();
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [sendingToSevDesk, setSendingToSevDesk] = useState(null); // stores proposal id being sent
  const [formData, setFormData] = useState({ title: '', client_id: '', description: '', amount: '', status: 'draft', content: '' });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [proposalsRes, clientsRes] = await Promise.all([
        axios.get('/api/proposals'),
        axios.get('/api/clients')
      ]);
      setProposals(proposalsRes.data);
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
      if (editingProposal) await axios.put(`/api/proposals/${editingProposal.id}`, formData);
      else await axios.post('/api/proposals', formData);
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving proposal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      await axios.delete(`/api/proposals/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const openModal = (proposal = null) => {
    if (proposal) {
      setEditingProposal(proposal);
      setFormData({
        title: proposal.title, client_id: proposal.client_id, description: proposal.description || '',
        amount: proposal.amount || '', status: proposal.status, content: proposal.content || ''
      });
    } else {
      setEditingProposal(null);
      setFormData({ title: '', client_id: '', description: '', amount: '', status: 'draft', content: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProposal(null);
  };

  const handleSendToSevDesk = async (id) => {
    setSendingToSevDesk(id);
    try {
      const res = await axios.post('/api/integrations/sevdesk/invoice', { proposalId: id });
      alert(res.data.message || 'Sent to SevDesk successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send to SevDesk');
    } finally {
      setSendingToSevDesk(null);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.description) {
      alert('Please enter a short description first so the AI knows what to write about.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await axios.post('/api/integrations/ai/generate', {
        prompt: `Write a professional client proposal based on this description: ${formData.description}`
      });
      setFormData(prev => ({ ...prev, content: res.data.text }));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate AI content');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'badge-neutral', sent: 'badge-warning text-blue-700 dark:text-blue-300 border-blue-200 bg-blue-50 dark:bg-blue-900/30',
      accepted: 'badge-success', rejected: 'badge-danger'
    };
    return colors[status] || 'badge-neutral';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('proposals')}</h1>
          <p className="page-subtitle">{t('create_manage_proposals')}</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusIcon className="h-5 w-5" />
          {t('new_proposal')}
        </button>
      </div>

      {/* Proposals Grid */}
      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-violet-500 rounded-full animate-spin border-t-transparent" /></div>
      ) : proposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {proposals.map((proposal, i) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => openModal(proposal)} className="p-2 text-slate-400 hover:text-violet-600 transition-colors"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleDelete(proposal.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 leading-tight">{proposal.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">{proposal.client_name}</p>

                {proposal.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 flex-1 mb-4 italic">"{proposal.description}"</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
                  <span className={`badge py-1 px-3 border ${getStatusColor(proposal.status)}`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                  {proposal.amount && (
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(proposal.amount, user?.currency)}
                    </span>
                  )}
                </div>

                {/* SevDesk Action - Only show if accepted */}
                {proposal.status === 'accepted' && (
                  <button
                    onClick={() => handleSendToSevDesk(proposal.id)}
                    disabled={sendingToSevDesk === proposal.id}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                               bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm
                               hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {sendingToSevDesk === proposal.id ? (
                      <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                    ) : (
                      <PaperAirplaneIcon className="w-4 h-4" />
                    )}
                    {t('send_to_sevdesk')}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 glass-card">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <DocumentTextIcon className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('no_proposals')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t('create_first_proposal')}</p>
          <button onClick={() => openModal()} className="btn-primary mx-auto">
            <PlusIcon className="h-5 w-5" />
            {t('new_proposal')}
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6"> {editingProposal ? t('edit') : 'New Proposal'} </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                  <input type="text" required className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Client *</label>
                  <select required className="input-field" value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}>
                    <option value="">Select a client</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                  <input type="number" step="0.01" className="input-field" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                  <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description (Used for AI Prompt)</label>
                  <textarea rows="2" placeholder="e.g. A web design proposal for a bakery in Berlin" className="input-field resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Content</label>
                    <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={isGeneratingAI || !formData.description}
                      className="text-xs font-semibold flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-1 px-3 rounded-md hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {isGeneratingAI ? (
                        <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <SparklesIcon className="w-3.5 h-3.5" />
                      )}
                      {isGeneratingAI ? 'Generating...' : 'AI Magic Generate'}
                    </button>
                  </div>
                  <textarea rows="8" className="input-field resize-y min-h-[150px]" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                  <button type="button" onClick={closeModal} className="btn-secondary">{t('cancel')}</button>
                  <button type="submit" className="btn-primary">{editingProposal ? t('update') : t('create')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Proposals;