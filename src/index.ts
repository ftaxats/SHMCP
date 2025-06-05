import { McpServer } from "@modelcontextprotocol/sdk";
import { configSchema, Config } from "./config/schema";
import { createClient, validateApiKey } from "./client";
import { createTools } from "./tools";

export const config = configSchema;

export default async function createServer(config: Config) {
  const server = new McpServer({
    config: {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey
    },
    tools: []
  });

  // Initialize tools when API key is provided
  if (config.apiKey) {
    const client = createClient(config);
    try {
      await validateApiKey(client);
      server.tools = createTools(client);
      console.log("Successfully initialized SalesHandy MCP server");
    } catch (error) {
      console.error("Failed to initialize SalesHandy MCP server:", error);
      throw error;
    }
  }

  return server;
} 