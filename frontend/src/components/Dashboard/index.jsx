import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header';
import TaskBoard from '../TaskBoard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p>Manage your tasks efficiently</p>
        </div>
        <TaskBoard />
      </main>
      <footer className="footer">
        <p>&copy; 2025 TaskFlow - A Modern Task Management Solution</p>
      </footer>
    </div>
  );
};

export default Dashboard;