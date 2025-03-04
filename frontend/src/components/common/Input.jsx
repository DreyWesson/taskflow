import React from 'react';

const Input = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  required = false,
  className = '',
  dataCy,
  ...rest
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <span className="required" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        required={required}
        data-cy={dataCy || `${name}-input`}
        {...rest}
      />
      {error && (
        <div id={`${id}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;