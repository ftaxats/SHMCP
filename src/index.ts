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
      {
        name: "getUserProfile",
        description: "Get current user profile information",
        parameters: {},
        annotations: {
          title: "Get User Profile",
          readOnlyHint: true
        }
      },
      {
        name: "listCampaigns",
        description: "List all campaigns with optional filtering",
        parameters: {
          status: { type: "string", enum: ["draft", "scheduled", "running", "paused", "completed"], optional: true },
          page: { type: "number", optional: true },
          limit: { type: "number", optional: true },
          search: { type: "string", optional: true }
        },
        annotations: {
          title: "List Campaigns",
          readOnlyHint: true
        }
      },
      {
        name: "createCampaign",
        description: "Create a new campaign",
        parameters: {
          name: { type: "string" },
          subject: { type: "string" },
          templateId: { type: "string" },
          scheduleTime: { type: "string" },
          contacts: { type: "array", items: { type: "string" } }
        },
        annotations: {
          title: "Create Campaign"
        }
      },
      {
        name: "updateCampaignStatus",
        description: "Update campaign status",
        parameters: {
          campaignId: { type: "string" },
          status: { type: "string", enum: ["draft", "scheduled", "running", "paused", "completed"] }
        },
        annotations: {
          title: "Update Campaign Status"
        }
      },
      {
        name: "listTemplates",
        description: "List all email templates",
        parameters: {
          page: { type: "number", optional: true },
          limit: { type: "number", optional: true }
        },
        annotations: {
          title: "List Templates",
          readOnlyHint: true
        }
      },
      {
        name: "createTemplate",
        description: "Create a new email template",
        parameters: {
          name: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" }
        },
        annotations: {
          title: "Create Template"
        }
      },
      {
        name: "listContacts",
        description: "List all contacts",
        parameters: {
          page: { type: "number", optional: true },
          limit: { type: "number", optional: true },
          search: { type: "string", optional: true }
        },
        annotations: {
          title: "List Contacts",
          readOnlyHint: true
        }
      },
      {
        name: "createContact",
        description: "Create a new contact",
        parameters: {
          email: { type: "string", format: "email" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          company: { type: "string", optional: true },
          tags: { type: "array", items: { type: "string" }, optional: true }
        },
        annotations: {
          title: "Create Contact"
        }
      },
      {
        name: "updateContact",
        description: "Update an existing contact",
        parameters: {
          contactId: { type: "string" },
          email: { type: "string", format: "email" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          company: { type: "string", optional: true },
          tags: { type: "array", items: { type: "string" }, optional: true }
        },
        annotations: {
          title: "Update Contact"
        }
      }
    ];

    // Register each tool
    for (const tool of tools) {
      server.tool(
        tool.name,
        tool.description,
        tool.annotations,
        async (args: any, extra) => {
          const client = createClient(config);
          try {
            await validateApiKey(client);
            const allTools = createTools(client);
            const toolImpl = allTools.find(t => t.name === tool.name);
            if (!toolImpl) {
              throw new Error(`Tool ${tool.name} not found`);
            }
            const result = await toolImpl.handler(args);
            return {
              content: [{
                type: "text" as const,
                text: typeof result === 'string' ? result : JSON.stringify(result)
              }]
            };
          } catch (error) {
            console.error(`Failed to execute tool ${tool.name}:`, error);
            throw error;
          }
        }
      );
    }

    // Log server initialization
    console.log("Server initialized successfully");
    console.log("Registered tools:", tools.map(t => t.name));

    return server;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    throw error;
  }
} 