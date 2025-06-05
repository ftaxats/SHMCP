import { z } from "zod";

export const configSchema = z.object({
  apiKey: z.string().optional().describe("SalesHandy API key for authentication"),
  baseUrl: z.string().default("https://api.saleshandy.com/api/v1").describe("Base URL for SalesHandy API")
});

export type Config = z.infer<typeof configSchema>; 