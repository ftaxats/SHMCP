import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import axios from 'axios';

// Configuration schema for API key with validation
export const configSchema = z.object({
  apiKey: z.string()
    .min(1, "API key is required")
    .describe("Your SalesHandy API Key - Get it from https://open-api.saleshandy.com/api-doc/"),
  baseUrl: z.string()
    .default("https://open-api.saleshandy.com/api/v1")
    .describe("SalesHandy API Base URL")
});

// Helper function to create axios instance with auth
const createClient = (config: z.infer<typeof configSchema>) => {
  return axios.create({
    baseURL: config.baseUrl,
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
};

// Helper function to validate API key
const validateApiKey = async (client: ReturnType<typeof createClient>) => {
  try {
    await client.get('/user/profile');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid SalesHandy API key. Please check your API key and try again.');
      }
    }
    throw new Error('Failed to validate SalesHandy API key. Please try again later.');
  }
};

export default function ({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: 'SalesHandy MCP',
    version: '1.0.0'
  });

  const client = createClient(config);

  // Validate API key before adding tools
  server.onInit(async () => {
    await validateApiKey(client);
    console.log('SalesHandy API key validated successfully');
  });

  // User Module
  server.tool(
    'getUserProfile',
    'Get the authenticated user profile',
    {},
    async () => {
      const response = await client.get('/user/profile');
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Campaigns Module
  server.tool(
    'listCampaigns',
    'List all campaigns',
    {
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Number of items per page")
    },
    async ({ page, limit }) => {
      const response = await client.get('/campaigns', {
        params: { page, limit }
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'createCampaign',
    'Create a new campaign',
    {
      name: z.string().describe("Campaign name"),
      description: z.string().optional().describe("Campaign description"),
      settings: z.object({
        // Add campaign settings schema here
      }).optional()
    },
    async ({ name, description, settings }) => {
      const response = await client.post('/campaigns', {
        name,
        description,
        settings
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Templates Module
  server.tool(
    'listTemplates',
    'List all email templates',
    {
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Number of items per page")
    },
    async ({ page, limit }) => {
      const response = await client.get('/templates', {
        params: { page, limit }
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'createTemplate',
    'Create a new email template',
    {
      name: z.string().describe("Template name"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body"),
      type: z.enum(['html', 'text']).describe("Template type")
    },
    async ({ name, subject, body, type }) => {
      const response = await client.post('/templates', {
        name,
        subject,
        body,
        type
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Contacts Module
  server.tool(
    'listContacts',
    'List all contacts',
    {
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Number of items per page")
    },
    async ({ page, limit }) => {
      const response = await client.get('/contacts', {
        params: { page, limit }
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'createContact',
    'Create a new contact',
    {
      email: z.string().email().describe("Contact email"),
      firstName: z.string().optional().describe("First name"),
      lastName: z.string().optional().describe("Last name"),
      customFields: z.record(z.string()).optional().describe("Custom fields")
    },
    async ({ email, firstName, lastName, customFields }) => {
      const response = await client.post('/contacts', {
        email,
        firstName,
        lastName,
        customFields
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Analytics Module
  server.tool(
    'getCampaignAnalytics',
    'Get analytics for a specific campaign',
    {
      campaignId: z.string().describe("Campaign ID"),
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("End date (YYYY-MM-DD)")
    },
    async ({ campaignId, startDate, endDate }) => {
      const response = await client.get(`/analytics/campaigns/${campaignId}`, {
        params: { startDate, endDate }
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'getConsolidatedStats',
    'Get comprehensive report of engagement statistics across selected sequences',
    {
      sequenceIds: z.array(z.string()).describe("Array of sequence IDs"),
      startDate: z.string().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
      pageNum: z.number().optional().describe("Page number"),
      pageLimit: z.number().optional().describe("Number of items per page")
    },
    async ({ sequenceIds, startDate, endDate, pageNum, pageLimit }) => {
      const response = await client.post('/analytics/consolidated-stats', {
        sequenceIds,
        startDate,
        endDate,
        pageNum,
        pageLimit
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'getSequenceStats',
    'Get high-level statistics for a specific sequence',
    {
      sequenceId: z.string().describe("Sequence ID")
    },
    async ({ sequenceId }) => {
      const response = await client.post('/analytics/stats', {
        sequenceId
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Sequences Module
  server.tool(
    'listSequences',
    'List all sequences',
    {
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Number of items per page")
    },
    async ({ page, limit }) => {
      const response = await client.get('/sequences', {
        params: { page, limit }
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'createSequence',
    'Create a new sequence',
    {
      name: z.string().describe("Sequence name"),
      description: z.string().optional().describe("Sequence description"),
      steps: z.array(z.object({
        templateId: z.string().describe("Template ID"),
        delay: z.number().describe("Delay in hours")
      })).describe("Sequence steps")
    },
    async ({ name, description, steps }) => {
      const response = await client.post('/sequences', {
        name,
        description,
        steps
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Error handling middleware
  server.onError((error) => {
    console.error('MCP Server Error:', error);
    return {
      content: [{ 
        type: 'text', 
        text: `Error: ${error.message || 'An unexpected error occurred'}`
      }]
    };
  });

  return server.server;
}
