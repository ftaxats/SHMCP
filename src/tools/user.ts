import { z } from "zod";
import { AxiosInstance } from "axios";

export const getUserProfile = (client: AxiosInstance) => ({
  name: "getUserProfile",
  description: "Get current user profile information",
  parameters: z.object({}),
  handler: async () => {
    const response = await client.get("/user/profile");
    return {
      content: [{
        type: "text",
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }
}); 