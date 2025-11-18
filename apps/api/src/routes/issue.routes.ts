import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { requireCurrentOrgMembership } from "../middlewares/organization";
import {
  getIssues,
  getIssueById,
  createIssue,
  createIssueForOrganization,
  getIssueByIdForOrganization,
  updateIssueForOrganization,
  deleteIssueForOrganization,
  getIssueHistoryForOrganization,
  updateIssue,
  deleteIssue,
  getIssueHistory,
} from "../controllers/issue.controller";
import { getIssuesByOrganization } from "../controllers/issue-by-org.controller";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentsForOrganization,
  createCommentForOrganization,
  updateCommentForOrganization,
  deleteCommentForOrganization,
} from "../controllers/comment.controller";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas específicas para organizaciones (usan orgId de params, NO currentOrgId)
router.get("/organization/:orgId", getIssuesByOrganization);
router.post("/organization/:orgId", createIssueForOrganization);
router.get("/organization/:orgId/:issueId", getIssueByIdForOrganization);
router.put("/organization/:orgId/:issueId", updateIssueForOrganization);
router.delete("/organization/:orgId/:issueId", deleteIssueForOrganization);
router.get(
  "/organization/:orgId/:issueId/history",
  getIssueHistoryForOrganization
);
router.get(
  "/organization/:orgId/:issueId/comments",
  getCommentsForOrganization
);
router.post(
  "/organization/:orgId/:issueId/comments",
  createCommentForOrganization
);
router.put(
  "/organization/:orgId/comments/:commentId",
  updateCommentForOrganization
);
router.delete(
  "/organization/:orgId/comments/:commentId",
  deleteCommentForOrganization
);

// El resto de rutas requieren membresía en la org actual
router.use(requireCurrentOrgMembership);

/**
 * @swagger
 * /issues:
 *   get:
 *     summary: Get all issues
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of issues
 */
router.get("/", getIssues);

/**
 * @swagger
 * /issues/{id}:
 *   get:
 *     summary: Get issue by ID
 *     tags: [Issues]
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
 *         description: Issue details
 *       404:
 *         description: Issue not found
 */
router.get("/:id", getIssueById);

/**
 * @swagger
 * /issues:
 *   post:
 *     summary: Create a new issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Issue created
 */
router.post("/", createIssue);

/**
 * @swagger
 * /issues/{id}:
 *   put:
 *     summary: Update an issue
 *     tags: [Issues]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue updated
 */
router.put("/:id", updateIssue);

/**
 * @swagger
 * /issues/{id}:
 *   delete:
 *     summary: Delete an issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Issue deleted
 */
router.delete("/:id", deleteIssue);

/**
 * @swagger
 * /issues/{id}/history:
 *   get:
 *     summary: Get issue history
 *     tags: [Issues]
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
 *         description: Issue history
 */
router.get("/:id/history", getIssueHistory);

/**
 * @swagger
 * /issues/{issueId}/comments:
 *   get:
 *     summary: Get all comments for an issue
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:issueId/comments", getComments);

/**
 * @swagger
 * /issues/{issueId}/comments:
 *   post:
 *     summary: Create a new comment on an issue
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post("/:issueId/comments", createComment);

/**
 * @swagger
 * /issues/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.put("/comments/:commentId", updateComment);

/**
 * @swagger
 * /issues/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete("/comments/:commentId", deleteComment);

export default router;
