import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import type { Task } from '../services/api';
import { auth } from '../services/firebase';
import { Plus, Trash2, CheckCircle, Circle, LogOut, Edit2, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await taskService.getTasks();
            setTasks(response.data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
            setError('Failed to fetch tasks. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setError('');

        try {
            if (editingTask) {
                // Update existing task
                const response = await taskService.updateTask(editingTask.id, {
                    ...editingTask,
                    title,
                    description
                });
                setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
                setEditingTask(null);
            } else {
                // Create new task
                const response = await taskService.createTask({ title, description });
                setTasks([response.data, ...tasks]);
            }
            setTitle('');
            setDescription('');
        } catch (err: any) {
            console.error('Failed to process task', err);
            setError(err.response?.data?.error || 'Failed to process task. Check backend connection.');
        }
    };

    const startEdit = (task: Task) => {
        if (task.isCompleted) return; // Only allow editing pending tasks
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        // Scroll to form on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingTask(null);
        setTitle('');
        setDescription('');
    };

    const handleToggle = async (task: Task) => {
        const originalTasks = [...tasks];
        // Optimistic update
        setTasks(tasks.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));

        try {
            const response = await taskService.updateTask(task.id, { 
                ...task, 
                isCompleted: !task.isCompleted 
            });
            // Sync with server response
            setTasks(prev => prev.map(t => t.id === task.id ? response.data : t));
        } catch (err) {
            setTasks(originalTasks);
            console.error('Failed to update task', err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await taskService.deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const filteredTasks = tasks
        .filter(t => {
            if (filter === 'pending') return !t.isCompleted;
            if (filter === 'completed') return t.isCompleted;
            return true;
        })
        .sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return (
        <div className="container">
            <header className="header-actions">
                <div>
                    <h1>My Tasks</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Stay organized and productive</p>
                </div>
                <button
                    onClick={() => auth.signOut()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-muted)', padding: '0.5rem' }}
                >
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="dashboard-grid">
                {/* Create Task Form */}
                <div className="glass animate-fade-in" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1rem' }}>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                    {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            placeholder="Task title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Description (optional)..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="submit"
                                style={{ 
                                    backgroundColor: 'var(--primary)', 
                                    color: 'white', 
                                    padding: '0.75rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem',
                                    flex: 2
                                }}
                            >
                                {editingTask ? <Edit2 size={18} /> : <Plus size={18} />}
                                {editingTask ? 'Update Task' : 'Add Task'}
                            </button>
                            {editingTask && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.1)', 
                                        color: 'white', 
                                        padding: '0.75rem', 
                                        flex: 1 
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Task List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="filter-buttons">
                        {(['all', 'pending', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    backgroundColor: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: filter === f ? 'white' : 'var(--text-muted)'
                                }}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading tasks...</p>
                    ) : filteredTasks.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No tasks found.
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div key={task.id} className="glass animate-fade-in" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => handleToggle(task)}
                                    style={{
                                        background: 'transparent',
                                        color: task.isCompleted ? 'var(--success)' : 'var(--text-muted)',
                                        padding: '0.8rem',
                                        margin: '-0.8rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        zIndex: 10
                                    }}
                                    title={task.isCompleted ? "Mark as pending" : "Mark as completed"}
                                >
                                    {task.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
                                </button>
                                <div style={{ flex: 1, cursor: !task.isCompleted ? 'pointer' : 'default' }} onClick={() => startEdit(task)}>
                                    <h4 style={{ textDecoration: task.isCompleted ? 'line-through' : 'none', opacity: task.isCompleted ? 0.5 : 1 }}>
                                        {task.title}
                                    </h4>
                                    {task.description && (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                                {/* {!task.isCompleted && (
                                    <button
                                        onClick={() => startEdit(task)}
                                        style={{ background: 'transparent', color: 'var(--primary)', padding: '0.5rem' }}
                                        title="Edit task"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )} */}
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    style={{ background: 'transparent', color: 'var(--danger)', padding: '0.5rem' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
