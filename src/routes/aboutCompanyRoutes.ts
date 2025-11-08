import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import AboutCompanyController from '../controller/AboutCompanyController';

const router = express.Router();

/**
 * @route POST /api/v1/about-company
 * @desc Create a new about company record
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/about-company', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, AboutCompanyController.createAboutCompany);

/**
 * @route GET /api/v1/about-company/active
 * @desc Get all active about company records
 * @access Public
 */
router.get('/v1/about-company/active', AboutCompanyController.getAllActiveAboutCompany);

/**
 * @route GET /api/v1/about-company
 * @desc Get all about company records (including inactive)
 * @access Private (Admin/SuperAdmin)
 */
router.get('/v1/about-company', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, AboutCompanyController.getAllAboutCompany);

/**
 * @route GET /api/v1/about-company/:id
 * @desc Get about company by ID
 * @access Public
 */
router.get('/v1/about-company/:id', AboutCompanyController.getAboutCompanyById);

/**
 * @route PUT /api/v1/about-company/:id
 * @desc Update about company details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/about-company/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, AboutCompanyController.updateAboutCompany);

/**
 * @route DELETE /api/v1/about-company/:id
 * @desc Deactivate/soft delete about company
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/about-company/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, AboutCompanyController.deactivateAboutCompany);

/**
 * @route DELETE /api/v1/about-company/:id/permanent
 * @desc Permanently delete about company
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/about-company/:id/permanent', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, AboutCompanyController.deleteAboutCompany);

export default router;