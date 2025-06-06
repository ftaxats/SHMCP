import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { configSchema, Config } from "./config/schema";
import { createClient, validateApiKey } from "./client";
import { createTools } from "./tools";
import { z } from "zod";

export const config = configSchema;

export default async function createServer(config: Config) {
  try {
    // Validate config
    if (!config.apiKey) {
      throw new Error("API key is required for SalesHandy API operations");
    }

    // Initialize server with basic configuration
    const server = new McpServer({
      name: "SalesHandy MCP",
      version: "1.0.0",
      config: {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey
      }
    });

    // Register tools with lazy initialization
    const tools = [
      "getUserProfile",
      "listCampaigns",
      "createCampaign",
      "updateCampaignStatus",
      "listTemplates",
      "createTemplate",
      "listContacts",
      "createContact",
      "updateContact"
    ];

    // Register each tool
    for (const toolName of tools) {
      server.tool(
        toolName,
        `SalesHandy ${toolName} tool`,
        {
          title: `SalesHandy ${toolName}`,
          readOnlyHint: toolName.startsWith("list") || toolName === "getUserProfile"
        },
        async (args: any, extra) => {
          const client = createClient(config);
          try {
            await validateApiKey(client);
            const allTools = createTools(client);
            const tool = allTools.find(t => t.name === toolName);
            if (!tool) {
              throw new Error(`Tool ${toolName} not found`);
            }
            const result = await tool.handler(args);
            return {
              content: [{
                type: "text" as const,
                text: typeof result === 'string' ? result : JSON.stringify(result)
              }]
            };
          } catch (error) {
            console.error(`Failed to execute tool ${toolName}:`, error);
            throw error;
          }
        }
      );
    }

    return server;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    throw error;
  }
} 