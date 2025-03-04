import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Action types
const ACTIONS = {
  LOGIN_START: 'login-start',
  LOGIN_SUCCESS: 'login-success',
  LOGIN_FAILURE: 'login-failure',
  LOGOUT: 'logout',
  REGISTER_START: 'register-start',
  REGISTER_SUCCESS: 'register-success',
  REGISTER_FAILURE: 'register-failure',
  UPDATE_USER: 'update-user',
  CLEAR_ERROR: 'clear-error'
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: Boolean(localStorage.getItem('token')),
  isLoading: false,
  error: null
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN_START:
    case ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ACTIONS.LOGIN_SUCCESS:
    case ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null
      };
    
    case ACTIONS.LOGIN_FAILURE:
    case ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null
      };
    
    case ACTIONS.UPDATE_USER:
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload
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
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          dispatch({
            type: ACTIONS.UPDATE_USER,
            payload: user
          });
        }
      } catch (error) {
        console.error('Error loading user from localStorage', error);
        dispatch({ type: ACTIONS.LOGOUT });
      }
    };
    
    loadUser();
  }, []);
  
  const register = async (userData) => {
    dispatch({ type: ACTIONS.REGISTER_START });
    
    try {
      const data = await authAPI.register(userData);
      dispatch({
        type: ACTIONS.REGISTER_SUCCESS,
        payload: data
      });
      return data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.errors || 
        'Registration failed';
      
      dispatch({
        type: ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
  
  const login = async (credentials) => {
    dispatch({ type: ACTIONS.LOGIN_START });
    
    try {
      const data = await authAPI.login(credentials);
      dispatch({
        type: ACTIONS.LOGIN_SUCCESS,
        payload: data
      });
      return data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.error || 
        'Invalid credentials';
      
      dispatch({
        type: ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
  
  const logout = () => {
    authAPI.logout();
    dispatch({ type: ACTIONS.LOGOUT });
  };
  
  const updateProfile = async (userData) => {
    try {
      const data = await authAPI.updateProfile(userData);
      dispatch({
        type: ACTIONS.UPDATE_USER,
        payload: data.data
      });
      return data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.error || 
        'Failed to update profile';
      
      throw new Error(errorMessage);
    }
  };
  
  const changePassword = async (passwordData) => {
    try {
      const data = await authAPI.changePassword(passwordData);
      return data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.error || 
        'Failed to change password';
      
      throw new Error(errorMessage);
    }
  };
  
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;