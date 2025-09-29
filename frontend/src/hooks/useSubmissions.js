import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

export const useSubmissions = (filter = 'all') => {
  const queryClient = useQueryClient();

  // Get submissions query
  const submissionsQuery = useQuery({
    queryKey: ['submissions', filter],
    queryFn: () => {
      const params = filter !== 'all' ? { status: filter } : {};
      return adminService.getSubmissions(params);
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Get single submission query
  const useSubmissionDetails = (id) => {
    return useQuery({
      queryKey: ['submission', id],
      queryFn: () => adminService.getSubmissionById(id),
      enabled: !!id,
      staleTime: 60000, // 1 minute
    });
  };

  // Get receipt image query
  const useReceiptImage = (id) => {
    return useQuery({
      queryKey: ['receipt', id],
      queryFn: () => adminService.getReceiptImage(id),
      enabled: !!id,
      staleTime: 300000, // 5 minutes (images don't change often)
      retry: 1, // Only retry once for images
    });
  };

  // Approve submission mutation
  const approveMutation = useMutation({
    mutationFn: adminService.approveSubmission,
    onSuccess: (data, submissionId) => {
      toast.success('Submission approved successfully!');
      // Invalidate and refetch submissions
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      // Update the specific submission in cache
      queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to approve submission');
    },
  });

  // Reject submission mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.rejectSubmission(id, reason),
    onSuccess: (data, { id }) => {
      toast.success('Submission rejected successfully!');
      // Invalidate and refetch submissions
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      // Update the specific submission in cache
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to reject submission');
    },
  });

  return {
    submissions: submissionsQuery.data?.submissions || [],
    isLoading: submissionsQuery.isLoading,
    error: submissionsQuery.error,
    refetch: submissionsQuery.refetch,
    useSubmissionDetails,
    useReceiptImage,
    approveSubmission: approveMutation.mutate,
    rejectSubmission: rejectMutation.mutate,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
};