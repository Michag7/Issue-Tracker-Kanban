import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";
import { AppError } from "../middlewares/errorHandler";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);

    // Establecer refresh token en cookie httpOnly
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    // Devolver solo access token y user
    res.status(201).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400));
    } else {
      next(error);
    }
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);

    // Establecer refresh token en cookie httpOnly
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    // Devolver solo access token y user
    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 401));
    } else {
      next(error);
    }
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token no proporcionado", 401);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 401));
    } else {
      next(error);
    }
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    // Limpiar cookie
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 500));
    } else {
      next(error);
    }
  }
};
