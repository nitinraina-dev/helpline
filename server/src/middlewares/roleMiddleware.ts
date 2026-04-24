import type{ Response, NextFunction } from "express";
import type{ AuthRequest } from "./authMiddleware.js";

export const allowRoles =
  (...roles: Array<"agent" | "admin">) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };