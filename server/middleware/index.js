import { v4 as uuidv4 } from "uuid";

export function requestLogger(req, _res, next) {
  req.requestId = uuidv4();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${req.requestId}`);
  next();
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found", path: req.path, request_id: req.requestId });
}

export function errorHandler(err, req, res, _next) {
  console.error(`[${req.requestId}]`, err);
  res.status(500).json({ error: "Internal server error", detail: err.message });
}
