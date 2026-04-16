import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Calendar, Clock, CheckCircle, Circle, Trash2, Edit3, Filter, Search } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('None');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    task_name: '',
    description: '',
    priority: 'Medium'
  });

  // API Base URL - Update this to your Django backend URL
  const API_BASE_URL = 'http://localhost:8000/api'; // Change this to your backend URL
  // const API_BASE_URL = 'https://todo-app-fullstack-nrfk.onrender.com/api';

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tasks/`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.task_name.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          priority: newTask.priority || 'Medium'
        })
      });
      if (!response.ok) throw new Error('Failed to create task');
      
      await fetchTasks(); // Refresh tasks list
      setNewTask({ task_name: '', description: '', priority: 'Medium' });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask.task_name.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: editingTask.task_name,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority || 'Medium'
        })
      });
      if (!response.ok) throw new Error('Failed to update task');
      
      await fetchTasks(); // Refresh tasks list
      setEditingTask(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (task) => {
    setEditingTask({ ...task });
    setShowAddForm(false);
  };

  const toggleTaskStatus = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      const newStatus = task.status === 'Completed' ? 'In-Progress' : 'Completed';
      
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update task status');
      
      await fetchTasks(); // Refresh tasks list
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete task');
      
      await fetchTasks(); // Refresh tasks list
    } catch (err) {
      setError(err.message);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'text-green-600';
      case 'In-Progress': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'Priority') {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In-Progress').length
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-xs sm:text-sm text-gray-600">Dashboard</p>
            </div>
          </div>
          
          {/* Stats Cards - Responsive */}
          <div className="flex flex-1 justify-center lg:justify-end">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md lg:max-w-none lg:w-auto lg:flex lg:space-x-4">
              <div className="bg-blue-50 px-3 sm:px-4 py-2 rounded-lg border border-blue-200 text-center">
                <div className="text-sm sm:text-lg font-bold text-blue-600">{taskStats.total}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="bg-orange-50 px-3 sm:px-4 py-2 rounded-lg border border-orange-200 text-center">
                <div className="text-sm sm:text-lg font-bold text-orange-600">{taskStats.inProgress}</div>
                <div className="text-xs text-orange-600">In Progress</div>
              </div>
              <div className="bg-green-50 px-3 sm:px-4 py-2 rounded-lg border border-green-200 text-center">
                <div className="text-sm sm:text-lg font-bold text-green-600">{taskStats.completed}</div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingTask(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-colors text-sm sm:text-base lg:ml-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Add/Edit Task Form */}
        <div className={`${showAddForm || editingTask ? 'w-full sm:w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Task name"
                  value={editingTask ? editingTask.task_name : newTask.task_name}
                  onChange={(e) => editingTask 
                    ? setEditingTask(prev => ({...prev, task_name: e.target.value}))
                    : setNewTask(prev => ({...prev, task_name: e.target.value}))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <textarea
                  placeholder="Description"
                  value={editingTask ? editingTask.description : newTask.description}
                  onChange={(e) => editingTask 
                    ? setEditingTask(prev => ({...prev, description: e.target.value}))
                    : setNewTask(prev => ({...prev, description: e.target.value}))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTask(null);
                  }}
                  className="px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task List Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters and Search */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="All">All Status</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="All">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="None">Sort by</option>
                  <option value="Priority">Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task Cards */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading tasks...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-red-800 font-medium mb-2">Error Loading Tasks</h3>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={fetchTasks}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {sortedTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mr-3 ${getStatusColor(task.status)}`}
                          disabled={loading}
                        >
                          {task.status === 'Completed' ? 
                            <CheckCircle className="w-5 h-5" /> : 
                            <Circle className="w-5 h-5" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {task.task_name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={() => startEditing(task)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
                          title="Edit task"
                          disabled={loading}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                          title="Delete task"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status) === 'text-green-600' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.updated_at && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Updated: </span>
                          {new Date(task.updated_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {task.created_at && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Created: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredTasks.length === 0 && !loading && !error && (
                  <div className="col-span-full text-center py-12">
                    <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-4">
                      {searchTerm || filterStatus !== 'All' 
                        ? 'Try adjusting your search or filters' 
                        : 'Create your first task to get started'}
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Add Your First Task
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
