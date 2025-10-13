import React, { useRef } from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  ...props
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:ring-error-500',
    success: 'btn bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:ring-success-500',
    warning: 'btn bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:ring-warning-500',
  };

  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md', 
    lg: 'btn-lg',
  };

  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (variant !== 'primary') return;
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.03}px, ${y * 0.03}px)`;
  };

  const handleMouseLeave = () => {
    const el = btnRef.current;
    if (el) el.style.transform = '';
  };

  return (
    <button
      className={cn(
        variants[variant],
        sizes[size],
        loading && 'cursor-not-allowed opacity-50',
        className
      )}
      ref={(node) => {
        btnRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      disabled={loading || props.disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;