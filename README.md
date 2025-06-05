# SalesHandy MCP Server

A Model Context Protocol (MCP) server for SalesHandy API integration. This server provides tools for managing campaigns, templates, contacts, and more through the SalesHandy API.

## Features

The server provides several tools for managing SalesHandy resources:

1. **User Profile Management**
   - Get current user profile information

2. **Campaign Management**
   - List all campaigns with filtering
   - Create new campaigns
   - Update campaign status

3. **Template Management**
   - List all email templates
   - Create new email templates

4. **Contact Management**
   - List all contacts
   - Create new contacts
   - Update existing contacts

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

The server requires the following configuration:

1. **API Key**: Your SalesHandy API key
   - Get it from your SalesHandy account settings
   - Required for all API operations

2. **Base URL** (optional):
   - Default: https://api.saleshandy.com/api/v1
   - Can be overridden if needed

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Connect to the server using an MCP client:
   ```typescript
   const client = new McpClient({
     config: {
       apiKey: "your-saleshandy-api-key"
     }
   });
   ```

3. Use the available tools:
   ```typescript
   // Get user profile
   const profile = await client.tools.getUserProfile();

   // List campaigns
   const campaigns = await client.tools.listCampaigns({
     status: "running",
     page: 1,
     limit: 10
   });
   ```

## Development

1. Install development dependencies:
   ```bash
   npm install
   ```

2. Start development server with hot reload:
   ```bash
   npm run dev
   ```

## Deployment

The server can be deployed using Smithery:

1. Ensure your `smithery.yaml` is properly configured
2. Deploy using Smithery's deployment tools
3. Provide the required configuration (API key) during deployment

## API Reference

### Tools

#### getUserProfile
Get current user profile information.

#### listCampaigns
List all campaigns with optional filtering.
- Parameters:
  - status: Campaign status (draft, scheduled, running, paused, completed)
  - page: Page number
  - limit: Items per page
  - search: Search term

#### createCampaign
Create a new campaign.
- Parameters:
  - name: Campaign name
  - subject: Email subject
  - templateId: Template ID
  - scheduleTime: Schedule time (ISO format)
  - contacts: List of contact IDs

#### updateCampaignStatus
Update campaign status.
- Parameters:
  - campaignId: Campaign ID
  - status: New status

#### listTemplates
List all email templates.
- Parameters:
  - page: Page number
  - limit: Items per page

#### createTemplate
Create a new email template.
- Parameters:
  - name: Template name
  - subject: Email subject
  - body: Email body (HTML)

#### listContacts
List all contacts.
- Parameters:
  - page: Page number
  - limit: Items per page
  - search: Search term

#### createContact
Create a new contact.
- Parameters:
  - email: Contact email
  - firstName: First name
  - lastName: Last name
  - company: Company name
  - tags: Contact tags

#### updateContact
Update an existing contact.
- Parameters:
  - contactId: Contact ID
  - email: Contact email
  - firstName: First name
  - lastName: Last name
  - company: Company name
  - tags: Contact tags

## License

MIT 