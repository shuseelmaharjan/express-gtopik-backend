import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { generateUniqueFileName } from '../utils/fileNameHelper';
import User from '../models/User';

// Max 5MB
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(['.jpg', '.jpeg', '.png']);

// Minimal type augmentation to satisfy TS when using generic file upload middleware
interface FileLike { name: string; size: number; mv?: Function; data?: Buffer }
interface FilesLike { [k: string]: FileLike }

export class UploadController {
  static async uploadProfile(req: Request, res: Response) {
    try {
      const files = (req as any).files as FilesLike | undefined;
      if (!files || !files.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const file = files.file as FileLike; // expecting middleware to set files.file
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        return res.status(400).json({ success: false, message: 'File exceeds 5MB limit' });
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED.has(ext)) {
        return res.status(400).json({ success: false, message: 'Only JPG and PNG files are allowed' });
      }

      // Ensure upload directory exists
      const baseDir = path.join(__dirname, '..', 'uploads', 'profile');
      fs.mkdirSync(baseDir, { recursive: true });

      const uniqueName = generateUniqueFileName(file.name).replace(/\.(jpeg)$/,'$1').replace(/\.jpeg$/,'.jpg');
      const finalPath = path.join(baseDir, uniqueName);

      // Support both express-fileupload (mv) or raw buffer
      if (typeof file.mv === 'function') {
        if (typeof file.mv === 'function') {
          await new Promise<void>((resolve, reject) => {
            file.mv!(finalPath, (err: any) => err ? reject(err) : resolve());
          });
        } else if (file.data) {
          const fs = await import('fs');
          await fs.promises.writeFile(finalPath, file.data);
        } else {
          return res.status(500).json({ success: false, message: 'File data handler missing' });
        }
      } else if (file.data) {
        fs.writeFileSync(finalPath, file.data);
      } else {
        return res.status(500).json({ success: false, message: 'Unsupported file middleware' });
      }

      // Store relative path for client consumption
      const storedPath = `/uploads/profile/${uniqueName}`;
      await User.update({ profilePicture: storedPath }, { where: { id: userId } });
      return res.status(200).json({ success: true, message: 'Profile image uploaded', path: storedPath });
    } catch (error: any) {
      console.error('Upload error:', error);
      return res.status(500).json({ success: false, message: 'Failed to upload file' });
    }
  }
}
