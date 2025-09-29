const multer = require('multer');

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

// Middleware to convert file to base64
const convertToBase64 = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Convert buffer to base64
    const base64String = req.file.buffer.toString('base64');
    
    // Add base64 data to req.file
    req.file.base64 = base64String;
    req.file.dataUrl = `data:${req.file.mimetype};base64,${base64String}`;
    
    console.log(`File converted to base64: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    
    next();
  } catch (error) {
    console.error('Base64 conversion error:', error);
    return res.status(500).json({ 
      error: 'File processing failed',
      details: 'Unable to process the uploaded file',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { upload, convertToBase64 };