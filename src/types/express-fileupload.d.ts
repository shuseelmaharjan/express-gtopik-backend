// Minimal ambient declarations for express-fileupload to satisfy TypeScript
// If you later install @types/express-fileupload you can remove this file.
import 'express';

declare module 'express-fileupload' {
  import { RequestHandler } from 'express';
  interface Options {
    limits?: { fileSize?: number };
    abortOnLimit?: boolean;
    useTempFiles?: boolean;
    tempFileDir?: string;
    createParentPath?: boolean;
  }
  interface UploadedFile {
    name: string;
    data: Buffer;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    md5: string;
    mv: (path: string, callback: (err?: any) => void) => void;
    mimetype?: string;
  }
  interface FileArray { [fieldname: string]: UploadedFile | UploadedFile[] }
  function fileUpload(options?: Options): RequestHandler;
  export = fileUpload;
}

declare global {
  namespace Express {
    interface Request {
      files?: { [fieldname: string]: any };
    }
  }
}
