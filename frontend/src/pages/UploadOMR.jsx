import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowUpTrayIcon, 
  DocumentIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { omrAPI, examAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const UploadOMR = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    exam_id: searchParams.get('examId') || '',
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [checkingSubmission, setCheckingSubmission] = useState(false);
  const [deletingSubmission, setDeletingSubmission] = useState(false);

  useEffect(() => {
    if (formData.exam_id) {
      fetchExam();
    }
  }, [formData.exam_id]);

  const fetchExam = async () => {
    setLoadingExam(true);
    try {
      const response = await examAPI.getById(formData.exam_id);
      setExam(response.data);
      // Also check for existing submission
      await checkExistingSubmission();
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      setExam(null);
    } finally {
      setLoadingExam(false);
    }
  };

  const checkExistingSubmission = async () => {
    if (!formData.exam_id || !user) return;
    
    setCheckingSubmission(true);
    try {
      const response = await omrAPI.checkSubmission(formData.exam_id);
      if (response.data.has_submitted) {
        setExistingSubmission(response.data.submission_details);
      } else {
        setExistingSubmission(null);
      }
    } catch (error) {
      console.error('Failed to check submission:', error);
      setExistingSubmission(null);
    } finally {
      setCheckingSubmission(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!formData.exam_id) {
      toast.error('Exam ID is required');
      return;
    }

    if (!confirm('Are you sure you want to delete your current submission? This action cannot be undone.')) {
      return;
    }

    setDeletingSubmission(true);

    try {
      await omrAPI.deleteSubmission(formData.exam_id);
      toast.success('Submission deleted successfully');
      setExistingSubmission(null);
    } catch (error) {
      console.error('Failed to delete submission:', error);
      let errorMessage = 'Failed to delete submission';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
    } finally {
      setDeletingSubmission(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'exam_id' && value.trim()) {
      fetchExam();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const minSize = 1; // 1 byte (non-empty)

    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a valid file (JPG, PNG, or PDF)');
      return;
    }

    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (selectedFile.size < minSize) {
      toast.error('File appears to be empty');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.exam_id.trim()) {
      toast.error('Exam ID is required');
      return;
    }

    if (!user?.roll_number) {
      toast.error('You must have a roll number assigned to submit OMR sheets. Please contact your administrator.');
      return;
    }

    if (!file) {
      toast.error('Please select an OMR sheet file');
      return;
    }

    if (!exam) {
      toast.error('Invalid exam ID. Please check and try again.');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('exam_id', formData.exam_id);
      uploadFormData.append('file', file);

      const response = await omrAPI.upload(uploadFormData);
      
      // Backend returns success response with message, score, etc.
      if (response.data && response.data.message) {
        toast.success(response.data.message);
        
        // Navigate to result page
        navigate(`/result/${formData.exam_id}/${user.roll_number}`);
      } else {
        throw new Error('Unexpected response format');
      }
      
    } catch (error) {
      console.error('Failed to upload OMR:', error);
      let errorMessage = 'Failed to process OMR sheet';
      
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Error message from the thrown error
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    }
    return <PhotoIcon className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center">
          <ArrowUpTrayIcon className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload OMR Sheet</h1>
            <p className="mt-2 text-gray-600">Upload your filled OMR sheet for automatic evaluation</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="exam_id" className="block text-sm font-medium text-gray-700">
                Exam ID *
              </label>
              <input
                type="text"
                id="exam_id"
                name="exam_id"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter exam ID"
                value={formData.exam_id}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Roll Number
              </label>
              <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                {user?.roll_number || 'No roll number assigned'}
              </div>
              {!user?.roll_number && (
                <p className="mt-1 text-sm text-red-600">
                  You need a roll number assigned to submit OMR sheets. Please contact your administrator.
                </p>
              )}
            </div>
          </div>

          {/* Exam Details */}
          {loadingExam && (
            <div className="mt-4">
              <LoadingSpinner size="small" text="Loading exam details..." />
            </div>
          )}

          {exam && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">Exam Found</h4>
                  <div className="mt-1 text-sm text-green-700">
                    <p><strong>{exam.title}</strong></p>
                    <p>Questions: {exam.total_questions} • Max Marks: {exam.max_marks}</p>
                    {exam.description && <p>{exam.description}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.exam_id && !loadingExam && !exam && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Exam Not Found</h4>
                  <p className="mt-1 text-sm text-red-700">
                    Please check the exam ID and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Existing Submission Warning */}
          {existingSubmission && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Previous Submission Found</h4>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>You have already submitted an OMR sheet for this exam:</p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Score: {existingSubmission.score} ({existingSubmission.percentage}%)</li>
                      <li>Submitted: {new Date(existingSubmission.submitted_at).toLocaleString()}</li>
                    </ul>
                    <p className="mt-2 font-medium">
                      Uploading a new OMR sheet will replace your previous submission.
                    </p>
                    <div className="mt-3 flex space-x-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/result/${formData.exam_id}/${user.roll_number}`)}
                        className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
                      >
                        View Current Result
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteSubmission}
                        disabled={deletingSubmission}
                        className="text-sm font-medium text-red-600 underline hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingSubmission ? 'Deleting...' : 'Delete Submission'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload OMR Sheet</h3>
          
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-primary-600 hover:text-primary-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInputChange}
              />
              <label
                htmlFor="file-upload"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
              >
                Select File
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon(file.type)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions for OMR Upload</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure your OMR sheet is clearly filled with dark marks</li>
            <li>• Take a clear, well-lit photo or scan of the entire sheet</li>
            <li>• Make sure the image is not blurry or tilted</li>
            <li>• Supported formats: JPG, PNG, PDF (max 10MB)</li>
            <li>• Double-check your roll number before submitting</li>
          </ul>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !file || !exam || !user?.roll_number}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              existingSubmission ? 'Resubmit & Process' : 'Upload & Process'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadOMR;