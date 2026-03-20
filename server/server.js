import express from "express";
import cors from "cors";
import config from "./config/index.js";
import { connectMongo, initSupabase } from "./config/db.js";
import { requestLogger, notFoundHandler, errorHandler } from "./middleware/index.js";
import { healthCheck } from "./controllers/agentController.js";

// Routes
import meetingsRouter from "./routes/meetings.js";
import approvalsRouter from "./routes/approvals.js";
import integrationsRouter from "./routes/integrations.js";
import agentRouter from "./routes/agent.js";

const app = express();

// ─── Middleware ───
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);

// ─── Routes ───
app.get("/health", healthCheck);
app.use("/api/meetings", meetingsRouter);
app.use("/api/dashboard/meetings", (req, _res, next) => { req.url = "/dashboard" + req.url; next(); }, meetingsRouter);
app.use("/api/dashboard/overview", (req, _res, next) => { req.url = "/overview"; next(); }, meetingsRouter);
app.use("/api/approvals", approvalsRouter);
app.use("/api/integrations", integrationsRouter);
app.use("/api", agentRouter);

// ─── Error Handling ───
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ───
const start = async () => {
  await connectMongo();
  await initSupabase();
  app.listen(config.port, () => console.log(`🚀 Gateway on http://localhost:${config.port}`));
};

start();

export default app;
