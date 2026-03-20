import dotenv from "dotenv";
dotenv.config();

export default {
  port: Number(process.env.PORT || 3001),
  pythonApiUrl: process.env.PYTHON_API_URL || "http://localhost:8000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  supabase: {
    url: process.env.PROJECT_URL,
    key: process.env.SUPABASE_KEY,
  },

  mongo: {
    uri: process.env.MONGO_URI,
  },

  jira: {
    clientId: process.env.JIRA_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.JIRA_OAUTH_CLIENT_SECRET || "",
    callbackUrl: process.env.JIRA_OAUTH_CALLBACK_URL || "",
    projectKey: process.env.JIRA_PROJECT_KEY || "AE",
  },
};
