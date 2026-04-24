import { Router } from "express";
import {
 createTicket,
  checkTicketStatus,
  getDashboardTickets,
  getTicketDetail,
  replyTicket,
  updateTicketStatus,
  reassignTicket
} from "../controllers/ticketController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createTicketSchema } from "../validators/ticketValidator.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
const router = Router();
router.post(
  "/submit",
  validate(createTicketSchema),
  createTicket
);
router.post("/status", checkTicketStatus);

router.get("/dashboard", protect, getDashboardTickets);
router.get("/:id", protect, getTicketDetail);

router.post("/:id/reply", protect, replyTicket);

router.patch("/:id/status", protect, updateTicketStatus);

router.patch(
  "/:id/reassign",
  protect,
  allowRoles("admin"),
  reassignTicket
);

export default router;