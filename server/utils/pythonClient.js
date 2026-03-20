import axios from "axios";
import config from "../config/index.js";

export const pythonClient = axios.create({
  baseURL: config.pythonApiUrl,
  timeout: 30000,
});

export async function callPython(req, method, path, options = {}) {
  const response = await pythonClient.request({
    method,
    url: path,
    data: options.data,
    params: options.params,
    headers: {
      "X-Request-ID": req.requestId,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return response.data;
}
