import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import DownloadController from '../controller/DownloadController';

const router = express.Router();

/**
 * @route POST /api/v1/downloads
 * @desc Create a new download
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/downloads', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, DownloadController.createDownload);

/**
 * @route GET /api/v1/downloads/active
 * @desc Get all active downloads
 * @access Public
 */
router.get('/v1/downloads/active', DownloadController.getAllActiveDownloads);

/**
 * @route GET /api/v1/downloads
 * @desc Get all downloads (including inactive)
 * @access Private (Admin/SuperAdmin)
 */
router.get('/v1/downloads', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, DownloadController.getAllDownloads);

/**
 * @route GET /api/v1/downloads/type/:fileType
 * @desc Get downloads by file type (image or pdf)
 * @access Public
 */
router.get('/v1/downloads/type/:fileType', DownloadController.getDownloadsByFileType);

/**
 * @route GET /api/v1/downloads/:id
 * @desc Get download by ID
 * @access Public
 */
router.get('/v1/downloads/:id', DownloadController.getDownloadById);

/**
 * @route PUT /api/v1/downloads/:id
 * @desc Update download details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/downloads/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, DownloadController.updateDownload);

/**
 * @route DELETE /api/v1/downloads/:id
 * @desc Deactivate/soft delete download
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/downloads/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, DownloadController.deactivateDownload);

/**
 * @route DELETE /api/v1/downloads/:id/permanent
 * @desc Permanently delete download
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/downloads/:id/permanent', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, DownloadController.deleteDownload);

export default router;