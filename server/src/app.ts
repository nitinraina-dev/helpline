import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import Routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorMiddlware.js";

const app = express();

if (process.env.NODE_ENV !== "test") {
  app.use(pinoHttp());
}

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use(
  "/api/public",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many requests" },
  })
);

app.get("/", (_, res) => {
  res.json({ success: true, message: "Helpdesk API Running" });
});

Routes(app);

app.use(notFound);
app.use(errorHandler);

export default app;
