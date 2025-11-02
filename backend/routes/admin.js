const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Submission = require('../models/Submission');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const emailService = require('../utils/emailService');
const path = require('path');
const fs = require('fs');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin authentication and management
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log the login
    await new AuditLog({
      adminEmail: admin.email,
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }).save();

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @swagger
 * /api/admin/submissions:
 *   get:
 *     summary: Get all submissions with filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Submission'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Verify admin authentication (lightweight endpoint for token validation)
router.get('/verify', auth, async (req, res) => {
  try {
    // If we reach here, the token is valid (middleware passed)
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        name: req.admin.name
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication verification failed' 
    });
  }
});

router.get('/submissions', auth, async (req, res) => {
  try {
    console.log('📊 Submissions endpoint called');
    console.log('   Query params:', req.query);
    console.log('   Admin:', req.admin?.username);
    
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    
    console.log('   Database query:', query);
    
    const skip = (page - 1) * limit;
    const submissions = await Submission.find(query)
      .sort({ submissionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    console.log(`   Found ${submissions.length} submissions (${total} total)`);

    res.json({
      submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Submissions endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

/**
 * @swagger
 * /api/admin/submissions/{id}:
 *   get:
 *     summary: Get a specific submission by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/submissions/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

/**
 * @swagger
 * /api/admin/submissions/{id}/approve:
 *   post:
 *     summary: Approve a submission
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 submission:
 *                   $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Submission already processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/submissions/:id/approve', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ error: 'Submission already processed' });
    }

    submission.status = 'approved';
    submission.reviewedAt = new Date();
    submission.reviewedBy = req.admin.email;
    
    await submission.save();

    // Log the action (in approve route)
    await new AuditLog({
      adminEmail: req.admin.email,
      action: 'approve_submission',
      submissionId: submission._id, // Changed from targetId to submissionId
      details: `Approved submission for ${submission.fullName}`,
      ipAddress: req.ip
    }).save();

    // Send response immediately to prevent timeout
    res.json({ 
      message: 'Submission approved successfully',
      submission 
    });

    // Send approval email asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        console.log(`📤 Sending approval email to ${submission.email} (async)`);
        const emailResult = await emailService.sendApprovalEmail(submission);
        if (emailResult.success) {
          console.log(`✅ Approval email sent successfully to ${submission.email}`);
        } else {
          console.error(`❌ Failed to send approval email to ${submission.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Approval email error:', emailError);
      }
    });

  } catch (error) {
    // Add detailed error logging
    console.error('Approval error details:', {
      submissionId: req.params.id,
      adminEmail: req.admin?.email,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to approve submission' });
  }
});

/**
 * @swagger
 * /api/admin/submissions/{id}/reject:
 *   post:
 *     summary: Reject a submission
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Submission rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 submission:
 *                   $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Bad request or submission already processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/submissions/:id/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ error: 'Submission already processed' });
    }

    submission.status = 'rejected';
    submission.rejectionReason = reason;
    submission.reviewedAt = new Date();
    submission.reviewedBy = req.admin.email;
    
    await submission.save();

    // Log the action (in reject route)
    await new AuditLog({
      adminEmail: req.admin.email,
      action: 'reject_submission',
      submissionId: submission._id, // Changed from targetId to submissionId
      details: `Rejected submission for ${submission.fullName}: ${reason}`,
      ipAddress: req.ip
    }).save();

    // Send response immediately to prevent timeout
    res.json({ 
      message: 'Submission rejected successfully',
      submission 
    });

    // Send rejection email asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        console.log(`📤 Sending rejection email to ${submission.email} (async)`);
        const emailResult = await emailService.sendRejectionEmail(submission, reason);
        if (emailResult.success) {
          console.log(`✅ Rejection email sent successfully to ${submission.email}`);
        } else {
          console.error(`❌ Failed to send rejection email to ${submission.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Rejection email error:', emailError);
      }
    });

  } catch (error) {
    console.error('Rejection error details:', {
      submissionId: req.params.id,
      adminEmail: req.admin?.email,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to reject submission' });
  }
});

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       adminEmail:
 *                         type: string
 *                       action:
 *                         type: string
 *                       targetId:
 *                         type: string
 *                       details:
 *                         type: string
 *                       ipAddress:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/audit-logs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * @swagger
 * /api/admin/submissions/{id}/receipt:
 *   get:
 *     summary: Get receipt image for a submission
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Receipt image data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dataUrl:
 *                   type: string
 *                   description: Base64 data URL of the image
 *                 mimeType:
 *                   type: string
 *                 originalName:
 *                   type: string
 *                 size:
 *                   type: number
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Server error
 */
router.get('/submissions/:id/receipt', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .select('receiptImage receiptMimeType receiptOriginalName receiptSize');
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (!submission.receiptImage) {
      return res.status(404).json({ error: 'Receipt image not found' });
    }

    res.json({
      dataUrl: `data:${submission.receiptMimeType};base64,${submission.receiptImage}`,
      mimeType: submission.receiptMimeType,
      originalName: submission.receiptOriginalName,
      size: submission.receiptSize
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// Add this route for testing emails
/**
 * @swagger
 * /api/admin/test-email:
 *   post:
 *     summary: Test email functionality
 *     description: Send test approval or rejection emails to verify email service is working
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [approval, rejection]
 *                 description: Type of email to test
 *                 example: approval
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send test email to
 *                 example: test@example.com
 *               referenceId:
 *                 type: string
 *                 description: Reference ID to use in test email
 *                 example: TEST123
 *     responses:
 *       200:
 *         description: Email test completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Approval email test completed
 *       400:
 *         description: Invalid email type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Email test failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email test failed
 *                 details:
 *                   type: string
 *                   example: SMTP connection failed
 */
router.post('/test-email', auth, async (req, res) => {
  try {
    const { type, email, referenceId } = req.body;
    
    // Create a mock submission object for testing
    const mockSubmission = {
      email: email || 'test@example.com',
      referenceId: referenceId || 'TEST123',
      fullName: 'Test User'
    };

    if (type === 'approval') {
      await emailService.sendApprovalEmail(mockSubmission);
      res.json({ message: 'Approval email test completed' });
    } else if (type === 'rejection') {
      await emailService.sendRejectionEmail(mockSubmission, 'Test rejection reason');
      res.json({ message: 'Rejection email test completed' });
    } else {
      res.status(400).json({ error: 'Invalid email type. Use "approval" or "rejection"' });
    }
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: 'Email test failed', details: error.message });
  }
});

module.exports = router;