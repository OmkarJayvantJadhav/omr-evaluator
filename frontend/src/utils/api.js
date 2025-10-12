import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

// Exam API
export const examAPI = {
  create: (examData) => api.post('/exams/create', examData),
  getAll: () => api.get('/exams'),
  getById: (examId) => api.get(`/exams/${examId}`),
  update: (examId, updateData) => api.put(`/exams/${examId}`, updateData),
  delete: (examId) => api.delete(`/exams/${examId}`),
  getStatistics: (examId) => api.get(`/exams/${examId}/statistics`),
};

// OMR API
export const omrAPI = {
  upload: (formData) => api.post('/omr/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  checkSubmission: (examId) => api.get(`/omr/check-submission/${examId}`),
  deleteSubmission: (examId) => api.delete(`/omr/submission/${examId}`),
};

// Results API
export const resultsAPI = {
  getResult: (examId, rollNumber) => api.get(`/results/${examId}/${rollNumber}`),
};

// Teacher API
export const teacherAPI = {
  getDashboard: () => api.get('/teacher/dashboard'),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
};

export default api;