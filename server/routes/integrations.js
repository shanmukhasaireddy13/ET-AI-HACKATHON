import { Router } from "express";
import { listIntegrations, initiateJiraOAuth, jiraOAuthCallback, disconnectJira } from "../controllers/integrationsController.js";

const router = Router();

router.get("/", listIntegrations);
router.get("/jira/initiate", initiateJiraOAuth);
router.get("/jira/callback", jiraOAuthCallback);
router.delete("/jira", disconnectJira);

export default router;
