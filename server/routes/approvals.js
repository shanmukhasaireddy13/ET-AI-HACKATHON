import { Router } from "express";
import { getApprovals, processDecision } from "../controllers/approvalsController.js";

const router = Router();

router.get("/", getApprovals);
router.post("/:taskId/decision", processDecision);

export default router;
