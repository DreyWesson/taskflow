import { useEffect, useRef } from 'react';

export const useTaskModal = (isOpen, onClose) => {
  const modalRef = useRef(null);
  const lastActiveElement = useRef(null);

  // Trap focus inside the modal when it's open
  useEffect(() => {
    if (isOpen) {
      // Store the element that was focused before opening the modal
      lastActiveElement.current = document.activeElement;
      
      // Focus the first interactive element in the modal
      const firstFocusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
      
      // Add event listener for ESC key to close modal
      const handleEscKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Disable scrolling on body
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = '';
        
        // Restore focus to the element that was focused before the modal opened
        if (lastActiveElement.current) {
          lastActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  // Trap focus inside modal (focus trap)
  const handleTabKey = (e) => {
    if (!modalRef.current || e.key !== 'Tab') return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If shift+tab on first element, move to last element
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } 
    // If tab on last element, move to first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    // Make sure onClose is called properly
    if (onClose) {
      // Close modal with a small delay to ensure state updates have completed
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  return {
    // Refs
    modalRef,
    
    // Methods
    handleTabKey,
    handleFormSubmit
  };
};