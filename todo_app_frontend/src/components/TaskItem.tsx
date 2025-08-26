import React, { useState } from 'react';
import { CheckCircle, RotateCcw, Edit, Trash2, Save, X } from 'lucide-react';
import { Task, UpdateTaskRequest } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, updates: UpdateTaskRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.task_name);
  const [editDescription, setEditDescription] = useState(task.description);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async () => {
    const newStatus = task.status === 'In-Progress' ? 'Completed' : 'In-Progress';
    await onUpdate(task.id, { status: newStatus });
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    
    await onUpdate(task.id, {
      task_name: editName.trim(),
      description: editDescription.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(task.task_name);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const isCompleted = task.status === 'Completed';

  return (
    <div className={`bg-white border-l-4 ${isCompleted ? 'border-green-500' : 'border-blue-500'} rounded-xl shadow-sm p-6 transition-all hover:shadow-md border border-gray-100`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Task name"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            placeholder="Description"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {task.task_name}
            </h3>
            <div className="flex gap-1 ml-4">
              <button
                onClick={handleStatusChange}
                disabled={loading}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-all ${isCompleted ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                title={isCompleted ? 'Reopen task' : 'Mark as completed'}
              >
                {isCompleted ? <RotateCcw className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="p-2 rounded-lg text-blue-600 hover:bg-gray-100 hover:text-blue-700 transition-all"
                title="Edit task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                disabled={loading}
                className="p-2 rounded-lg text-red-600 hover:bg-gray-100 hover:text-red-700 transition-all"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className={`text-sm mb-3 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isCompleted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {task.status}
            </span>
            <span>Created: {formatDate(task.created_at)}</span>
            {task.updated_at !== task.created_at && (
              <span>Updated: {formatDate(task.updated_at)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};