import type{ Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JwtUser = {
  id: string;
  email: string;
  role: "agent" | "admin";
};

export interface AuthRequest extends Request {
  user?: JwtUser;
}


export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as JwtUser;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};