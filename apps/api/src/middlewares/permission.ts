import { Request, Response, NextFunction } from "express";
import { OrgRole } from "@prisma/client";
import organizationService from "../services/organization.service";

// Extender el tipo Request para incluir user y orgId
declare module "express" {
  interface Request {
    user?: {
      id: string;
      email: string;
      currentOrgId?: string | null;
    };
    orgId?: string;
  }
}

export const requireOrgMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId || req.body.orgId || req.user?.currentOrgId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "ID de organización requerido",
      });
    }

    // Verificar membresía
    await organizationService.verifyMembership(userId, orgId);

    // Guardar orgId en el request para usarlo en controladores
    req.orgId = orgId;

    next();
  } catch (error: any) {
    res.status(403).json({
      success: false,
      error: error.message || "No tienes acceso a esta organización",
    });
  }
};

export const requireOrgAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId || req.body.orgId || req.user?.currentOrgId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: "ID de organización requerido",
      });
    }

    // Verificar que sea admin
    await organizationService.verifyAdmin(userId, orgId);

    // Guardar orgId en el request
    req.orgId = orgId;

    next();
  } catch (error: any) {
    res.status(403).json({
      success: false,
      error: error.message || "Se requieren permisos de administrador",
    });
  }
};

export const checkOrgRole = (requiredRole: OrgRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const orgId =
        req.params.orgId || req.body.orgId || req.user?.currentOrgId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "No autenticado",
        });
      }

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: "ID de organización requerido",
        });
      }

      const userRole = await organizationService.getUserRole(userId, orgId);

      if (!userRole) {
        return res.status(403).json({
          success: false,
          error: "No eres miembro de esta organización",
        });
      }

      // Verificar el rol requerido
      if (requiredRole === OrgRole.ADMIN && userRole !== OrgRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: "Se requieren permisos de administrador",
        });
      }

      // Guardar orgId en el request
      req.orgId = orgId;

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al verificar permisos",
      });
    }
  };
};
