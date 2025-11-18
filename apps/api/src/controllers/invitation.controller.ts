import { Request, Response } from "express";
import invitationService from "../services/invitation.service";
import { CreateInvitationDto } from "@issue-tracker/types";

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId;
    const data: CreateInvitationDto = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const invitation = await invitationService.createInvitation(
      orgId,
      userId,
      data
    );

    res.status(201).json({
      success: true,
      data: invitation,
      message: "Invitación enviada exitosamente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al crear la invitación";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const invitation = await invitationService.getInvitationByToken(token);

    res.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Invitación no encontrada";
    res.status(404).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const accept = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token requerido",
      });
    }

    const membership = await invitationService.acceptInvitation(token, userId);

    res.json({
      success: true,
      data: membership,
      message: "Te has unido a la organización exitosamente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al aceptar la invitación";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const reject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token requerido",
      });
    }

    const result = await invitationService.rejectInvitation(token, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al rechazar la invitación";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const acceptById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const invitationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const membership = await invitationService.acceptInvitationById(
      invitationId,
      userId
    );

    res.json({
      success: true,
      data: membership,
      message: "Te has unido a la organización exitosamente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al aceptar la invitación";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const rejectById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const invitationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const result = await invitationService.rejectInvitationById(
      invitationId,
      userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al rechazar la invitación";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getOrganizationInvitations = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const orgId = req.params.orgId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const invitations = await invitationService.getOrganizationInvitations(
      orgId,
      userId
    );

    res.json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al obtener invitaciones";
    res.status(403).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getMyPendingInvitations = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const invitations = await invitationService.getUserPendingInvitations(
      userEmail
    );

    res.json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al obtener invitaciones pendientes";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const cancel = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const invitationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const result = await invitationService.cancelInvitation(
      invitationId,
      userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al cancelar la invitación";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};
