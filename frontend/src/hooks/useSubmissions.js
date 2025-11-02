import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export const useSubmissions = (filter = 'all') => {
  const queryClient = useQueryClient();

  // Get submissions query
  const submissionsQuery = useQuery({
    queryKey: ['submissions', filter],
    queryFn: () => {
      console.log('🔄 Fetching submissions with filter:', filter);
      const params = filter !== 'all' ? { status: filter } : {};
      return adminService.getSubmissions(params);
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ Submissions query error:', error);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.error('🚫 Backend server appears to be down');
      } else if (error.response?.status === 401) {
        console.error('🔐 Authentication failed');
      } else {
        console.error('💥 Unknown error:', error.response?.data || error.message);
      }
    },
    onSuccess: (data) => {
      console.log('✅ Submissions loaded:', data?.submissions?.length || 0, 'items');
    }
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
      // Don't show toast here - let the component handle it for better control
      // Invalidate and refetch submissions
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      // Update the specific submission in cache
      queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
    },
    onError: (error) => {
      // Don't show toast here - let the component handle it with more details
      console.error('Approval mutation error:', error);
    },
  });

  // Reject submission mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.rejectSubmission(id, reason),
    onSuccess: (data, { id }) => {
      // Don't show toast here - let the component handle it for better control
      // Invalidate and refetch submissions
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      // Update the specific submission in cache
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
    },
    onError: (error) => {
      // Don't show toast here - let the component handle it with more details
      console.error('Rejection mutation error:', error);
    },
  });

  return {
    submissions: submissionsQuery.data?.submissions || [],
    isLoading: submissionsQuery.isLoading,
    error: submissionsQuery.error,
    refetch: submissionsQuery.refetch,
    useSubmissionDetails,
    useReceiptImage,
    approveSubmission: approveMutation.mutateAsync, // Use mutateAsync for promise-based handling
    rejectSubmission: rejectMutation.mutateAsync,   // Use mutateAsync for promise-based handling
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
};