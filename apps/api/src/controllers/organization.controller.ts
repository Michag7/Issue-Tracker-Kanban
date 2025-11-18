import { Request, Response } from "express";
import organizationService from "../services/organization.service";
import { CreateOrganizationDto } from "@issue-tracker/types";
import { OrgRole } from "@prisma/client";

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const data: CreateOrganizationDto = req.body;
    const organization = await organizationService.createOrganization(
      userId,
      data
    );

    res.status(201).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al crear la organización";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getMyOrganizations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const organizations = await organizationService.getUserOrganizations(
      userId
    );

    res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al obtener organizaciones";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const organization = await organizationService.getOrganizationById(
      orgId,
      userId
    );

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Organización no encontrada";
    res.status(404).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const members = await organizationService.getOrganizationMembers(
      orgId,
      userId
    );

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al obtener miembros";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.id;
    const { email, role } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const membership = await organizationService.addMember(
      orgId,
      userId,
      email,
      role || OrgRole.MEMBER
    );

    res.status(201).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al agregar miembro";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.id;
    const memberIdToRemove = req.params.memberId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const result = await organizationService.removeMember(
      orgId,
      userId,
      memberIdToRemove
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al remover miembro";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.id;
    const memberIdToUpdate = req.params.memberId;
    const { role } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    if (!role || !Object.values(OrgRole).includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Rol inválido",
      });
    }

    const updated = await organizationService.updateMemberRole(
      orgId,
      userId,
      memberIdToUpdate,
      role
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al actualizar rol";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const switchOrganization = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { orgId } = req.body;

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

    const user = await organizationService.switchOrganization(userId, orgId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al cambiar de organización";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * Establece una organización como activa para el usuario actual.
 * Este endpoint es un alias de switchOrganization pero acepta orgId por parámetro de ruta.
 * También retorna la lista de issues de la organización para conveniencia del frontend.
 */
export const setActiveOrganization = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId;

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

    const user = await organizationService.switchOrganization(userId, orgId);

    res.json({
      success: true,
      data: user,
      message: "Organización activada exitosamente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al activar organización";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};
