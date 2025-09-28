import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api'; // Use the configured api instance

const StatusCheck = () => {
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/submissions/status/${data.referenceId}`);
      setSubmission(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch status');
      setSubmission(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check Registration Status
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your reference ID to check your registration status
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="form-label">Reference ID</label>
            <input
              {...register('referenceId', { 
                required: 'Reference ID is required'
              })}
              type="text"
              className="form-input"
              placeholder="Enter your reference ID (e.g., DR1234567890ABCDE)"
            />
            {errors.referenceId && (
              <p className="mt-1 text-sm text-red-600">{errors.referenceId.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {submission && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Registration Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Reference ID:</span>
                <p className="text-sm text-gray-900">{submission.referenceId}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <p className="text-sm text-gray-900">{submission.fullName}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Submission Date:</span>
                <p className="text-sm text-gray-900">
                  {new Date(submission.submissionDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>
            </div>

            {submission.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  Your registration is currently under review. You will receive an email once it's processed.
                </p>
              </div>
            )}

            {submission.status === 'approved' && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">
                  Congratulations! Your registration has been approved. Check your email for event details.
                </p>
              </div>
            )}

            {submission.status === 'rejected' && (
              <div className="mt-4 p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">
                  Your registration was not approved. Please check your email for more information.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatusCheck;