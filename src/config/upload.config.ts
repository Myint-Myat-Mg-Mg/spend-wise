// src/config/upload.config.ts
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/profile-images',
    filename: (req, file, callback) => {
      const filename: string = `${uuidv4()}${path.extname(file.originalname)}`;
      callback(null, filename);
    },
  }),
};

export const multerOptions = {
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
};
