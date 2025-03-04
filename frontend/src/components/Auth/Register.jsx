import React from 'react';
import { Link } from 'react-router-dom';
import useRegister from '../../hooks/useRegister';
import './Auth.css';

const Register = () => {
  const {
    values: formData,
    errors: formErrors,
    isLoading,
    error,
    handleChange,
    handleSubmit
  } = useRegister();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        
        {error && (
          <div className="error-message" role="alert">
            {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={formErrors.name ? 'is-invalid' : ''}
              disabled={isLoading}
              data-cy="name-input"
            />
            {formErrors.name && (
              <div className="error-message">{formErrors.name}</div>
            )}
          </div>
          
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
              placeholder="Create a password"
              className={formErrors.password ? 'is-invalid' : ''}
              disabled={isLoading}
              data-cy="password-input"
            />
            {formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="passwordConfirmation">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              value={formData.passwordConfirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={formErrors.passwordConfirmation ? 'is-invalid' : ''}
              disabled={isLoading}
              data-cy="password-confirmation-input"
            />
            {formErrors.passwordConfirmation && (
              <div className="error-message">{formErrors.passwordConfirmation}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn-auth"
            disabled={isLoading}
            data-cy="register-button"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;