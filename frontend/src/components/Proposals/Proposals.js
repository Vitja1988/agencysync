import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    description: '',
    amount: '',
    status: 'draft',
    content: ''
  });

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
      if (editingProposal) {
        await axios.put(`/api/proposals/${editingProposal.id}`, formData);
      } else {
        await axios.post('/api/proposals', formData);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving proposal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) return;
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
        title: proposal.title,
        client_id: proposal.client_id,
        description: proposal.description || '',
        amount: proposal.amount || '',
        status: proposal.status,
        content: proposal.content || ''
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
    setFormData({ title: '', client_id: '', description: '', amount: '', status: 'draft', content: '' });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      sent: 'bg-blue-50 text-blue-700 border-blue-200',
      accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: '✏️',
      sent: '📤',
      accepted: '✅',
      rejected: '❌'
    };
    return icons[status] || '✏️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="mt-1 text-gray-500">Create and manage client proposals</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 
                   text-white font-medium rounded-xl shadow-lg shadow-violet-500/30 
                   hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Proposal
        </button>
      </div>

      {/* Proposals Grid */}
      {proposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal, index) => (
            <div
              key={proposal.id}
              className="group bg-white rounded-2xl border border-gray-100 p-6 
                       shadow-sm hover:shadow-xl hover:shadow-gray-200/50 
                       hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 
                                flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-violet-600" />
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openModal(proposal)}
                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 
                             rounded-lg transition-all duration-200"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 
                             rounded-lg transition-all duration-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-1">{proposal.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{proposal.client_name}</p>

              {proposal.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{proposal.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(proposal.status)}`}>
                  <span className="mr-1">{getStatusIcon(proposal.status)}</span>
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>
                {proposal.amount && (
                  <span className="text-xl font-bold text-gray-900">
                    ${parseFloat(proposal.amount).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <DocumentTextIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
          <p className="text-gray-500 mb-6">Create your first proposal to get started</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-6 py-3 bg-violet-600 text-white 
                     font-medium rounded-xl hover:bg-violet-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Proposal
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProposal ? 'Edit Proposal' : 'New Proposal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Proposal title"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Brief description..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  rows="5"
                  placeholder="Full proposal content..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200 resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 font-medium rounded-xl
                           hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 
                           text-white font-medium rounded-xl shadow-lg shadow-violet-500/30
                           hover:shadow-violet-500/50 transition-all duration-200"
                >
                  {editingProposal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Proposals;