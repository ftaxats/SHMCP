import { AxiosInstance } from "axios";
import { getUserProfile } from "./user";
import { listCampaigns, createCampaign, updateCampaignStatus } from "./campaigns";
import { listTemplates, createTemplate } from "./templates";
import { listContacts, createContact, updateContact } from "./contacts";

export function createTools(client: AxiosInstance) {
  return [
    getUserProfile(client),
    listCampaigns(client),
    createCampaign(client),
    updateCampaignStatus(client),
    listTemplates(client),
    createTemplate(client),
    listContacts(client),
    createContact(client),
    updateContact(client)
  ];
} 