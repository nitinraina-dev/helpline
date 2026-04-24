import type { Express } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import ticketRoutes from "./ticketRoutes.js";

const Routes = (app: Express) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  // public routes
  app.use("/api/public/tickets", ticketRoutes);

  // internal routes
  app.use("/api/tickets", ticketRoutes);
};

export default Routes;