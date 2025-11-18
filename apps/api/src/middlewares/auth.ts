import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { API_CONFIG } from "@issue-tracker/config";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    currentOrgId?: string | null;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, API_CONFIG.JWT_SECRET) as {
      id: string;
      email: string;
      currentOrgId?: string | null;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid token", 401));
    } else {
      next(error);
    }
  }
};
