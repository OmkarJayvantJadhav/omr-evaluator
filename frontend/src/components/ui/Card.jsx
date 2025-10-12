import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({
  className,
  variant = 'default',
  hoverable = false,
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'card',
    glass: 'card-glass',
    plain: 'bg-white rounded-2xl shadow-sm border border-neutral-200',
  };

  return (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        hoverable && 'card-hover cursor-pointer',
        'animate-fade-in-up',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pb-4', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-0', className)}
    {...props}
  >
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-4 border-t border-neutral-200/50', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

const CardTitle = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn('heading-sm gradient-text leading-tight', className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn('text-neutral-600 mt-2', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };