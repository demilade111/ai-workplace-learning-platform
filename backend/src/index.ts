import express from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./db/prisma.js";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
