import { Router } from "express";
import { createMeeting, getDashboardMeetings, getDashboardOverview, getMeetingSnapshot } from "../controllers/meetingsController.js";

const router = Router();

router.post("/", createMeeting);
router.get("/dashboard", getDashboardMeetings);
router.get("/overview", getDashboardOverview);
router.get("/:meetingId/snapshot", getMeetingSnapshot);

export default router;
