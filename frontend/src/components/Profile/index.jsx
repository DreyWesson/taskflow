import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useProfile from '../../hooks/useProfile';
import usePasswordChange from '../../hooks/usePasswordChange';
import './Profile.css';

const Profile = () => {
  const { logout } = useAuth();
  
  const {
    user,
    values: profileData,
    errors: profileErrors,
    isSubmitting: isProfileUpdating,
    success: profileSuccess,
    handleChange: handleProfileChange,
    handleSubmit: handleProfileSubmit
  } = useProfile();
  
  const {
    values: passwordData,
    errors: passwordErrors,
    isSubmitting: isPasswordUpdating,
    success: passwordSuccess,
    handleChange: handlePasswordChange,
    handleSubmit: handlePasswordSubmit
  } = usePasswordChange();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <p>Update your personal information and password</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          
          {profileSuccess && (
            <div className="success-message">{profileSuccess}</div>
          )}
          
          {profileErrors.submit && (
            <div className="error-message" role="alert">{profileErrors.submit}</div>
          )}
          
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Your full name"
                className={profileErrors.name ? 'is-invalid' : ''}
                disabled={isProfileUpdating}
                data-cy="name-input"
              />
              {profileErrors.name && (
                <div className="error-message">{profileErrors.name}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={user?.email || ''}
                disabled
                className="input-disabled"
                data-cy="email-input"
              />
              <div className="field-note">Email cannot be changed</div>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isProfileUpdating}
              data-cy="update-profile-button"
            >
              {isProfileUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
        
        <div className="profile-section">
          <h2>Change Password</h2>
          
          {passwordSuccess && (
            <div className="success-message">{passwordSuccess}</div>
          )}
          
          {passwordErrors.submit && (
            <div className="error-message" role="alert">{passwordErrors.submit}</div>
          )}
          
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className={passwordErrors.currentPassword ? 'is-invalid' : ''}
                disabled={isPasswordUpdating}
                data-cy="current-password-input"
              />
              {passwordErrors.currentPassword && (
                <div className="error-message">{passwordErrors.currentPassword}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className={passwordErrors.newPassword ? 'is-invalid' : ''}
                disabled={isPasswordUpdating}
                data-cy="new-password-input"
              />
              {passwordErrors.newPassword && (
                <div className="error-message">{passwordErrors.newPassword}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className={passwordErrors.confirmPassword ? 'is-invalid' : ''}
                disabled={isPasswordUpdating}
                data-cy="confirm-password-input"
              />
              {passwordErrors.confirmPassword && (
                <div className="error-message">{passwordErrors.confirmPassword}</div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isPasswordUpdating}
              data-cy="change-password-button"
            >
              {isPasswordUpdating ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
        
        <div className="profile-section danger-zone">
          <h2>Account Actions</h2>
          <p>Be careful, these actions cannot be undone.</p>
          
          <button 
            onClick={handleLogout}
            className="btn-danger"
            data-cy="logout-button"
          >
            Logout from All Devices
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;