import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullscreen = true }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const containerClasses = fullscreen 
    ? 'flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/20'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      {/* Animated background elements */}
      {fullscreen && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      )}
      
      {/* Premium Loading Animation */}
      <div className="relative animate-bounce-in">
        {/* Outer glow ring */}
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse opacity-20 absolute inset-0`}></div>
        
        {/* Main spinner */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 animate-spin relative`}
             style={{
               background: 'conic-gradient(from 0deg, #0ea5e9, #d946ef, #f97316, #0ea5e9)',
               WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))',
               mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))'
             }}>
          {/* Inner highlight */}
          <div className="absolute inset-1 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <SparklesIcon className="h-4 w-4 text-primary-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading text with animation */}
      {text && (
        <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-lg font-semibold gradient-text mb-2">{text}</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="loading-dot bg-primary-500"></div>
            <div className="loading-dot bg-secondary-500"></div>
            <div className="loading-dot bg-accent-500"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton component for loading states
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`skeleton ${className}`}
      {...props}
    />
  );
};

// Card skeleton for loading cards
export const CardSkeleton = () => {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
