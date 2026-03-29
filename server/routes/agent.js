import { Router } from "express";
import { getAuditLogs, getTasks, getWorkflows, getReasoning, getRunSnapshot, chat, pushTask } from "../controllers/agentController.js";

const router = Router();

router.get("/audit-logs/:meetingId", getAuditLogs);
router.get("/tasks/:meetingId", getTasks);
router.get("/workflows/:meetingId", getWorkflows);
router.get("/reasoning/:meetingId", getReasoning);
router.get("/runs/:runId/snapshot", getRunSnapshot);
router.post("/chat", chat);
router.post("/tasks/:taskId/push", pushTask);

export default router;
