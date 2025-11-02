const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    // Updated regex to allow phone numbers starting with 0 or + and be more flexible
    match: [/^[\+]?[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits, optionally starting with +)']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  referredBy: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  // Base64 image storage
  receiptImage: {
    type: String,
    required: true // Base64 encoded image
  },
  receiptMimeType: {
    type: String,
    required: true // e.g., 'image/jpeg', 'image/png', 'application/pdf'
  },
  receiptOriginalName: {
    type: String,
    required: true
  },
  receiptSize: {
    type: Number,
    required: true // File size in bytes
  },
  // Keep legacy fields for backward compatibility (optional)
  receiptPath: {
    type: String,
    required: false
  },
  receiptCloudinaryId: {
    type: String,
    required: false
  },
  amount: {
    type: Number,
    default: 12000,
    immutable: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  referenceId: {
    type: String,
    unique: true,
    // Remove required: true since we auto-generate it
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for full name
submissionSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
submissionSchema.set('toJSON', {
  virtuals: true
});

// Auto-generate referenceId before saving
submissionSchema.pre('save', function(next) {
  if (!this.referenceId) {
    this.referenceId = 'REF' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);