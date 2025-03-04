import { useState, useCallback } from 'react';

const useForm = (initialValues, validateFn, submitFn, onSuccess, clearErrorFn, options = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const defaultOptions = {
    resetAfterSubmit: false,
    successMessage: 'Submitted successfully'
  };
  
  // Merge default options with provided options
  const formOptions = { ...defaultOptions, ...options };
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: inputValue
    }));
    
    // Clear field error when typing
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear success message when making changes
    if (success) {
      setSuccess('');
    }
    
    // Clear API error if function provided
    if (clearErrorFn) {
      clearErrorFn();
    }
  }, [errors, success, clearErrorFn]);
  
  /**
   * Set a single form value
   */
  const setValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSuccess('');
    setSubmitAttempted(false);
  }, [initialValues]);
  
  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    setSubmitAttempted(true);
    
    // Validate form
    if (validateFn) {
      const validationErrors = validateFn(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }
    
    // Submit form
    setIsSubmitting(true);
    try {
      await submitFn(values);
      
      // Reset form if option is set
      if (formOptions.resetAfterSubmit) {
        setValues(initialValues);
      }
      
      // Clear errors
      setErrors({});
      
      // Set success message
      setSuccess(formOptions.successMessage);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(values);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      
      // Set submission error
      setErrors(prevErrors => ({
        ...prevErrors,
        submit: err.message || 'Failed to submit'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [validateFn, submitFn, values, initialValues, formOptions, onSuccess]);
  
  /**
   * Set form values directly
   */
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);
  
  /**
   * Set a specific error message
   */
  const setError = useCallback((field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);
  
  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  /**
   * Clear the success message
   */
  const clearSuccess = useCallback(() => {
    setSuccess('');
  }, []);
  
  return {
    // State
    values,
    errors,
    isSubmitting,
    success,
    submitAttempted,
    
    // Handlers
    handleChange,
    handleSubmit,
    setValue,
    setFormValues,
    setError,
    clearErrors,
    clearSuccess,
    resetForm
  };
};

export default useForm;