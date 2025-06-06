import { z } from "zod";
import { AxiosInstance } from "axios";

export const getUserProfile = (client: AxiosInstance) => ({
  name: "getUserProfile",
  description: "Get current user profile information",
  parameters: z.object({}),
  handler: async () => {
    try {
      const response = await client.get("/user/profile");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw error;
    }
  }
}); 