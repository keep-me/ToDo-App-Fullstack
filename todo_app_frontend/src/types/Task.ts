export interface Task {
  id: number;
  task_name: string;
  description: string;
  status: 'In-Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  task_name: string;
  description: string;
  status: 'In-Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}

export interface UpdateTaskRequest {
  task_name: string;
  description: string;
  status: 'In-Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}