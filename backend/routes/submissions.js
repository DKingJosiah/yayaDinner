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
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  // Then upload to Cloudinary
  uploadToCloudinary,
  // Finally process the submission
  async (req, res) => {
    try {
      const { firstName, lastName, phoneNumber, email, referredBy } = req.body;

      // Validate required fields
      const requiredFields = { firstName, lastName, phoneNumber, email, referredBy };
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.trim() === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Receipt file is required' });
      }

      // Check if email already exists
      const existingSubmission = await Submission.findOne({ email });
      if (existingSubmission) {
        return res.status(400).json({ 
          error: 'Email already registered',
          details: 'This email address has already been used for registration'
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

      res.status(201).json({
        message: 'Registration submitted successfully',
        referenceId: submission.referenceId,
        submissionId: submission._id
      });

    } catch (error) {
      console.error('Submission error:', error);
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          error: 'Validation failed',
          details: validationErrors
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ 
          error: `Duplicate ${field}`,
          details: `This ${field} is already registered`
        });
      }

      res.status(500).json({ 
        error: 'Failed to submit registration',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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