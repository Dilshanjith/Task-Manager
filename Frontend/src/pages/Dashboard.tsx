import React, { useState, useEffect } from 'react';
import { taskService, Task } from '../services/api';
import { auth } from '../services/firebase';

export const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await taskService.getTasks();
            setTasks(res.data);
        } catch (err) {
            alert('Error loading tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            if (editingTask) {
                const res = await taskService.updateTask(editingTask.id, {
                    ...editingTask,
                    title,
                    description
                });
                setTasks(tasks.map(t => t.id === editingTask.id ? res.data : t));
                setEditingTask(null);
            } else {
                const res = await taskService.createTask({ title, description });
                setTasks([res.data, ...tasks]);
            }
            setTitle('');
            setDescription('');
        } catch (err) {
            alert('Error saving task');
        }
    };

    const toggleStatus = async (task: Task) => {
        try {
            const res = await taskService.updateTask(task.id, {
                ...task,
                isCompleted: !task.isCompleted
            });
            setTasks(tasks.map(t => t.id === task.id ? res.data : t));
        } catch (err) {
            alert('Error updating status');
        }
    };

    const deleteTask = async (id: number) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await taskService.deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            alert('Error deleting task');
        }
    };

    const filteredTasks = tasks
        .filter(t => {
            if (filter === 'pending') return !t.isCompleted;
            if (filter === 'completed') return t.isCompleted;
            return true;
        })
        .sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return (
        <div className="container">
            <div className="header">
                <div>
                    <h1>Task Manager</h1>
                    <p>Welcome, {auth.currentUser?.email}</p>
                </div>
                <button className="button-secondary" onClick={() => auth.signOut()}>Logout</button>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                    <form onSubmit={handleSave} style={{marginTop: '15px'}}>
                        <div className="form-group">
                            <label>Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                        </div>
                        <button type="submit" style={{width: '100%'}}>
                            {editingTask ? 'Update Task' : 'Add Task'}
                        </button>
                        {editingTask && (
                            <button type="button" className="button-secondary" style={{width: '100%', marginTop: '10px'}} onClick={() => {setEditingTask(null); setTitle(''); setDescription('');}}>
                                Cancel
                            </button>
                        )}
                    </form>
                </div>

                <div>
                    <div className="filter-bar">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
                        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
                    </div>

                    {loading ? <p>Loading...</p> : (
                        <div className="card" style={{padding: '0'}}>
                            {filteredTasks.length === 0 ? <p style={{padding: '20px'}}>No tasks found.</p> : (
                                filteredTasks.map(task => (
                                    <div key={task.id} className="task-item">
                                        <input type="checkbox" checked={task.isCompleted} onChange={() => toggleStatus(task)} />
                                        <div className="task-info">
                                            <div className={`task-title ${task.isCompleted ? 'completed' : ''}`} 
                                                 onClick={() => !task.isCompleted && (setEditingTask(task), setTitle(task.title), setDescription(task.description || ''))}
                                                 style={{cursor: task.isCompleted ? 'default' : 'pointer'}}>
                                                {task.title}
                                            </div>
                                            {task.description && <small style={{color: '#666'}}>{task.description}</small>}
                                        </div>
                                        <button className="button-secondary" style={{color: 'red', border: 'none'}} onClick={() => deleteTask(task.id)}>Delete</button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
