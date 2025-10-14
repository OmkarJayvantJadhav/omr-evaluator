import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  QrCodeIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  EnvelopeIcon, 
  KeyIcon,
  SparklesIcon,
  UserGroupIcon,
  AcademicCapIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
 

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    roll_number: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.role === 'student' && !formData.roll_number.trim()) {
      toast.error('Roll number is required for students');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      
      // Only include roll_number for students
      if (registerData.role === 'teacher') {
        delete registerData.roll_number;
      }
      
      const result = await register(registerData);
      
      if (result.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 animate-glow mb-6">
            <QrCodeIcon className="h-8 w-8 text-white animate-float" />
          </div>
          <h1 className="heading-lg font-display gradient-text mb-1">SCANALYZE</h1>
          <p className="text-neutral-600 mb-2">Smart OMR Evaluator</p>
          <h2 className="heading-md gradient-text mb-2">Create your account</h2>
          <p className="text-neutral-600 mb-2">Start your journey</p>

          <div className="flex items-center justify-center space-x-2">
            
        
          </div>
        </div>
        
        {/* Registration Form */}
        <Card variant="glass" className="p-8">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Input
                  name="username"
                  label="Username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  leftIcon={<UserIcon className="h-5 w-5 text-neutral-400" />}
                  required
                />
                
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  leftIcon={<EnvelopeIcon className="h-5 w-5 text-neutral-400" />}
                  required
                />

                <Input
                  name="full_name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  leftIcon={<UserGroupIcon className="h-5 w-5 text-neutral-400" />}
                  required
                />

                {/* Role Selection */}
                <div className="form-group">
                  <label className="label">Choose Your Role *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'student'})}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.role === 'student'
                          ? 'border-success-400 bg-success-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                          formData.role === 'student' ? 'bg-success-500' : 'bg-neutral-400'
                        }`}>
                          <AcademicCapIcon className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-sm">Student</h4>
                        <p className="text-xs text-neutral-500 mt-1">Take exams & view results</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'teacher', roll_number: ''})}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.role === 'teacher'
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                          formData.role === 'teacher' ? 'bg-primary-500' : 'bg-neutral-400'
                        }`}>
                          <QrCodeIcon className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-sm">Teacher</h4>
                        <p className="text-xs text-neutral-500 mt-1">Create & manage exams</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Roll Number for Students */}
                {formData.role === 'student' && (
                  <Input
                    name="roll_number"
                    label="Roll Number"
                    placeholder="Enter your roll number (e.g., 2024001)"
                    value={formData.roll_number}
                    onChange={handleChange}
                    leftIcon={<HashtagIcon className="h-5 w-5 text-neutral-400" />}
                    required
                    help="Your unique student roll number - required for OMR submissions"
                  />
                )}

                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  leftIcon={<KeyIcon className="h-5 w-5 text-neutral-400" />}
                  rightIcon={
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                  required
                />

                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  leftIcon={<KeyIcon className="h-5 w-5 text-neutral-400" />}
                  rightIcon={
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                
                Create Account
              </Button>

              <div className="text-center">
                <span className="text-neutral-500 text-sm">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500 font-semibold text-sm transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;