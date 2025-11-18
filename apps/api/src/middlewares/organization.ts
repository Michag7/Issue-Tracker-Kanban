import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { AppError } from "./errorHandler";
import prisma from "../db/prisma";
import { OrgRole } from "@prisma/client";

/**
 * Middleware para verificar que el usuario tiene una organización activa
 */
export const requireActiveOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const currentOrgId = req.user?.currentOrgId;

    if (!userId) {
      throw new AppError("No autenticado", 401);
    }

    if (!currentOrgId) {
      throw new AppError(
        "No hay organización activa. Por favor selecciona una organización.",
        400
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar que el usuario es miembro de una organización específica
 * Se usa cuando el orgId viene en los parámetros de ruta
 */
export const requireOrgMembership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId || req.params.id;

    if (!userId) {
      throw new AppError("No autenticado", 401);
    }

    if (!orgId) {
      throw new AppError("ID de organización requerido", 400);
    }

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError("No tienes acceso a esta organización", 403);
    }

    // Adjuntar el rol al request para uso posterior
    req.orgRole = membership.role;
    req.orgId = orgId;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar que el usuario es miembro de la organización actual
 * Se usa cuando se confía en currentOrgId del usuario
 */
export const requireCurrentOrgMembership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const orgId = req.user?.currentOrgId;

    if (!userId) {
      throw new AppError("No autenticado", 401);
    }

    if (!orgId) {
      throw new AppError("No hay organización activa", 400);
    }

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError("No tienes acceso a esta organización", 403);
    }

    req.orgRole = membership.role;
    req.orgId = orgId;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar que el usuario tiene permisos de admin en la organización
 * Debe usarse después de requireOrgMembership
 */
export const requireOrgAdminRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.orgRole) {
      throw new AppError("No se pudo verificar el rol de organización", 500);
    }

    if (req.orgRole !== OrgRole.ADMIN) {
      throw new AppError(
        "Se requieren permisos de administrador para esta acción",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Extender el tipo AuthRequest para incluir orgRole y orgId
declare module "./auth" {
  interface AuthRequest {
    orgRole?: OrgRole;
    orgId?: string;
  }
}
