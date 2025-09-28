import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubmissions } from '../hooks/useSubmissions';
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
    const variants = {
      pending: { variant: "secondary", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      approved: { variant: "success", className: "bg-success/10 text-success hover:bg-success/20" },
      rejected: { variant: "destructive", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" }
    };
    
    const config = variants[status] || variants.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
                        className={`p-6 hover:bg-muted/30 cursor-pointer transition-smooth ${
                          selectedSubmissionId === submission._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                        onClick={() => setSelectedSubmissionId(submission._id)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{submission.fullName}</h3>
                                <p className="text-sm text-muted-foreground">{submission.email}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded inline-block">
                              {submission.referenceId}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            {getStatusBadge(submission.status)}
                            <p className="text-xs text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
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
          <div className="lg:col-span-1">
            {selectedSubmission ? (
              <Card className="shadow-card border-0 transition-smooth hover:shadow-hover">
                <CardHeader className="gradient-subtle border-b">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Submission Details
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Reference ID</span>
                        <p className="font-mono text-sm">{selectedSubmission.referenceId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block">Full Name</span>
                        <p className="font-semibold">{selectedSubmission.fullName}</p>
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
                        <p className="text-lg font-bold">₦{selectedSubmission.amount?.toLocaleString()}</p>
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

                    {selectedSubmission.receiptUrl && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-xs font-medium text-muted-foreground block">Receipt</span>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary hover:text-primary-glow"
                            asChild
                          >
                            <a
                              href={`http://localhost:3000${selectedSubmission.receiptUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Receipt
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

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
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-destructive" />
                                Reject Submission
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                  Rejection Reason
                                </label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Please provide a reason for rejection..."
                                  className="min-h-[100px]"
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                  }}
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
                                    'Reject'
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







// import { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, User, Mail, Phone, DollarSign, Calendar, FileText } from "lucide-react";

// // Mock hooks - replace with your actual implementations
// const useAuth = () => ({
//   admin: { name: 'John Admin' },
//   logout: () => console.log('Logout')
// });

// const useSubmissions = (filter: string) => ({
//   submissions: [
//     {
//       _id: '1',
//       fullName: 'Sarah Johnson',
//       email: 'sarah.j@example.com',
//       phoneNumber: '+234-801-234-5678',
//       referredBy: 'Michael Smith',
//       amount: 50000,
//       status: 'pending',
//       referenceId: 'REF-2024-001',
//       createdAt: new Date().toISOString(),
//       receiptUrl: '/receipt1.pdf'
//     },
//     {
//       _id: '2',
//       fullName: 'David Wilson',
//       email: 'david.w@example.com',
//       phoneNumber: '+234-802-345-6789',
//       referredBy: 'Lisa Brown',
//       amount: 75000,
//       status: 'approved',
//       referenceId: 'REF-2024-002',
//       createdAt: new Date(Date.now() - 86400000).toISOString(),
//       reviewedAt: new Date().toISOString(),
//       reviewedBy: 'Admin User'
//     },
//     {
//       _id: '3',
//       fullName: 'Emma Davis',
//       email: 'emma.d@example.com',
//       phoneNumber: '+234-803-456-7890',
//       referredBy: 'Robert Taylor',
//       amount: 25000,
//       status: 'rejected',
//       referenceId: 'REF-2024-003',
//       createdAt: new Date(Date.now() - 172800000).toISOString(),
//       reviewedAt: new Date(Date.now() - 86400000).toISOString(),
//       reviewedBy: 'Admin User',
//       rejectionReason: 'Incomplete documentation provided'
//     }
//   ],
//   isLoading: false,
//   useSubmissionDetails: (id: string) => ({
//     data: id ? [
//       {
//         _id: '1',
//         fullName: 'Sarah Johnson',
//         email: 'sarah.j@example.com',
//         phoneNumber: '+234-801-234-5678',
//         referredBy: 'Michael Smith',
//         amount: 50000,
//         status: 'pending',
//         referenceId: 'REF-2024-001',
//         createdAt: new Date().toISOString(),
//         receiptUrl: '/receipt1.pdf'
//       },
//       {
//         _id: '2',
//         fullName: 'David Wilson',
//         email: 'david.w@example.com',
//         phoneNumber: '+234-802-345-6789',
//         referredBy: 'Lisa Brown',
//         amount: 75000,
//         status: 'approved',
//         referenceId: 'REF-2024-002',
//         createdAt: new Date(Date.now() - 86400000).toISOString(),
//         reviewedAt: new Date().toISOString(),
//         reviewedBy: 'Admin User'
//       },
//       {
//         _id: '3',
//         fullName: 'Emma Davis',
//         email: 'emma.d@example.com',
//         phoneNumber: '+234-803-456-7890',
//         referredBy: 'Robert Taylor',
//         amount: 25000,
//         status: 'rejected',
//         referenceId: 'REF-2024-003',
//         createdAt: new Date(Date.now() - 172800000).toISOString(),
//         reviewedAt: new Date(Date.now() - 86400000).toISOString(),
//         reviewedBy: 'Admin User',
//         rejectionReason: 'Incomplete documentation provided'
//       }
//     ].find(sub => sub._id === id) : null
//   }),
//   approveSubmission: (id: string) => console.log('Approve:', id),
//   rejectSubmission: ({ id, reason }: { id: string; reason: string }) => console.log('Reject:', id, reason),
//   isApproving: false,
//   isRejecting: false,
// });

// const AdminDashboard = () => {
//   const { admin, logout } = useAuth();
//   const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
//   const [filter, setFilter] = useState('all');
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [showRejectModal, setShowRejectModal] = useState(false);

//   const {
//     submissions,
//     isLoading,
//     useSubmissionDetails,
//     approveSubmission,
//     rejectSubmission,
//     isApproving,
//     isRejecting,
//   } = useSubmissions(filter);

//   const { data: selectedSubmission } = useSubmissionDetails(selectedSubmissionId);

//   const handleApprove = (id: string) => {
//     approveSubmission(id);
//   };

//   const handleReject = (id: string) => {
//     rejectSubmission({ id, reason: rejectionReason });
//     setShowRejectModal(false);
//     setRejectionReason('');
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'pending':
//         return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
//       case 'approved':
//         return <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>;
//       case 'rejected':
//         return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center gradient-subtle">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="h-12 w-12 animate-spin text-primary" />
//           <p className="text-muted-foreground">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen gradient-subtle">
//       {/* Beautiful Header */}
//       <div className="gradient-primary shadow-elegant">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-8">
//             <div className="text-white">
//               <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
//               <p className="text-white/80 mt-2">Welcome back, {admin?.name || 'Admin'}</p>
//             </div>
//             <Button 
//               onClick={logout}
//               variant="secondary"
//               className="glass-effect hover:shadow-hover transition-smooth"
//             >
//               Logout
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Submissions List */}
//           <div className="lg:col-span-2">
//             <Card className="shadow-card border-0 transition-smooth hover:shadow-hover">
//               <CardHeader className="border-b bg-card/50">
//                 <div className="flex justify-between items-center">
//                   <CardTitle className="text-xl font-semibold">Submissions</CardTitle>
//                   <Select value={filter} onValueChange={setFilter}>
//                     <SelectTrigger className="w-40">
//                       <SelectValue placeholder="Filter by status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="approved">Approved</SelectItem>
//                       <SelectItem value="rejected">Rejected</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </CardHeader>
              
