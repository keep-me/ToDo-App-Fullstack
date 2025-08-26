import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Trash2,
  Edit3,
  Filter,
  Search,
  User,
  LogOut,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Task state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    task_name: "",
    description: "",
  });

  // API Base URL - Update this for local development
  const API_BASE_URL = "http://localhost:8000/api"; // For local development
  // const API_BASE_URL = 'https://todo-app-fullstack-nrfk.onrender.com/api'; // Production URL

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  // Set auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getAuthToken();
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      setInitialLoading(false);
    }
  }, []);

  // Handle authentication (login/register)
  const handleAuth = async () => {
    setAuthLoading(true);
    setError(null);

    try {
      const endpoint = authMode === "login" ? "login/" : "register/";
      const payload =
        authMode === "login"
          ? { username: authForm.username, password: authForm.password }
          : {
              username: authForm.username,
              email: authForm.email,
              password: authForm.password,
            };

      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Authentication failed");
      }

      // Store tokens and user data
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setAuthForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      setTasks([]);
    }
  };

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(
        "Failed to fetch tasks. Please check if the Django server is running."
      );
      console.error("Fetch tasks error:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  // Load tasks when user logs in
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setInitialLoading(false);
    }
  }, [user]);

  const handleAddTask = async () => {
    if (!newTask.task_name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to create task");
      }

      await fetchTasks();
      setNewTask({ task_name: "", description: "" });
      setShowAddForm(false);
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Create task error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask.task_name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          task_name: editingTask.task_name,
          description: editingTask.description,
          status: editingTask.status,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to update task");
      }

      await fetchTasks();
      setEditingTask(null);
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error("Update task error:", err);
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
      setError(null);
      const task = tasks.find((t) => t.id === id);
      const newStatus =
        task.status === "Completed" ? "In-Progress" : "Completed";

      const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...task, status: newStatus }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to update task status");
      }

      await fetchTasks();
    } catch (err) {
      setError("Failed to update task status. Please try again.");
      console.error("Toggle status error:", err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error("Delete task error:", err);
    }
  };

  const getPriorityColor = (status) => {
    switch (status) {
      case "In-Progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "In-Progress":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    inProgress: tasks.filter((t) => t.status === "In-Progress").length,
  };

  // Authentication form component
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-gray-600 mt-2">
              {authMode === "login" ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={authForm.username}
                onChange={(e) =>
                  setAuthForm((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              />
            </div>

            {authMode === "register" && (
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleAuth()}
                />
              </div>
            )}

            <div>
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {authMode === "login"
                    ? "Signing in..."
                    : "Creating account..."}
                </>
              ) : authMode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setError(null);
                setAuthForm({
                  username: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {authMode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Main app interface
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Task Manager
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Welcome, {user.username}
              </p>
            </div>
          </div>

          {/* Stats (centered) */}
          <div className="flex flex-1 justify-center">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md">
              <div className="bg-blue-50 px-3 sm:px-4 py-2 rounded-lg border border-blue-200 text-center">
                <div className="text-sm sm:text-lg font-bold text-blue-600">
                  {taskStats.total}
                </div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="bg-orange-50 px-3 sm:px-4 py-2 rounded-lg border border-orange-200 text-center">
                <div className="text-sm sm:text-lg font-bold text-orange-600">
                  {taskStats.inProgress}
                </div>
                <div className="text-xs text-orange-600">In Progress</div>
              </div>
              <div className="bg-green-50 px-3 sm:px-4 py-2 rounded-lg border border-green-200 text-center">
                <div className="text-sm sm:text-lg font-bold text-green-600">
                  {taskStats.completed}
                </div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
            </div>
          </div>

          {/* Right side: Add Task + Logout */}
          <div className="flex items-center justify-end space-x-3 mt-3 lg:mt-0">
            {/* Add Task with subtle separation */}
            <div className="pr-3 border-r border-gray-300">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingTask(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors text-sm sm:text-base shadow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors text-sm sm:text-base shadow"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 sm:px-6 py-3">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm flex-1">{error}</p>
            <button
              onClick={fetchTasks}
              className="ml-2 flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Add/Edit Task Form */}
        <div
          className={`${
            showAddForm || editingTask ? "w-full sm:w-80" : "w-0"
          } transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}
        >
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTask ? "Edit Task" : "Add New Task"}
            </h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Task name"
                  value={
                    editingTask ? editingTask.task_name : newTask.task_name
                  }
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask((prev) => ({
                          ...prev,
                          task_name: e.target.value,
                        }))
                      : setNewTask((prev) => ({
                          ...prev,
                          task_name: e.target.value,
                        }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <textarea
                  placeholder="Description"
                  value={
                    editingTask ? editingTask.description : newTask.description
                  }
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      : setNewTask((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingTask
                    ? "Update Task"
                    : "Add Task"}
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
              </div>
            </div>
          </div>

          {/* Task Cards */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading && tasks.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading tasks...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mr-3 ${getStatusColor(task.status)}`}
                          disabled={loading}
                        >
                          {task.status === "Completed" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>

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
                          Created:{" "}
                          {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredTasks.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12">
                    <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tasks found
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-4">
                      {searchTerm || filterStatus !== "All"
                        ? "Try adjusting your search or filters"
                        : "Create your first task to get started"}
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
