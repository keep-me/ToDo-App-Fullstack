import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Task, UpdateTaskRequest } from '../types/Task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: number, updates: UpdateTaskRequest) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
  loading: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask, loading }) => {
  const inProgressTasks = tasks.filter(task => task.status === 'In-Progress');
  const completedTasks = tasks.filter(task => task.status === 'Completed');

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks yet</h3>
        <p className="text-gray-500">Create your first task using the form above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* In-Progress Tasks */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">
            In Progress ({inProgressTasks.length})
          </h2>
        </div>
        
        {inProgressTasks.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-blue-700">No tasks in progress. All caught up! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Completed ({completedTasks.length})
          </h2>
        </div>
        
        {completedTasks.length === 0 ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-700">No completed tasks yet. Keep working! 💪</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};