import React, { Suspense } from 'react';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import AccessibilityFeatures from './components/AccessibilityFeatures';
import { TaskProvider } from './contexts/TaskContext';
import LoadingIndicator from './components/LoadingIndicator';
import './styles.css';

const TaskBoard = React.lazy(() => import('./components/TaskBoard'));

function App() {
  return (
    <div className="app">
      <TaskProvider>
        <AccessibilityFeatures>
          <Header />
          <main className="main-content">
            <ErrorBoundary>
              <Suspense fallback={<div className="loading"><LoadingIndicator message="Loading task board..." /></div>}>
                <TaskBoard />
              </Suspense>
            </ErrorBoundary>
          </main>
          <footer className="footer">
            <p>&copy; 2025 TaskFlow - A Modern Task Management Solution</p>
          </footer>
        </AccessibilityFeatures>
      </TaskProvider>
    </div>
  );
}

export default App;