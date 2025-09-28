const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for multer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Custom middleware to upload to Cloudinary with detailed error handling
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary configuration');
      return res.status(500).json({ 
        error: 'Cloud storage configuration error',
        details: 'Missing required Cloudinary environment variables',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Uploading file: ${req.file.originalname}, Size: ${req.file.size} bytes, Type: ${req.file.mimetype}`);

    // Convert buffer to stream
    const stream = Readable.from(req.file.buffer);
    
    // Upload to Cloudinary with timeout
    const result = await Promise.race([
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'dinner-registration/receipts',
            resource_type: 'auto',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload successful:', result.public_id);
              resolve(result);
            }
          }
        );
        
        stream.pipe(uploadStream);
      }),
      // 30 second timeout
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
      )
    ]);

    // Add Cloudinary info to req.file
    req.file.path = result.secure_url;
    req.file.filename = result.public_id;
    req.file.cloudinary = result;

    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Detailed error responses based on error type
    if (error.message === 'Upload timeout after 30 seconds') {
      return res.status(408).json({ 
        error: 'Upload timeout',
        details: 'File upload took too long. Please try again with a smaller file.',
        timestamp: new Date().toISOString()
      });
    }

    if (error.http_code) {
      // Cloudinary specific errors
      return res.status(400).json({ 
        error: 'Cloud storage error',
        details: error.message || 'Failed to upload file to cloud storage',
        cloudinaryError: {
          code: error.http_code,
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Network error',
        details: 'Unable to connect to cloud storage service. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }

    // Generic error
    return res.status(500).json({ 
      error: 'File upload failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error during file upload',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { upload, uploadToCloudinary };