import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { createAgent, getAgents } from "../controllers/userController.js";

const router = Router();

router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route working",
  });
});
router.get(
  "/agents",
  protect,
  allowRoles("admin"),
  getAgents
);

router.get(
  "/admin-only",
  protect,
  allowRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome admin",
    });
  }
);
router.post(
  "/agents",
  protect,
  allowRoles("admin"),
  createAgent
);

export default router;