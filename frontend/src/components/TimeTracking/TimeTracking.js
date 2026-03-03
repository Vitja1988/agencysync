import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, PlayIcon, StopIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

function TimeTracking() {
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [timerDescription, setTimerDescription] = useState('');
  const [timerClient, setTimerClient] = useState('');
  const [timerTask, setTimerTask] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    client_id: '',
    task_id: '',
    hours: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchData();
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, clientsRes, tasksRes] = await Promise.all([
        axios.get('/api/time'),
        axios.get('/api/clients'),
        axios.get('/api/tasks')
      ]);
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
    if (!timerDescription) {
      alert('Please enter a description');
      return;
    }
    setIsTimerRunning(true);
    setTimerStartTime(new Date());
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = async () => {
    if (timerInterval) clearInterval(timerInterval);
    const hours = (timerSeconds / 3600).toFixed(2);
    
    try {
      await axios.post('/api/time', {
        description: timerDescription,
        client_id: timerClient || null,
        task_id: timerTask || null,
        hours: parseFloat(hours),
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      setIsTimerRunning(false);
      setTimerSeconds(0);
      setTimerDescription('');
      setTimerClient('');
      setTimerTask('');
      fetchData();
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
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
      await axios.post('/api/time', formData);
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) return;
    try {
      await axios.delete(`/api/time/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      description: '',
      client_id: '',
      task_id: '',
      hours: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  if (loading) {
    return <div className="text-center py-8">Loading time entries...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Entry
        </button>
      </div>

      {/* Timer Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Timer</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              placeholder="What are you working on?"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              disabled={isTimerRunning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={timerClient}
              onChange={(e) => setTimerClient(e.target.value)}
              disabled={isTimerRunning}
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Task</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={timerTask}
              onChange={(e) => setTimerTask(e.target.value)}
              disabled={isTimerRunning}
            >
              <option value="">Select task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {!isTimerRunning ? (
              <button
                onClick={startTimer}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Start
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <StopIcon className="h-5 w-5 mr-2" />
                Stop ({formatTime(timerSeconds)})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-primary-500" />
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Hours Logged</p>
            <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
          </div>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Entries</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(entry.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{entry.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.client_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.hours}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No time entries yet. Start the timer or add a manual entry.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Time Entry</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  >
                    <option value="">No client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.task_id}
                    onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                  >
                    <option value="">No task</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hours *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                    <input
                      type="date"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeTracking;