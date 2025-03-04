import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useForm from './useForm';

const useRegister = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const initialValues = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  };
  
  const validateRegister = (values) => {
    const errors = {};
    
    if (!values.name.trim()) {
      errors.name = 'Name is required';
    } else if (values.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }
    
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!values.passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password';
    } else if (values.password !== values.passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
    }
    
    return errors;
  };
  
  const submitRegister = async (values) => {
    await register(values);
    navigate('/dashboard');
  };
  
  const form = useForm(
    initialValues,
    validateRegister,
    submitRegister,
    null,
    clearError
  );
  
  return {
    ...form,
    isLoading,
    error
  };
};

export default useRegister;