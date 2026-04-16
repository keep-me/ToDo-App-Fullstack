import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { Task, UpdateTaskRequest } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, task: UpdateTaskRequest) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.task_name);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editStatus, setEditStatus] = useState(task.status);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(task.task_name);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(task.task_name);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editDescription.trim()) return;

    setIsUpdating(true);
    const success = await onUpdate(task.id, {
      task_name: editName.trim(),
      description: editDescription.trim(),
      status: editStatus,
      priority: editPriority,
    });

    if (success) {
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await onDelete(task.id);
    }
  };

  const statusColor = task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isUpdating}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                disabled={isUpdating}
              />
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'In-Progress' | 'Completed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isUpdating}
              >
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isUpdating}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 truncate">{task.task_name}</h3>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{task.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {task.status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div>Created: {formatDate(task.created_at)}</div>
                <div>Updated: {formatDate(task.updated_at)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="ml-4 flex items-start space-x-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isUpdating || !editName.trim() || !editDescription.trim()}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Save changes"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;