import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";
import { authenticate } from "../middlewares/auth";
import { requireOrgAdmin } from "../middlewares/permission";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /organizations:
 *   post:
 *     summary: Crear una nueva organización
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organización creada exitosamente
 */
router.post("/", organizationController.create);

/**
 * @swagger
 * /organizations/my:
 *   get:
 *     summary: Obtener mis organizaciones
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de organizaciones del usuario
 */
router.get("/my", organizationController.getMyOrganizations);

/**
 * @swagger
 * /organizations/switch:
 *   post:
 *     summary: Cambiar de organización actual
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orgId
 *             properties:
 *               orgId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organización cambiada exitosamente
 */
router.post("/switch", organizationController.switchOrganization);

/**
 * @swagger
 * /organizations/{orgId}/set-active:
 *   post:
 *     summary: Establecer organización activa (alias de /switch)
 *     description: Establece la organización como activa para el usuario. Este endpoint es un alias de /switch para compatibilidad.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la organización a activar
 *     responses:
 *       200:
 *         description: Organización activada exitosamente
 */
router.post("/:orgId/set-active", organizationController.setActiveOrganization);

/**
 * @swagger
 * /organizations/{id}:
 *   get:
 *     summary: Obtener detalles de una organización
 *     tags: [Organizations]
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
 *         description: Detalles de la organización
 */
router.get("/:id", organizationController.getById);

/**
 * @swagger
 * /organizations/{id}/members:
 *   get:
 *     summary: Obtener miembros de una organización
 *     tags: [Organizations]
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
 *         description: Lista de miembros
 */
router.get("/:id/members", organizationController.getMembers);

/**
 * @swagger
 * /organizations/{id}/members:
 *   post:
 *     summary: Agregar miembro a la organización (solo admin)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *     responses:
 *       201:
 *         description: Miembro agregado exitosamente
 */
router.post("/:id/members", requireOrgAdmin, organizationController.addMember);

/**
 * @swagger
 * /organizations/{id}/members/{memberId}:
 *   delete:
 *     summary: Remover miembro de la organización (solo admin)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro removido exitosamente
 */
router.delete(
  "/:id/members/:memberId",
  requireOrgAdmin,
  organizationController.removeMember
);

/**
 * @swagger
 * /organizations/{id}/members/{memberId}/role:
 *   patch:
 *     summary: Actualizar rol de miembro (solo admin)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 */
router.patch(
  "/:id/members/:memberId/role",
  requireOrgAdmin,
  organizationController.updateMemberRole
);

export default router;
