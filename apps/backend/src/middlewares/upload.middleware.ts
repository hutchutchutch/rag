import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/index';

// Ensure uploads directory exists
if (!fs.existsSync(config.paths.uploads)) {
  fs.mkdirSync(config.paths.uploads, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.uploads);
  },
  filename: (req, file, cb) => {
    // Preserve original filename but ensure uniqueness
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, extension) + '-' + uniqueSuffix + extension);
  },
});

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only markdown files
  if (file.mimetype === 'text/markdown' || 
      file.originalname.endsWith('.md') || 
      file.originalname.endsWith('.markdown')) {
    cb(null, true);
  } else {
    cb(new Error('Only markdown files are allowed'));
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

export default upload;