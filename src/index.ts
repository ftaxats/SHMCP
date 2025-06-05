import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import axios from 'axios';

// Configuration schema
const configSchema = z.object({
  apiKey: z.string().optional().describe("SalesHandy API key for authentication"),
  baseUrl: z.string().default("https://api.saleshandy.com/api/v1").describe("Base URL for SalesHandy API")
});

// Export the schema for MCP
export { configSchema };

// Helper function to create axios client
function createClient(config: z.infer<typeof configSchema>) {
  if (!config.apiKey) {
    throw new Error('API key is required for this operation');
  }
  return axios.create({
    baseURL: config.baseUrl,
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

// Helper function to format response
function formatResponse(data: any) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }]
  };
}

// Common schemas
const paginationSchema = z.object({
  page: z.number().optional().describe("Page number"),
  limit: z.number().optional().describe("Number of items per page")
});

const dateRangeSchema = z.object({
  startDate: z.string().describe("Start date (YYYY-MM-DD)"),
  endDate: z.string().describe("End date (YYYY-MM-DD)")
});

export default function ({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: 'SalesHandy MCP',
    version: '1.0.0',
    description: 'MCP server for SalesHandy API integration'
  });

  // Add a tool to get user profile
  server.tool(
    'getUserProfile',
    'Get current user profile information',
    {},
    async () => {
      const client = createClient(config);
      const response = await client.get('/user/profile');
      return formatResponse(response.data);
    }
  );

  // Add a tool to list campaigns
  server.tool(
    'listCampaigns',
    'List all campaigns with optional filtering',
    {
      status: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed']).optional().describe("Filter by campaign status"),
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Number of items per page"),
      search: z.string().optional().describe("Search term")
    },
    async (args) => {
      const client = createClient(config);
      const response = await client.get('/campaigns', { params: args });
      return formatResponse(response.data);
    }
  );

  // Add a tool to create campaign
  server.tool(
    'createCampaign',
    'Create a new campaign',
    {
      name: z.string().describe("Campaign name"),
      subject: z.string().describe("Email subject"),
      templateId: z.string().describe("Template ID to use"),
      scheduleTime: z.string().optional().describe("Schedule time in ISO format"),
      contacts: z.array(z.string()).describe("List of contact IDs")
    },
    async (args) => {
      const client = createClient(config);
      const response = await client.post('/campaigns', args);
      return formatResponse(response.data);
    }
  );

  // Add a tool to update campaign status
  server.tool(
    'updateCampaignStatus',
    'Update campaign status',
    {
      campaignId: z.string().describe("Campaign ID"),
      status: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed']).describe("New status")
    },
    async (args) => {
      const client = createClient(config);
      const response = await client.put(`/campaigns/${args.campaignId}/status`, { status: args.status });
      return formatResponse(response.data);
    }
  );

  // Add a tool to list templates
  server.tool(
    'listTemplates',
    'List all email templates',
    {
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Number of items per page")
    },
    async (args) => {
      const client = createClient(config);
      const response = await client.get('/templates', { params: args });
      return formatResponse(response.data);
    }
  );

  // Add a tool to create template
  server.tool(
    'createTemplate',
    'Create a new email template',
    {
      name: z.string().describe("Template name"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body in HTML format")
    },
    async (args) => {
      const client = createClient(config);
      const response = await client.post('/templates', args);
      return formatResponse(response.data);
    }
  );

  // Add a tool to list contacts
  server.tool(
    'listContacts',
    'List all contacts',
    {
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Number of items per page"),
      search: z.string().optional().describe("Search term")
    },
    async (args) => {
      const client = createClient(config);
      const response = await client.get('/contacts', { params: args });
      return formatResponse(response.data);
    }
  );

  // Add a tool to create contact
  server.tool(
    'createContact',
    'Create a new contact',
    {
      email: z.string().email().describe("Contact email"),
      firstName: z.string().optional().describe("First name"),
      lastName: z.string().optional().describe("Last name"),
      company: z.string().optional().describe("Company name"),
      tags: z.array(z.string()).optional().describe("Contact tags")
    },
    async (args) => {
      const client = createClient(config);
      const response = await client.post('/contacts', args);
      return formatResponse(response.data);
    }
  );

  // Add a tool to update contact
  server.tool(
    'updateContact',
    'Update an existing contact',
    {
      contactId: z.string().describe("Contact ID"),
      email: z.string().email().optional().describe("Contact email"),
      firstName: z.string().optional().describe("First name"),
      lastName: z.string().optional().describe("Last name"),
      company: z.string().optional().describe("Company name"),
      tags: z.array(z.string()).optional().describe("Contact tags")
    },
    async (args) => {
      const client = createClient(config);
      const { contactId, ...updateData } = args;
      const response = await client.put(`/contacts/${contactId}`, updateData);
      return formatResponse(response.data);
    }
  );

  return server.server;
} 