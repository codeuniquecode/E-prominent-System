const multer = require('multer');
const path = require('path');

// Define storage location and filename
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Files will be stored in the 'storage/' directory
        cb(null, path.join(__dirname, '../storage'));
    },
    filename: function(req, file, cb) {
        // Create a unique filename: timestamp + original name
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// File filter (optional, but recommended)
// This example only allows PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf files are allowed!'), false);
    }
};

// Initialize multer upload middleware
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
});

module.exports = upload;