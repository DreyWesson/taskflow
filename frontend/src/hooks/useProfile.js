import { useAuth } from '../contexts/AuthContext';
import useForm from './useForm';

const useProfile = () => {
  const { user, updateProfile, error, clearError } = useAuth();
  
  const initialValues = {
    name: user?.name || ''
  };
  
  const validateProfile = (values) => {
    const errors = {};
    
    if (!values.name.trim()) {
      errors.name = 'Name is required';
    } else if (values.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }
    
    return errors;
  };
  
  const submitProfile = async (values) => {
    await updateProfile(values);
  };
  
  const form = useForm(
    initialValues,
    validateProfile,
    submitProfile,
    null,
    clearError,
    { successMessage: 'Profile updated successfully' }
  );
  
  return {
    user,
    ...form,
    error
  };
};

export default useProfile;