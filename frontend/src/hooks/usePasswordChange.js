import { useAuth } from '../contexts/AuthContext';
import useForm from './useForm';

const usePasswordChange = () => {
  const { changePassword, error, clearError } = useAuth();
  
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  const validatePassword = (values) => {
    const errors = {};
    
    if (!values.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!values.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (values.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (values.newPassword !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };
  
  const submitPasswordChange = async (values) => {
    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    });
  };
  
  const form = useForm(
    initialValues,
    validatePassword,
    submitPasswordChange,
    null,
    clearError,
    { 
      resetAfterSubmit: true,
      successMessage: 'Password updated successfully' 
    }
  );
  
  return {
    ...form,
    error
  };
};

export default usePasswordChange;