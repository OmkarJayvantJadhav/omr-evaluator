import React from 'react';
import { Link } from 'react-router-dom';

const HomeLandingHeader = () => {
  return (
    <header className="border-b border-white/20 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 shadow-premium dark:border-slate-800/60 dark:bg-slate-900/50">
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3" aria-label="SCANALYZE home">
            <div className="mx-0 h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-glow">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
            </div>
            <span className="text-lg font-extrabold">SCANALYZE</span>
          </Link>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <a href="/#features" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 rounded transition-colors dark:text-slate-300 dark:hover:text-white">Features</a>
          <a href="/#how-it-works" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 rounded transition-colors dark:text-slate-300 dark:hover:text-white">How it works</a>
          <a href="/#demo" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 rounded transition-colors dark:text-slate-300 dark:hover:text-white">Demo</a>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
        </div>
      </nav>
    </header>
  );
};

export default HomeLandingHeader;
