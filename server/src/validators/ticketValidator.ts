import { z } from "zod";

export const createTicketSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  body: z.string().min(5),
  priority: z.enum(["low", "medium", "high"])
});