//               <CardContent className="p-0">
//                 {submissions.length === 0 ? (
//                   <div className="p-8 text-center text-muted-foreground">
//                     <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                     <p>No submissions found</p>
//                   </div>
//                 ) : (
//                   <div className="divide-y">
//                     {submissions.map((submission) => (
//                       <div
//                         key={submission._id}
//                         className={`p-6 hover:bg-muted/30 cursor-pointer transition-smooth ${
//                           selectedSubmissionId === submission._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
//                         }`}
//                         onClick={() => setSelectedSubmissionId(submission._id)}
//                       >
//                         <div className="flex justify-between items-start gap-4">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
//                                 <User className="w-5 h-5 text-primary" />
//                               </div>
//                               <div>
//                                 <h3 className="font-semibold text-foreground">{submission.fullName}</h3>
//                                 <p className="text-sm text-muted-foreground">{submission.email}</p>
//                               </div>
//                             </div>
//                             <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded inline-block">
//                               {submission.referenceId}
//                             </p>
//                           </div>
//                           <div className="text-right flex flex-col items-end gap-2">
//                             {getStatusBadge(submission.status)}
//                             <p className="text-xs text-muted-foreground">
//                               {new Date(submission.createdAt).toLocaleDateString()}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Submission Details */}
//           <div className="lg:col-span-1">
//             {selectedSubmission ? (
//               <Card className="shadow-card border-0 transition-smooth hover:shadow-hover">
//                 <CardHeader className="gradient-subtle border-b">
//                   <CardTitle className="text-xl font-semibold flex items-center gap-2">
//                     <FileText className="w-5 h-5" />
//                     Submission Details
//                   </CardTitle>
//                 </CardHeader>
                
