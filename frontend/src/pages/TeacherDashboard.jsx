import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  ChartBarIcon, 
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { teacherAPI, examAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
// import Reveal from '../components/Reveal';
import Button from '../components/ui/Button';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rollNumberFilter, setRollNumberFilter] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchExams();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await teacherAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAll();
      setExams(response.data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      await examAPI.delete(examId);
      toast.success('Exam deleted successfully! 🗑️');
      fetchExams();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your premium dashboard..." />;
  }

  const stats = [
    {
      name: 'Total Exams',
      value: dashboardData?.total_exams || 0,
      icon: BookOpenIcon,
      gradient: 'from-primary-500 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100',
      borderColor: 'border-primary-200',
    },
    {
      name: 'Total Students',
      value: dashboardData?.total_students || 0,
      icon: UserGroupIcon,
      gradient: 'from-success-500 to-success-600',
      bgGradient: 'from-success-50 to-success-100',
      borderColor: 'border-success-200',
    },
    {
      name: 'Active Exams',
      value: exams.filter(exam => exam.is_active).length,
      icon: FireIcon,
      gradient: 'from-secondary-500 to-secondary-600',
      bgGradient: 'from-secondary-50 to-secondary-100',
      borderColor: 'border-secondary-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start animate-fade-in-up">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 animate-glow">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="heading-lg gradient-text">Teacher Dashboard</h1>
              
            </div>
          </div>
        </div>
        <Link to="/teacher/create-exam">
          <Button
            variant="primary"
            size="lg"
            className="animate-bounce-in"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Exam
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={stat.name} 
              hoverable 
              className="animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">{stat.name}</p>
                    <p className="stat-value">{stat.value}</p>
                      <IconComponent className={`h-8 w-8 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
                    </div>
                  </div>
               
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exams List */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpenIcon className="h-6 w-6 text-primary-500" />
                  <span>Your Exams</span>
                </CardTitle>
                <CardDescription>Manage and monitor your created exams</CardDescription>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <FireIcon className="h-4 w-4" />
                <span>{exams.filter(e => e.is_active).length} Active</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {exams.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 mb-6">
                  <BookOpenIcon className="h-10 w-10 text-primary-400 animate-float" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No exams yet</h3>
                <p className="text-neutral-500 mb-6">Create your exam to get started with OMR evaluation.</p>
                <Link to="/teacher/create-exam">
                  <Button
                    variant="primary"
                    size="lg"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Your  Exam
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {exams.map((exam, index) => (
                    <Card 
                      key={exam.id} 
                      variant="plain" 
                      hoverable 
                      className="p-6 animate-fade-in-up group"
                      style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 group-hover:scale-105 transition-transform">
                            <BookOpenIcon className="h-6 w-6 text-primary-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-neutral-900">
                                {exam.title}
                              </h4>
                              <span className={`badge ${
                                exam.is_active 
                                  ? 'badge-success' 
                                  : 'badge-error'
                              }`}>
                                {exam.is_active ? '🟢 Active' : '🔴 Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-neutral-500">
                              <div className="flex items-center space-x-1">
                                <span className="font-mono font-medium">#{exam.exam_id}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DocumentTextIcon className="h-4 w-4" />
                                <span>{exam.total_questions} questions</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <SparklesIcon className="h-4 w-4" />
                                <span>{exam.max_marks} marks</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{new Date(exam.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link to={`/exam/${exam.exam_id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/teacher/exam/${exam.exam_id}/statistics`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChartBarIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleDeleteExam(exam.exam_id)}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-error-500 hover:text-error-600 hover:bg-error-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Student Results - Search by Roll Number */}
      {dashboardData?.recent_results && dashboardData.recent_results.length > 0 && (
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="h-6 w-6 text-primary-500" />
                <span>Student Results</span>
              </CardTitle>
              <CardDescription>Search and view student performance by roll number</CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Search Filter */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by roll number..."
                    value={rollNumberFilter}
                    onChange={(e) => setRollNumberFilter(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition-all duration-200"
                  />
                  {rollNumberFilter && (
                    <button
                      onClick={() => setRollNumberFilter('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {rollNumberFilter && (
                  <p className="mt-2 text-sm text-neutral-500">
                    {(() => {
                      const filtered = dashboardData.recent_results.filter(result => 
                        result.roll_number?.toString().toLowerCase().includes(rollNumberFilter.toLowerCase())
                      );
                      return filtered.length > 0 
                        ? `Found ${filtered.length} result${filtered.length > 1 ? 's' : ''} for "${rollNumberFilter}"`
                        : `No results found for "${rollNumberFilter}"`;
                    })()}
                  </p>
                )}
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {(() => {
                  const filteredResults = rollNumberFilter
                    ? dashboardData.recent_results.filter(result => 
                        result.roll_number?.toString().toLowerCase().includes(rollNumberFilter.toLowerCase())
                      )
                    : dashboardData.recent_results.slice(0, 10);

                  if (filteredResults.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <UserGroupIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 font-medium">No results found</p>
                        <p className="text-sm text-neutral-400 mt-1">
                          {rollNumberFilter ? 'Try a different roll number' : 'No student submissions yet'}
                        </p>
                      </div>
                    );
                  }

                  return filteredResults.map((result, index) => (
                    <Card 
                      key={result.id} 
                      variant="plain" 
                      className="p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200">
                            <UserGroupIcon className="h-6 w-6 text-accent-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-lg text-neutral-900">
                                Roll: {result.roll_number}
                              </p>
                              <span className={`badge text-xs ${
                                result.percentage >= 90 ? 'bg-success-100 text-success-700' :
                                result.percentage >= 75 ? 'bg-primary-100 text-primary-700' :
                                result.percentage >= 50 ? 'bg-warning-100 text-warning-700' :
                                'bg-error-100 text-error-700'
                              }`}>
                                {result.percentage >= 90 ? '🏆 Excellent' :
                                 result.percentage >= 75 ? '🚀 Good' :
                                 result.percentage >= 40 ? '✅ Pass' : '❌ Fail'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <p className="text-neutral-600 font-medium">
                                Score: <span className="text-primary-600 font-bold">{result.score}/{result.exam?.max_marks}</span>
                              </p>
                              <p className="text-neutral-600 font-medium">
                                Percentage: <span className="text-primary-600 font-bold">{result.percentage.toFixed(1)}%</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                              <p className="flex items-center gap-1">
                                <BookOpenIcon className="h-3.5 w-3.5" />
                                {result.exam?.title || 'N/A'}
                              </p>
                              <p className="flex items-center gap-1">
                                <ClockIcon className="h-3.5 w-3.5" />
                                {new Date(result.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ));
                })()}
              </div>

              {/* Show More Info */}
              {!rollNumberFilter && dashboardData.recent_results.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-neutral-500">
                    Showing 10 of {dashboardData.recent_results.length} results. Use search to find specific students.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;