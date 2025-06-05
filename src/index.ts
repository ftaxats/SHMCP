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
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid SalesHandy API key. Please check your API key and try again.');
      }
    }
    throw new Error('Failed to validate SalesHandy API key. Please try again later.');
  }
};

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
    'List all campaigns with pagination',
    {
      ...paginationSchema.shape,
      status: z.enum(['active', 'paused', 'completed', 'all']).optional().describe("Filter by status"),
      search: z.string().optional().describe("Search term for campaigns")
    },
    async ({ page, limit, status, search }: { 
      page?: number; 
      limit?: number; 
      status?: 'active' | 'paused' | 'completed' | 'all'; 
      search?: string; 
    }) => {
      const response = await client.get('/campaigns', {
        params: { page, limit, status, search }
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
        schedule: z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          timezone: z.string().optional()
        }).optional(),
        emailSettings: z.object({
          replyTo: z.string().email().optional(),
          fromName: z.string().optional()
        }).optional()
      }).optional()
    },
    async (campaignData: {
      name: string;
      description?: string;
      settings?: {
        schedule?: {
          startDate?: string;
          endDate?: string;
          timezone?: string;
        };
        emailSettings?: {
          replyTo?: string;
          fromName?: string;
        };
      };
    }) => {
      const response = await client.post('/campaigns', campaignData);
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'updateCampaignStatus',
    'Update campaign status (pause/resume)',
    {
      campaignId: z.string().describe("Campaign ID"),
      status: z.enum(['active', 'paused']).describe("New campaign status")
    },
    async ({ campaignId, status }: { campaignId: string; status: 'active' | 'paused' }) => {
      const response = await client.put(`/campaigns/${campaignId}/status`, { status });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Templates Module
  server.tool(
    'listTemplates',
    'List all email templates with pagination',
    paginationSchema,
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
      type: z.enum(['html', 'text']).describe("Template type"),
      variables: z.array(z.string()).optional().describe("Template variables")
    },
    async ({ name, subject, body, type, variables }: {
      name: string;
      subject: string;
      body: string;
      type: 'html' | 'text';
      variables?: string[];
    }) => {
      const response = await client.post('/templates', {
        name,
        subject,
        body,
        type,
        variables
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Contacts Module
  server.tool(
    'listContacts',
    'List all contacts with pagination',
    {
      ...paginationSchema.shape,
      search: z.string().optional().describe("Search term for contacts"),
      tags: z.array(z.string()).optional().describe("Filter by tags")
    },
    async ({ page, limit, search, tags }: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string[];
    }) => {
      const response = await client.get('/contacts', {
        params: { page, limit, search, tags }
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
      company: z.string().optional().describe("Company name"),
      title: z.string().optional().describe("Job title"),
      phone: z.string().optional().describe("Phone number"),
      tags: z.array(z.string()).optional().describe("Contact tags"),
      customFields: z.record(z.string()).optional().describe("Custom fields")
    },
    async (contactData: {
      email: string;
      firstName?: string;
      lastName?: string;
      company?: string;
      title?: string;
      phone?: string;
      tags?: string[];
      customFields?: Record<string, string>;
    }) => {
      const response = await client.post('/contacts', contactData);
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'updateContact',
    'Update an existing contact',
    {
      contactId: z.string().describe("Contact ID"),
      email: z.string().email().optional().describe("Contact email"),
      firstName: z.string().optional().describe("First name"),
      lastName: z.string().optional().describe("Last name"),
      company: z.string().optional().describe("Company name"),
      title: z.string().optional().describe("Job title"),
      phone: z.string().optional().describe("Phone number"),
      tags: z.array(z.string()).optional().describe("Contact tags"),
      customFields: z.record(z.string()).optional().describe("Custom fields")
    },
    async ({ contactId, ...updateData }: {
      contactId: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      company?: string;
      title?: string;
      phone?: string;
      tags?: string[];
      customFields?: Record<string, string>;
    }) => {
      const response = await client.put(`/contacts/${contactId}`, updateData);
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Sequences Module
  server.tool(
    'listSequences',
    'List all sequences with pagination',
    {
      ...paginationSchema.shape,
      search: z.string().optional().describe("Search term for sequences"),
      status: z.enum(['active', 'paused', 'all']).optional().describe("Filter by status")
    },
    async ({ page, limit, search, status }: {
      page?: number;
      limit?: number;
      search?: string;
      status?: 'active' | 'paused' | 'all';
    }) => {
      const response = await client.get('/sequences', {
        params: { page, limit, search, status }
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
        delay: z.number().describe("Delay in hours"),
        conditions: z.object({
          ifOpened: z.boolean().optional(),
          ifReplied: z.boolean().optional(),
          ifClicked: z.boolean().optional()
        }).optional()
      })).describe("Sequence steps"),
      settings: z.object({
        schedule: z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          timezone: z.string().optional()
        }).optional(),
        emailSettings: z.object({
          replyTo: z.string().email().optional(),
          fromName: z.string().optional()
        }).optional()
      }).optional()
    },
    async (sequenceData: {
      name: string;
      description?: string;
      steps: Array<{
        templateId: string;
        delay: number;
        conditions?: {
          ifOpened?: boolean;
          ifReplied?: boolean;
          ifClicked?: boolean;
        };
      }>;
      settings?: {
        schedule?: {
          startDate?: string;
          endDate?: string;
          timezone?: string;
        };
        emailSettings?: {
          replyTo?: string;
          fromName?: string;
        };
      };
    }) => {
      const response = await client.post('/sequences', sequenceData);
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Analytics Module
  server.tool(
    'getConsolidatedStats',
    'Get comprehensive engagement statistics across sequences',
    {
      sequenceIds: z.array(z.string()).describe("Array of sequence IDs"),
      ...dateRangeSchema.shape,
      pageNum: z.number().optional().describe("Page number"),
      pageLimit: z.number().optional().describe("Number of items per page")
    },
    async ({ sequenceIds, startDate, endDate, pageNum, pageLimit }: {
      sequenceIds: string[];
      startDate: string;
      endDate: string;
      pageNum?: number;
      pageLimit?: number;
    }) => {
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
      sequenceId: z.string().describe("Sequence ID"),
      ...dateRangeSchema.shape
    },
    async ({ sequenceId, startDate, endDate }: {
      sequenceId: string;
      startDate: string;
      endDate: string;
    }) => {
      const response = await client.post('/analytics/stats', {
        sequenceId,
        startDate,
        endDate
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  // Webhooks Module
  server.tool(
    'listWebhooks',
    'List all registered webhooks',
    paginationSchema,
    async ({ page, limit }) => {
      const response = await client.get('/webhooks', {
        params: { page, limit }
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'createWebhook',
    'Create a new webhook',
    {
      url: z.string().url().describe("Webhook URL"),
      events: z.array(z.enum([
        'email.opened',
        'email.clicked',
        'email.replied',
        'email.bounced',
        'sequence.started',
        'sequence.completed',
        'contact.created',
        'contact.updated'
      ])).describe("Events to subscribe to"),
      secret: z.string().optional().describe("Webhook secret for signature verification")
    },
    async ({ url, events, secret }: {
      url: string;
      events: Array<'email.opened' | 'email.clicked' | 'email.replied' | 'email.bounced' | 'sequence.started' | 'sequence.completed' | 'contact.created' | 'contact.updated'>;
      secret?: string;
    }) => {
      const response = await client.post('/webhooks', {
        url,
        events,
        secret
      });
      return {
        content: [{ type: 'json', json: response.data }]
      };
    }
  );

  server.tool(
    'deleteWebhook',
    'Delete a webhook',
    {
      webhookId: z.string().describe("Webhook ID")
    },
    async ({ webhookId }: { webhookId: string }) => {
      await client.delete(`/webhooks/${webhookId}`);
      return {
        content: [{ type: 'text', text: 'Webhook deleted successfully' }]
      };
    }
  );

  // Error handling middleware
  server.onError((error: any) => {
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
