import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  REVIEW: 'review',
  DONE: 'done'
};

const ACTIONS = {
  FETCH_TASKS_START: 'fetch-tasks-start',
  FETCH_TASKS_SUCCESS: 'fetch-tasks-success',
  FETCH_TASKS_FAILURE: 'fetch-tasks-failure',
  ADD_TASK_START: 'add-task-start',
  ADD_TASK_SUCCESS: 'add-task-success',
  ADD_TASK_FAILURE: 'add-task-failure',
  UPDATE_TASK_START: 'update-task-start',
  UPDATE_TASK_SUCCESS: 'update-task-success',
  UPDATE_TASK_FAILURE: 'update-task-failure',
  DELETE_TASK_START: 'delete-task-start',
  DELETE_TASK_SUCCESS: 'delete-task-success',
  DELETE_TASK_FAILURE: 'delete-task-failure',
  MOVE_TASK_START: 'move-task-start',
  MOVE_TASK_SUCCESS: 'move-task-success',
  MOVE_TASK_FAILURE: 'move-task-failure',
  CLEAR_ERROR: 'clear-error'
};

const initialState = {
  tasks: [],
  isLoading: false,
  error: null,
  stats: {
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    total: 0
  }
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_TASKS_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ACTIONS.FETCH_TASKS_SUCCESS:
      return {
        ...state,
        tasks: action.payload,
        isLoading: false
      };
    
    case ACTIONS.FETCH_TASKS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case ACTIONS.ADD_TASK_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ACTIONS.ADD_TASK_SUCCESS:
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        isLoading: false
      };
    
    case ACTIONS.ADD_TASK_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case ACTIONS.UPDATE_TASK_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ACTIONS.UPDATE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
        isLoading: false
      };
    
    case ACTIONS.UPDATE_TASK_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case ACTIONS.DELETE_TASK_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ACTIONS.DELETE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        isLoading: false
      };
    
    case ACTIONS.DELETE_TASK_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case ACTIONS.MOVE_TASK_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ACTIONS.MOVE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
        isLoading: false
      };
    
    case ACTIONS.MOVE_TASK_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Provider component
export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { isAuthenticated } = useAuth();
  
  // Fetch tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);
  
  const fetchTasks = async () => {
    dispatch({ type: ACTIONS.FETCH_TASKS_START });
    
    try {
      const response = await taskAPI.getAllTasks();
      dispatch({
        type: ACTIONS.FETCH_TASKS_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      dispatch({
        type: ACTIONS.FETCH_TASKS_FAILURE,
        payload: error.response?.data?.error || 'Failed to fetch tasks'
      });
    }
  };
  
  const addTask = async (taskData) => {
    dispatch({ type: ACTIONS.ADD_TASK_START });
    
    try {
      const response = await taskAPI.createTask(taskData);
      dispatch({
        type: ACTIONS.ADD_TASK_SUCCESS,
        payload: response.data
      });
      return response.data;
    } catch (error) {
      console.error('Error adding task:', error);
      dispatch({
        type: ACTIONS.ADD_TASK_FAILURE,
        payload: error.response?.data?.error || 'Failed to add task'
      });
      throw error;
    }
  };
  
  const updateTask = async (taskData) => {
    dispatch({ type: ACTIONS.UPDATE_TASK_START });
    
    try {
      const response = await taskAPI.updateTask(taskData.id, taskData);
      dispatch({
        type: ACTIONS.UPDATE_TASK_SUCCESS,
        payload: response.data
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      dispatch({
        type: ACTIONS.UPDATE_TASK_FAILURE,
        payload: error.response?.data?.error || 'Failed to update task'
      });
      throw error;
    }
  };
  
  const deleteTask = async (taskId) => {
    dispatch({ type: ACTIONS.DELETE_TASK_START });
    
    try {
      await taskAPI.deleteTask(taskId);
      dispatch({
        type: ACTIONS.DELETE_TASK_SUCCESS,
        payload: taskId
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      dispatch({
        type: ACTIONS.DELETE_TASK_FAILURE,
        payload: error.response?.data?.error || 'Failed to delete task'
      });
      throw error;
    }
  };
  
  const moveTask = async (taskId, status) => {
    dispatch({ type: ACTIONS.MOVE_TASK_START });
    
    try {
      const response = await taskAPI.moveTask(taskId, status);
      dispatch({
        type: ACTIONS.MOVE_TASK_SUCCESS,
        payload: response.data
      });
      return response.data;
    } catch (error) {
      console.error('Error moving task:', error);
      dispatch({
        type: ACTIONS.MOVE_TASK_FAILURE,
        payload: error.response?.data?.error || 'Failed to move task'
      });
      throw error;
    }
  };
  
  const getTasksByStatus = (status) => {
    return state.tasks.filter(task => task.status === status);
  };
  
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };
  
  return (
    <TaskContext.Provider value={{ 
      tasks: state.tasks,
      isLoading: state.isLoading,
      error: state.error,
      stats: state.stats,
      fetchTasks,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      getTasksByStatus,
      clearError
    }}>
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook to use task context
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskProvider;