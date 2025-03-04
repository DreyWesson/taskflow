import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useForm from './useForm';

export const useLoginForm = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const initialValues = {
    email: '',
    password: ''
  };
  
  const validateLogin = (values) => {
    const errors = {};
    
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    }
    
    return errors;
  };
  
  const submitLogin = async (values) => {
    await login(values);
    navigate('/dashboard');
  };
  
  const form = useForm(
    initialValues,
    validateLogin,
    submitLogin,
    null,
    clearError
  );
  
  return {
    ...form,
    isLoading,
    error
  };
};

export default useLoginForm;