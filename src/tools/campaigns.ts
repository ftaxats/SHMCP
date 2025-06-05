import { z } from "zod";
import { AxiosInstance } from "axios";

const campaignStatus = z.enum(["draft", "scheduled", "running", "paused", "completed"]);

type ListCampaignsParams = z.infer<typeof listCampaignsSchema>;
const listCampaignsSchema = z.object({
  status: campaignStatus.optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional()
});

type CreateCampaignParams = z.infer<typeof createCampaignSchema>;
const createCampaignSchema = z.object({
  name: z.string(),
  subject: z.string(),
  templateId: z.string(),
  scheduleTime: z.string(),
  contacts: z.array(z.string())
});

type UpdateCampaignStatusParams = z.infer<typeof updateCampaignStatusSchema>;
const updateCampaignStatusSchema = z.object({
  campaignId: z.string(),
  status: campaignStatus
});

export const listCampaigns = (client: AxiosInstance) => ({
  name: "listCampaigns",
  description: "List all campaigns with optional filtering",
  parameters: listCampaignsSchema,
  handler: async (args: ListCampaignsParams) => {
    const response = await client.get("/campaigns", { params: args });
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
});

export const createCampaign = (client: AxiosInstance) => ({
  name: "createCampaign",
  description: "Create a new campaign",
  parameters: createCampaignSchema,
  handler: async (args: CreateCampaignParams) => {
    const response = await client.post("/campaigns", args);
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
});

export const updateCampaignStatus = (client: AxiosInstance) => ({
  name: "updateCampaignStatus",
  description: "Update campaign status",
  parameters: updateCampaignStatusSchema,
  handler: async (args: UpdateCampaignStatusParams) => {
    const response = await client.patch(`/campaigns/${args.campaignId}/status`, { status: args.status });
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
}); 