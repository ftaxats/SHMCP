import { z } from "zod";
import { AxiosInstance } from "axios";

type ListContactsParams = z.infer<typeof listContactsSchema>;
const listContactsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional()
});

type CreateContactParams = z.infer<typeof createContactSchema>;
const createContactSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional(),
  tags: z.array(z.string()).optional()
});

type UpdateContactParams = z.infer<typeof updateContactSchema>;
const updateContactSchema = z.object({
  contactId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const listContacts = (client: AxiosInstance) => ({
  name: "listContacts",
  description: "List all contacts",
  parameters: listContactsSchema,
  handler: async (args: ListContactsParams) => {
    const response = await client.get("/contacts", { params: args });
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
});

export const createContact = (client: AxiosInstance) => ({
  name: "createContact",
  description: "Create a new contact",
  parameters: createContactSchema,
  handler: async (args: CreateContactParams) => {
    const response = await client.post("/contacts", args);
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
});

export const updateContact = (client: AxiosInstance) => ({
  name: "updateContact",
  description: "Update an existing contact",
  parameters: updateContactSchema,
  handler: async (args: UpdateContactParams) => {
    const { contactId, ...contactData } = args;
    const response = await client.put(`/contacts/${contactId}`, contactData);
    return {
      type: "text" as const,
      content: JSON.stringify(response.data, null, 2)
    };
  }
}); 