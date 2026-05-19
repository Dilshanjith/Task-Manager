import axios from 'axios';
import { auth } from './firebase';

const API_URL = 'https://task-manager-h5ga.onrender.com'; // Corrected port to match launchSettings.json

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Task {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export const taskService = {
  getTasks: () => api.get<Task[]>('/api/tasks'),
  createTask: (data: { title: string; description?: string }) => api.post<Task>('/api/tasks', data),
  updateTask: (id: number, data: Partial<Task>) => api.put<Task>(`/api/tasks/${id}`, data),
  deleteTask: (id: number) => api.delete(`/api/tasks/${id}`),
};

export default api;
