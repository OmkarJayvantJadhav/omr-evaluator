import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  label,
  description,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-neutral-500 mb-2">{description}</p>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            'input-field',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-error-300 focus:border-error-400 focus:ring-error-500/50',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-600 mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;