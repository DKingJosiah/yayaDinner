const express = require('express');
const multer = require('multer');
const Submission = require('../models/Submission');
const { upload, uploadToCloudinary } = require('../middleware/cloudinaryUpload');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Registration submission management
 */

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Submit a new registration
 *     tags: [Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - email
 *               - referredBy
 *               - receipt
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the registrant
 *               lastName:
 *                 type: string
 *                 description: Last name of the registrant
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               referredBy:
 *                 type: string
 *                 description: Name of the person who referred
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Payment receipt file
 *     responses:
 *       201:
 *         description: Registration submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 referenceId:
 *                   type: string
 *                 submissionId:
 *                   type: string
 *       400:
 *         description: Bad request (missing file or email already exists)
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
router.post('/', 
  // First handle file upload to memory
  (req, res, next) => {
    upload.single('receipt')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: 'File too large', 
              details: 'Maximum file size is 5MB. Please compress your image or choose a smaller file.',
              maxSize: '5MB',
              timestamp: new Date().toISOString()
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
              error: 'Unexpected file field', 
              details: 'Please ensure the file field is named "receipt".',
              timestamp: new Date().toISOString()
            });
          }
          return res.status(400).json({ 
            error: 'Upload error', 
            details: err.message,
            code: err.code,
            timestamp: new Date().toISOString()
          });
        }
        
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({ 
            error: 'Invalid file type', 
            details: 'Only JPG, PNG, and PDF files are allowed.',
            allowedTypes: ['JPG', 'PNG', 'PDF'],
            timestamp: new Date().toISOString()
          });
        }
        
        return res.status(400).json({ 
          error: 'File upload error', 
          details: err.message,
          timestamp: new Date().toISOString()
        });
      }
      next();
    });
  },
  // Then upload to Cloudinary
  uploadToCloudinary,
  // Finally process the submission
  async (req, res) => {
    try {
      console.log('Processing submission for:', req.body.email);
      
      const { firstName, lastName, phoneNumber, email, referredBy } = req.body;

      // Validate required fields
      const requiredFields = { firstName, lastName, phoneNumber, email, referredBy };
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.trim() === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: `The following fields are required: ${missingFields.join(', ')}`,
          missingFields,
          timestamp: new Date().toISOString()
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: 'Receipt file is required',
          details: 'Please upload a receipt image (JPG, PNG) or PDF file.',
          timestamp: new Date().toISOString()
        });
      }

      // Check if email already exists
      const existingSubmission = await Submission.findOne({ email });
      if (existingSubmission) {
        return res.status(400).json({ 
          error: 'Email already registered',
          details: 'This email address has already been used for registration. Each email can only be used once.',
          existingReferenceId: existingSubmission.referenceId,
          timestamp: new Date().toISOString()
        });
      }

      const submission = new Submission({
        firstName,
        lastName,
        phoneNumber,
        email,
        referredBy,
        receiptPath: req.file.path, // Cloudinary URL
        receiptOriginalName: req.file.originalname,
        receiptCloudinaryId: req.file.filename // Cloudinary public ID
      });

      await submission.save();
      console.log('Submission saved successfully:', submission.referenceId);

      res.status(201).json({
        message: 'Registration submitted successfully',
        referenceId: submission.referenceId,
        submissionId: submission._id,
        receiptUrl: req.file.path,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Submission error:', error);
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
        
        return res.status(400).json({ 
          error: 'Validation failed',
          details: 'One or more fields contain invalid data',
          validationErrors,
          timestamp: new Date().toISOString()
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        return res.status(400).json({ 
          error: `Duplicate ${field}`,
          details: `The ${field} "${value}" is already registered`,
          field,
          value,
          timestamp: new Date().toISOString()
        });
      }

      // Handle MongoDB connection errors
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        return res.status(503).json({ 
          error: 'Database connection error',
          details: 'Unable to connect to database. Please try again later.',
          timestamp: new Date().toISOString()
        });
      }

      // Generic error with full details in development
      res.status(500).json({ 
        error: 'Failed to submit registration',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          errorName: error.name
        }),
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @swagger
 * /api/submissions/status/{referenceId}:
 *   get:
 *     summary: Get submission status by reference ID
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: referenceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reference ID of the submission
 *     responses:
 *       200:
 *         description: Submission status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referenceId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 submissionDate:
 *                   type: string
 *                   format: date-time
 *                 fullName:
 *                   type: string
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
router.get('/status/:referenceId', async (req, res) => {
  try {
    const submission = await Submission.findOne({ 
      referenceId: req.params.referenceId 
    }).select('referenceId status submissionDate firstName lastName');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      referenceId: submission.referenceId,
      status: submission.status,
      submissionDate: submission.submissionDate,
      fullName: submission.fullName
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve status' });
  }
});

module.exports = router;