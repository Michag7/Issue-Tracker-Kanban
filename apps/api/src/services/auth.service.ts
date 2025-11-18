import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { API_CONFIG } from "@issue-tracker/config";
import prisma from "../db/prisma";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";
import refreshTokenService from "./refreshToken.service";
import { OrgRole } from "@prisma/client";

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const generateAccessToken = (
  userId: string,
  email: string,
  currentOrgId?: string | null
) => {
  return jwt.sign(
    { id: userId, email, currentOrgId },
    API_CONFIG.JWT_SECRET,
    { expiresIn: "15m" } // Access token expira en 15 minutos
  );
};

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("El email ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Crear la organización
  const orgName = data.organizationName || `${data.name}'s Organization`;
  const slug = generateSlug(`${orgName}-${Date.now()}`);

  // Crear usuario y organización en una transacción
  const result = await prisma.$transaction(async (tx) => {
    // Crear usuario
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    // Crear organización con el usuario como owner
    const organization = await tx.organization.create({
      data: {
        name: orgName,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: OrgRole.ADMIN,
          },
        },
      },
    });

    // Actualizar currentOrgId del usuario
    await tx.user.update({
      where: { id: user.id },
      data: { currentOrgId: organization.id },
    });

    return { user, organization };
  });

  const { user, organization } = result;

  // Generar tokens
  const accessToken = generateAccessToken(user.id, user.email, organization.id);
  const refreshToken = await refreshTokenService.createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      currentOrgId: organization.id,
    },
  };
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      organizations: {
        take: 1,
        orderBy: {
          joinedAt: "asc",
        },
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    throw new Error("Credenciales inválidas");
  }

  // Si el usuario no tiene currentOrgId, usar la primera organización
  let currentOrgId = user.currentOrgId;
  if (!currentOrgId && user.organizations.length > 0) {
    currentOrgId = user.organizations[0].organization.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { currentOrgId },
    });
  }

  // Generar tokens
  const accessToken = generateAccessToken(user.id, user.email, currentOrgId);
  const refreshToken = await refreshTokenService.createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      currentOrgId,
    },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  // Validar refresh token
  const user = await refreshTokenService.validateRefreshToken(refreshToken);

  // Generar nuevo access token
  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.currentOrgId
  );

  return { accessToken };
};

export const logoutUser = async (refreshToken: string) => {
  await refreshTokenService.revokeRefreshToken(refreshToken);
};
