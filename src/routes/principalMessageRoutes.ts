import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import PrincipalMessageController from '../controller/PrincipalMessageController';

const router = express.Router();

/**
 * @route POST /api/v1/principal-message
 * @desc Create a new principal message
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/principal-message', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, PrincipalMessageController.createPrincipalMessage);

/**
 * @route GET /api/v1/principal-message
 * @desc Get the principal message
 * @access Public
 */
router.get('/v1/principal-message', PrincipalMessageController.getPrincipalMessage);

/**
 * @route PUT /api/v1/principal-message/:id
 * @desc Update principal message
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/principal-message/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, PrincipalMessageController.updatePrincipalMessage);

/**
 * @route DELETE /api/v1/principal-message/:id
 * @desc Hard delete principal message
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/principal-message/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, PrincipalMessageController.deletePrincipalMessage);

export default router;