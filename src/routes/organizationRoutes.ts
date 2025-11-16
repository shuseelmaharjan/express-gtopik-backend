import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import OrganizationController from '../controller/OrganizationController';

const router = express.Router();

/**
 * @route POST /api/v1/organization
 * @desc Create a new organization
 * @access Private (Admin/SuperAdmin)
 */
router.post(
    '/v1/organization',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    OrganizationController.createOrganization
);

/**
 * @route GET /api/v1/organization
 * @desc Get all organizations
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/organization',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    OrganizationController.getAllOrganizations
);

/**
 * @route GET /api/v1/organization/:id
 * @desc Get organization by ID
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/organization/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    OrganizationController.getOrganizationById
);

/**
 * @route PUT /api/v1/organization/:id
 * @desc Update organization
 * @access Private (Admin/SuperAdmin)
 */
router.put(
    '/v1/organization/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    OrganizationController.updateOrganization
);

/**
 * @route DELETE /api/v1/organization/:id
 * @desc Delete organization
 * @access Private (Admin/SuperAdmin)
 */
router.delete(
    '/v1/organization/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    OrganizationController.deleteOrganization
);

export default router;
