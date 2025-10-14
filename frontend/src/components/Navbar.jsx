import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  QrCodeIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teacherNavItems = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: ChartBarIcon, gradient: 'from-primary-500 to-primary-600' },
    { name: 'Create Exam', href: '/teacher/create-exam', icon: PlusIcon, gradient: 'from-secondary-500 to-secondary-600' },
  ];

  const studentNavItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: ChartBarIcon, gradient: 'from-primary-500 to-primary-600' },
    { name: 'Upload OMR', href: '/student/upload-omr', icon: ArrowUpTrayIcon, gradient: 'from-accent-500 to-accent-600' },
  ];

  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-premium fixed w-full top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} 
              className="flex items-center space-x-3 group"
            >
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:scale-105 transition-transform duration-200 animate-glow">
                <QrCodeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold gradient-text font-brand">SCANALYZE</span>
                
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item group ${
                    isActive ? 'active' : ''
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity mr-2`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-50 transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-accent-400 to-accent-500 group-hover:scale-105 transition-transform">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-neutral-900">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white backdrop-blur-md rounded-2xl shadow-premium border border-white/20 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-neutral-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-accent-400 to-accent-500">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{user?.full_name || user?.username}</p>
                        <p className="text-sm text-neutral-500">{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`badge ${
                            user?.role === 'teacher' ? 'badge-primary' : 'badge-success'
                          } text-xs`}>
                            {user?.role === 'teacher' ? ' Teacher' : '🎓 Student'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-error-50 hover:text-error-700 transition-colors group"
                  >
                    <div className="p-1.5 rounded-lg bg-error-100 group-hover:bg-error-200 mr-3 transition-colors">
                      <ArrowRightOnRectangleIcon className="h-4 w-4 text-error-600" />
                    </div>
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-4 pt-2 pb-3 space-y-2 bg-white backdrop-blur-md border-t border-white/20">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-item w-full ${
                    isActive ? 'active' : ''
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity mr-3`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="mt-4 pt-4 border-t border-neutral-200/50">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-accent-400 to-accent-500">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-3 py-2 mt-2 text-sm text-error-700 hover:bg-error-50 rounded-xl transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-error-100 group-hover:bg-error-200 mr-3 transition-colors">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 text-error-600" />
                </div>
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;