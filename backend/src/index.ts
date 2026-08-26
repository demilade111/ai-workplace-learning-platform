import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import "dotenv/config";
import { prisma } from "./db/prisma.js";
import { logger } from "./lib/logger.js";
import { authRouter } from "./modules/auth/routes/auth.routes.js";
import { invitationRouter } from "./modules/invitation/routes/invitation.routes.js";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/auth", authRouter);
app.use("/invitations", invitationRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    req.log.error({ err }, "readiness_check_failed");
    res.status(503).json({ status: "unavailable" });
  }
});

app.listen(port, () => {
  logger.info({ port }, "backend_started");
});
