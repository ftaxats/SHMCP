import { z } from "zod";
import { AxiosInstance } from "axios";

type ListTemplatesParams = z.infer<typeof listTemplatesSchema>;
const listTemplatesSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional()
});

type CreateTemplateParams = z.infer<typeof createTemplateSchema>;
const createTemplateSchema = z.object({
  name: z.string(),
  subject: z.string(),
  body: z.string()
});

export const listTemplates = (client: AxiosInstance) => ({
  name: "listTemplates",
  description: "List all email templates",
  parameters: listTemplatesSchema,
  handler: async (args: ListTemplatesParams) => {
    const response = await client.get("/templates", { params: args });
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
});

export const createTemplate = (client: AxiosInstance) => ({
  name: "createTemplate",
  description: "Create a new email template",
  parameters: createTemplateSchema,
  handler: async (args: CreateTemplateParams) => {
    const response = await client.post("/templates", args);
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
}); 