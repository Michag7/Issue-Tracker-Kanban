import { Router } from "express";
import * as invitationController from "../controllers/invitation.controller";
import { authenticate } from "../middlewares/auth";
import { requireOrgAdmin } from "../middlewares/permission";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /invitations/my:
 *   get:
 *     summary: Obtener mis invitaciones pendientes
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones pendientes
 */
router.get("/my", invitationController.getMyPendingInvitations);

/**
 * @swagger
 * /invitations/{token}:
 *   get:
 *     summary: Obtener detalles de una invitación por token
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la invitación
 */
router.get("/:token", invitationController.getByToken);

/**
 * @swagger
 * /invitations/accept:
 *   post:
 *     summary: Aceptar una invitación
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitación aceptada exitosamente
 */
router.post("/accept", invitationController.accept);

/**
 * @swagger
 * /invitations/reject:
 *   post:
 *     summary: Rechazar una invitación
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitación rechazada
 */
router.post("/reject", invitationController.reject);

/**
 * @swagger
 * /invitations/{id}/accept:
 *   post:
 *     summary: Aceptar una invitación por ID
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitación aceptada exitosamente
 */
router.post("/:id/accept", invitationController.acceptById);

/**
 * @swagger
 * /invitations/{id}/reject:
 *   post:
 *     summary: Rechazar una invitación por ID
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitación rechazada
 */
router.post("/:id/reject", invitationController.rejectById);

/**
 * @swagger
 * /invitations/{id}/cancel:
 *   delete:
 *     summary: Cancelar una invitación
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitación cancelada
 */
router.delete("/:id/cancel", invitationController.cancel);

/**
 * @swagger
 * /organizations/{orgId}/invitations:
 *   post:
 *     summary: Crear una invitación (solo admin)
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitación creada exitosamente
 */
router.post("/org/:orgId", requireOrgAdmin, invitationController.create);

/**
 * @swagger
 * /organizations/{orgId}/invitations:
 *   get:
 *     summary: Obtener invitaciones de una organización (solo admin)
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de invitaciones de la organización
 */
router.get(
  "/org/:orgId",
  requireOrgAdmin,
  invitationController.getOrganizationInvitations
);

export default router;
