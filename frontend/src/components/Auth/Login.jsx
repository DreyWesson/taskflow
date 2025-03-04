import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginForm } from '../../hooks/useLoginForm';
import './Auth.css';

const Login = () => {
  const {
    values: formData,
    errors: formErrors,
    isLoading,
    error,
    handleChange,
    handleSubmit
  } = useLoginForm();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to TaskFlow</h2>
        
        {error && (
          <div className="error-message" role="alert">
            {typeof error === 'string' ? error : 'Login failed. Please try again.'}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={formErrors.email ? 'is-invalid' : ''}
              disabled={isLoading}
              data-cy="email-input"
            />
            {formErrors.email && (
              <div className="error-message">{formErrors.email}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={formErrors.password ? 'is-invalid' : ''}
              disabled={isLoading}
              data-cy="password-input"
            />
            {formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn-auth"
            disabled={isLoading}
            data-cy="login-button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;