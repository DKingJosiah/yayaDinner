import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubmissions } from '../hooks/useSubmissions';
import ReceiptViewer from './ReceiptViewer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, User, Mail, Phone, DollarSign, Calendar, FileText } from "lucide-react";

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    submissions,
    isLoading,
    useSubmissionDetails,
    useReceiptImage,
    approveSubmission,
    rejectSubmission,
    isApproving,
    isRejecting,
  } = useSubmissions(filter);

  const { data: selectedSubmission } = useSubmissionDetails(selectedSubmissionId);

  const handleApprove = (id) => {
    approveSubmission(id);
  };

  const handleReject = (id) => {
    rejectSubmission({ id, reason: rejectionReason });
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {admin?.name || 'Admin'}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="transition-smooth hover:bg-destructive hover:text-destructive-foreground"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0 transition-smooth hover:shadow-hover">
              <CardHeader className="gradient-subtle border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Submissions
                  </CardTitle>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] bg-background/50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No submissions found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {submissions.map((submission) => (
                      <div
                        key={submission._id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedSubmissionId === submission._id ? 'bg-muted/30 border-l-4 border-primary' : ''
                        }`}
                        onClick={() => setSelectedSubmissionId(submission._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{submission.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{submission.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(submission.status)}
                            <span className="text-xs font-mono text-muted-foreground">
                              {submission.referenceId}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission Details */}
          <div>
            {selectedSubmission ? (
              <Card className="shadow-card border-0 transition-smooth hover:shadow-hover">
                <CardHeader className="gradient-subtle border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Submission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Full Name</span>
                        <p className="text-sm font-medium">{selectedSubmission.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Email</span>
                        <p className="text-sm">{selectedSubmission.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Phone</span>
                        <p className="text-sm">{selectedSubmission.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Referred By</span>
                        <p className="text-sm">{selectedSubmission.referredBy}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Amount</span>
                        <p className="text-sm font-medium">₦{selectedSubmission.amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {selectedSubmission.status === 'pending' && <Clock className="w-4 h-4 text-warning" />}
                        {selectedSubmission.status === 'approved' && <CheckCircle className="w-4 h-4 text-success" />}
                        {selectedSubmission.status === 'rejected' && <XCircle className="w-4 h-4 text-destructive" />}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Status</span>
                        {getStatusBadge(selectedSubmission.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Submission Date</span>
                        <p className="text-sm">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Receipt Viewer - Updated to use base64 */}
                    <ReceiptViewer 
                      submissionId={selectedSubmission._id}
                      useReceiptImage={useReceiptImage}
                      originalName={selectedSubmission.receiptOriginalName}
                    />

                    {selectedSubmission.status === 'pending' && (
                      <div className="pt-4 space-y-3">
                        <Button
                          onClick={() => handleApprove(selectedSubmission._id)}
                          disabled={isApproving}
                          variant="success"
                          className="w-full transition-bounce"
                        >
                          {isApproving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Approving...</>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-2" />Approve</>
                          )}
                        </Button>
                        
                        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-full transition-bounce"
                              disabled={isRejecting}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Submission</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Please provide a reason for rejecting this submission:
                              </p>
                              <Textarea
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowRejectModal(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(selectedSubmission._id)}
                                  disabled={!rejectionReason.trim() || isRejecting}
                                >
                                  {isRejecting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rejecting...</>
                                  ) : (
                                    'Reject Submission'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}

                    {selectedSubmission.reviewedAt && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-xs font-medium text-muted-foreground block">Reviewed</span>
                          <p className="text-sm">{new Date(selectedSubmission.reviewedAt).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">by {selectedSubmission.reviewedBy}</p>
                        </div>
                      </div>
                    )}

                    {selectedSubmission.rejectionReason && (
                      <div className="p-4 bg-error-light border border-error/20 rounded-lg">
                        <span className="text-sm font-medium text-error block mb-2">Rejection Reason</span>
                        <p className="text-sm text-error/80">{selectedSubmission.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Select a submission to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;