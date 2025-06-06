import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { configSchema, Config } from "./config/schema";
import { createClient, validateApiKey } from "./client";
import { createTools } from "./tools";

export const config = configSchema;

export default async function createServer(config: Config) {
  const server = new McpServer({
    name: "SalesHandy MCP",
    version: "1.0.0",
    config: {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey
    }
  });

  // Initialize tools when API key is provided
  if (config.apiKey) {
    const client = createClient(config);
    try {
      await validateApiKey(client);
      const tools = createTools(client);
      tools.forEach(tool => {
        server.tool(
          tool.name,
          tool.description,
          tool.parameters.shape,
          tool.handler
        );
      });
      console.log("Successfully initialized SalesHandy MCP server");
    } catch (error) {
      console.error("Failed to initialize SalesHandy MCP server:", error);
      throw error;
    }
  }

  return server;
} 