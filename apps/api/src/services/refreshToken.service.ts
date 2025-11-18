import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export class RefreshTokenService {
  private generateToken(): string {
    return randomBytes(64).toString("hex");
  }

  async createRefreshToken(userId: string): Promise<string> {
    // Generar token que expira en 7 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const token = this.generateToken();

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            currentOrgId: true,
          },
        },
      },
    });

    if (!refreshToken) {
      throw new Error("Token de refresco inválido");
    }

    if (refreshToken.expiresAt < new Date()) {
      // Token expirado, eliminarlo
      await this.revokeRefreshToken(token);
      throw new Error("Token de refresco expirado");
    }

    return refreshToken.user;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async cleanExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  async rotateRefreshToken(oldToken: string): Promise<string> {
    // Validar el token anterior
    const user = await this.validateRefreshToken(oldToken);

    // Revocar el token anterior
    await this.revokeRefreshToken(oldToken);

    // Crear un nuevo token
    const newToken = await this.createRefreshToken(user.id);

    return newToken;
  }
}

export default new RefreshTokenService();