//                 <CardContent className="p-6 space-y-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <FileText className="w-4 h-4 text-muted-foreground" />
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Reference ID</span>
//                         <p className="font-mono text-sm">{selectedSubmission.referenceId}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <User className="w-4 h-4 text-muted-foreground" />
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Full Name</span>
//                         <p className="font-semibold">{selectedSubmission.fullName}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <Mail className="w-4 h-4 text-muted-foreground" />
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Email</span>
//                         <p className="text-sm">{selectedSubmission.email}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <Phone className="w-4 h-4 text-muted-foreground" />
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Phone</span>
//                         <p className="text-sm">{selectedSubmission.phoneNumber}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <User className="w-4 h-4 text-muted-foreground" />
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Referred By</span>
//                         <p className="text-sm">{selectedSubmission.referredBy}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <DollarSign className="w-4 h-4 text-muted-foreground" />
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Amount</span>
//                         <p className="text-lg font-bold">₦{selectedSubmission.amount?.toLocaleString()}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <div className="w-4 h-4 flex items-center justify-center">
//                         {selectedSubmission.status === 'pending' && <Clock className="w-4 h-4 text-warning" />}
//                         {selectedSubmission.status === 'approved' && <CheckCircle className="w-4 h-4 text-success" />}
//                         {selectedSubmission.status === 'rejected' && <XCircle className="w-4 h-4 text-destructive" />}
//                       </div>
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Status</span>
//                         {getStatusBadge(selectedSubmission.status)}
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                       <Calendar className="w-4 h-4 text-muted-foreground" />
//                       <div>
//                         <span className="text-xs font-medium text-muted-foreground block">Submission Date</span>
//                         <p className="text-sm">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
//                       </div>
//                     </div>

//                     {selectedSubmission.receiptUrl && (
//                       <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                         <ExternalLink className="w-4 h-4 text-muted-foreground" />
//                         <div>
//                           <span className="text-xs font-medium text-muted-foreground block">Receipt</span>
//                           <Button 
//                             variant="link" 
//                             className="p-0 h-auto text-primary hover:text-primary-glow"
//                             asChild
//                           >
//                             <a
//                               href={`http://localhost:3000${selectedSubmission.receiptUrl}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               View Receipt
//                             </a>
//                           </Button>
//                         </div>
//                       </div>
//                     )}

//                     {selectedSubmission.status === 'pending' && (
//                       <div className="pt-4 space-y-3">
//                         <Button
//                           onClick={() => handleApprove(selectedSubmission._id)}
//                           disabled={isApproving}
//                           variant="success"
//                           className="w-full transition-bounce"
//                         >
//                           {isApproving ? (
//                             <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Approving...</>
//                           ) : (
//                             <><CheckCircle className="w-4 h-4 mr-2" />Approve</>
//                           )}
//                         </Button>
                        
//                         <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
//                           <DialogTrigger asChild>
//                             <Button
//                               variant="destructive"
//                               className="w-full transition-bounce"
//                               disabled={isRejecting}
//                             >
//                               <XCircle className="w-4 h-4 mr-2" />
//                               Reject
//                             </Button>
//                           </DialogTrigger>
//                           <DialogContent className="sm:max-w-md">
//                             <DialogHeader>
//                               <DialogTitle className="flex items-center gap-2">
//                                 <XCircle className="w-5 h-5 text-destructive" />
//                                 Reject Submission
//                               </DialogTitle>
//                             </DialogHeader>
//                             <div className="space-y-4">
//                               <div>
//                                 <label className="text-sm font-medium text-foreground mb-2 block">
//                                   Rejection Reason
//                                 </label>
//                                 <Textarea
//                                   value={rejectionReason}
//                                   onChange={(e) => setRejectionReason(e.target.value)}
//                                   placeholder="Please provide a reason for rejection..."
//                                   className="min-h-[100px]"
//                                 />
//                               </div>
//                               <div className="flex justify-end gap-3">
//                                 <Button
//                                   variant="outline"
//                                   onClick={() => {
//                                     setShowRejectModal(false);
//                                     setRejectionReason('');
//                                   }}
//                                 >
//                                   Cancel
//                                 </Button>
//                                 <Button
//                                   variant="destructive"
//                                   onClick={() => handleReject(selectedSubmission._id)}
//                                   disabled={!rejectionReason.trim() || isRejecting}
//                                 >
//                                   {isRejecting ? (
//                                     <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rejecting...</>
//                                   ) : (
//                                     'Reject'
//                                   )}
//                                 </Button>
//                               </div>
//                             </div>
//                           </DialogContent>
//                         </Dialog>
//                       </div>
//                     )}

//                     {selectedSubmission.reviewedAt && (
//                       <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
//                         <Calendar className="w-4 h-4 text-muted-foreground" />
//                         <div>
//                           <span className="text-xs font-medium text-muted-foreground block">Reviewed</span>
//                           <p className="text-sm">{new Date(selectedSubmission.reviewedAt).toLocaleString()}</p>
//                           <p className="text-xs text-muted-foreground">by {selectedSubmission.reviewedBy}</p>
//                         </div>
//                       </div>
//                     )}

//                     {selectedSubmission.rejectionReason && (
//                       <div className="p-4 bg-error-light border border-error/20 rounded-lg">
//                         <span className="text-sm font-medium text-error block mb-2">Rejection Reason</span>
//                         <p className="text-sm text-error/80">{selectedSubmission.rejectionReason}</p>
//                       </div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             ) : (
//               <Card className="shadow-card border-0">
//                 <CardContent className="p-8 text-center">
//                   <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
//                   <p className="text-muted-foreground">Select a submission to view details</p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;