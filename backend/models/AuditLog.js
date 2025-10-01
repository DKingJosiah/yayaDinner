const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['approve', 'reject', 'login', 'approve_submission', 'reject_submission'],
    required: true
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  referenceId: {
    type: String
  },
  details: {
    type: Object
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);