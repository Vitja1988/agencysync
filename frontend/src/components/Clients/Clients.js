import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });

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
      if (editingClient) {
        await axios.put(`/api/clients/${editingClient.id}`, formData);
      } else {
        await axios.post('/api/clients', formData);
      }
      fetchClients();
      closeModal();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
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
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', company: '', notes: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', company: '', notes: '' });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-gray-500">Manage your client relationships</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 
                   text-white font-medium rounded-xl shadow-lg shadow-violet-500/30 
                   hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                   text-gray-900 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                   transition-all duration-200"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              className="group bg-white rounded-2xl border border-gray-100 p-6 
                       shadow-sm hover:shadow-xl hover:shadow-gray-200/50 
                       hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 
                                  flex items-center justify-center">
                    <span className="text-lg font-bold text-violet-700">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{client.name}</h3>
                    {client.company && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                        {client.company}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  client.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {client.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {client.phone}
                  </p>
                )}
              </div>

              {client.notes && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{client.notes}</p>
              )}

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModal(client)}
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 
                           rounded-lg transition-all duration-200"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 
                           rounded-lg transition-all duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try a different search term' : 'Get started by adding your first client'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-6 py-3 bg-violet-600 text-white 
                       font-medium rounded-xl hover:bg-violet-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Client
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingClient ? 'Edit Client' : 'Add Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Client name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="client@company.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Company name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Additional information..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                           transition-all duration-200 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {editingClient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;