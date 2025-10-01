import { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useSubmissions } from '../hooks/useSubmissions';
import ReceiptViewer from './ReceiptViewer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, User, Mail, Phone, DollarSign, Calendar, FileText, Crown, Shield, Filter } from "lucide-react";

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
        return <Badge variant="warning" className="gap-1 bg-amber-500/20 text-amber-700 border-amber-500/30"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="success" className="gap-1 bg-emerald-500/20 text-emerald-700 border-emerald-500/30"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1 bg-red-500/20 text-red-700 border-red-500/30"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-500/20 text-gray-700 border-gray-500/30">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-elegant">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-black/20 backdrop-blur-sm border border-gold/20 shadow-elegant">
          <div className="relative">
            <Crown className="w-12 h-12 text-gold animate-pulse" />
            <Loader2 className="w-6 h-6 animate-spin text-gold absolute -bottom-1 -right-1" />
          </div>
          <p className="text-gold font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-elegant">
      {/* Elegant Header */}
      <div className="gradient-black-gold border-b border-gold/20 backdrop-blur-sm sticky top-0 z-40 shadow-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Crown className="w-8 h-8 text-gold" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  Admin Dashboard
                  <Shield className="w-6 h-6 text-gold" />
                </h1>
                <p className="text-gold/80 font-medium">Welcome back, {admin?.name || 'Administrator'}</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="elegant"
              className="transition-luxury hover:shadow-gold border-gold/30 hover:border-gold"
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
            <Card className="shadow-elegant border-gold/20 transition-luxury hover:shadow-gold bg-black/40 backdrop-blur-sm">
              <CardHeader className="gradient-gold border-b border-gold/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold flex items-center gap-3 text-black">
                    <FileText className="w-5 h-5" />
                    Event Submissions
                  </CardTitle>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] bg-black/20 border-gold/30 text-black hover:bg-black/30 transition-luxury">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-gold/30 backdrop-blur-sm">
                      <SelectItem value="all" className="text-gold hover:bg-gold/20">All Status</SelectItem>
                      <SelectItem value="pending" className="text-gold hover:bg-gold/20">Pending</SelectItem>
                      <SelectItem value="approved" className="text-gold hover:bg-gold/20">Approved</SelectItem>
                      <SelectItem value="rejected" className="text-gold hover:bg-gold/20">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-gold/60">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No submissions found</p>
                    <p className="text-sm text-gold/40 mt-2">Submissions will appear here once registered</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gold/10">
                    {submissions.map((submission) => (
                      <div
                        key={submission._id}
                        className={`p-4 cursor-pointer transition-luxury hover:bg-gold/10 ${
                          selectedSubmissionId === submission._id ? 'bg-gold/20 border-l-4 border-gold shadow-inner' : ''
                        }`}
                        onClick={() => setSelectedSubmissionId(submission._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gold flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {submission.fullName}
                            </h3>
                            <p className="text-sm text-gold/70 flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {submission.email}
                            </p>
                            <p className="text-xs text-gold/50 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(submission.status)}
                            <span className="text-xs font-mono text-gold/60 bg-black/20 px-2 py-1 rounded border border-gold/20">
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
              <Card className="shadow-elegant border-gold/20 transition-luxury hover:shadow-gold bg-black/40 backdrop-blur-sm">
                <CardHeader className="gradient-gold border-b border-gold/20">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3 text-black">
                    <User className="w-5 h-5" />
                    Submission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                      <User className="w-4 h-4 text-gold" />
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">Full Name</span>
                        <p className="text-sm font-semibold text-gold">{selectedSubmission.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                      <Mail className="w-4 h-4 text-gold" />
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">Email</span>
                        <p className="text-sm text-gold">{selectedSubmission.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                      <Phone className="w-4 h-4 text-gold" />
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">Phone</span>
                        <p className="text-sm text-gold">{selectedSubmission.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                      <User className="w-4 h-4 text-gold" />
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">Referred By</span>
                        <p className="text-sm text-gold">{selectedSubmission.referredBy}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                      <DollarSign className="w-4 h-4 text-gold" />
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">Amount</span>
                        <p className="text-sm font-semibold text-gold">₦{selectedSubmission.amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {selectedSubmission.status === 'pending' && <Clock className="w-4 h-4 text-amber-500" />}
                        {selectedSubmission.status === 'approved' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {selectedSubmission.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">Status</span>
                        {getStatusBadge(selectedSubmission.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                      <Calendar className="w-4 h-4 text-gold" />
                      <div>
                        <span className="text-xs font-medium text-gold/70 block">Submission Date</span>
                        <p className="text-sm text-gold">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
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
                          variant="gold"
                          className="w-full transition-luxury shadow-elegant hover:shadow-gold"
                        >
                          {isApproving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Approving...</>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-2" />Approve Submission</>
                          )}
                        </Button>
                        
                        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                          <DialogTrigger asChild>
                            <Button
                              variant="elegant"
                              className="w-full transition-luxury border-red-500/30 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
                              disabled={isRejecting}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject Submission
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black/90 border-gold/30 backdrop-blur-sm">
                            <DialogHeader>
                              <DialogTitle className="text-gold flex items-center gap-2">
                                <XCircle className="w-5 h-5" />
                                Reject Submission
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-gold/70">
                                Please provide a reason for rejecting this submission:
                              </p>
                              <Textarea
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="bg-black/20 border-gold/30 text-gold placeholder:text-gold/50 focus:border-gold"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="elegant"
                                  onClick={() => setShowRejectModal(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="gold"
                                  onClick={() => handleReject(selectedSubmission._id)}
                                  disabled={!rejectionReason.trim() || isRejecting}
                                  className="bg-red-600 hover:bg-red-700 border-red-500"
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
                      <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20 transition-luxury hover:bg-gold/20">
                        <Calendar className="w-4 h-4 text-gold" />
                        <div>
                          <span className="text-xs font-medium text-gold/70 block">Reviewed</span>
                          <p className="text-sm text-gold">{new Date(selectedSubmission.reviewedAt).toLocaleString()}</p>
                          <p className="text-xs text-gold/60">by {selectedSubmission.reviewedBy}</p>
                        </div>
                      </div>
                    )}

                    {selectedSubmission.rejectionReason && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <span className="text-sm font-medium text-red-400 block mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Rejection Reason
                        </span>
                        <p className="text-sm text-red-300">{selectedSubmission.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-elegant border-gold/20 bg-black/40 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-4">
                    <FileText className="w-12 h-12 mx-auto text-gold/50" />
                    <Crown className="w-6 h-6 text-gold absolute -top-1 -right-1" />
                  </div>
                  <p className="text-gold/70 font-medium">Select a submission to view details</p>
                  <p className="text-gold/50 text-sm mt-2">Click on any submission from the list</p>
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