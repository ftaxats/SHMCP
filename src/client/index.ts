import axios, { AxiosInstance } from "axios";
import { Config } from "../config/schema";

export function createClient(config: Config): AxiosInstance {
  if (!config.apiKey) {
    throw new Error("API key is required for SalesHandy API operations");
  }

  return axios.create({
    baseURL: config.baseUrl,
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    timeout: 10000,
    validateStatus: (status) => status >= 200 && status < 500
  });
}

export async function validateApiKey(client: AxiosInstance): Promise<boolean> {
  try {
    const response = await client.get("/user/profile");
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Invalid SalesHandy API key");
      }
      if (error.code === "ECONNREFUSED") {
        throw new Error("Failed to connect to SalesHandy API");
      }
      if (error.code === "ETIMEDOUT") {
        throw new Error("Connection to SalesHandy API timed out");
      }
    }
    throw new Error("Failed to validate API key");
  }
} 