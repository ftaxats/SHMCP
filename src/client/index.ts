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
    }
  });
}

export async function validateApiKey(client: AxiosInstance): Promise<boolean> {
  try {
    await client.get("/user/profile");
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Invalid SalesHandy API key");
    }
    throw new Error("Failed to validate API key");
  }
} 