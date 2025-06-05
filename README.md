# SalesHandy MCP Server

A Model Context Protocol (MCP) server that provides a comprehensive interface to the SalesHandy API.

## Prerequisites

- Node.js 18+
- npm or yarn
- A SalesHandy API key (Get it from [SalesHandy API Documentation](https://open-api.saleshandy.com/api-doc/))

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your SalesHandy API key in the Smithery configuration.

## API Key Configuration

The MCP server requires a valid SalesHandy API key to function. The API key is validated when the server starts up.

### Configuration Format

```typescript
{
  apiKey: string;    // Required: Your SalesHandy API key from https://open-api.saleshandy.com/api-doc/
  baseUrl?: string;  // Optional: API base URL (defaults to https://open-api.saleshandy.com/api/v1)
}
```

### API Key Validation

The server will automatically validate your API key on startup by:
1. Making a test request to the SalesHandy API
2. Verifying the response status
3. Providing clear error messages if the key is invalid

If the API key validation fails, you'll receive one of these error messages:
- "Invalid SalesHandy API key. Please check your API key and try again."
- "Failed to validate SalesHandy API key. Please try again later."

## Usage

1. Start the development server:
```bash
npx @smithery/cli dev
```

2. The server will validate your API key before becoming available.

## Features

This MCP server implements the following SalesHandy API modules:

1. **User Module**
   - Get user profile

2. **Campaigns Module**
   - List campaigns
   - Create campaign

3. **Templates Module**
   - List email templates
   - Create email template

4. **Contacts Module**
   - List contacts
   - Create contact

5. **Analytics Module**
   - Get consolidated statistics across sequences
   - Get sequence-specific statistics
   - Get campaign analytics

6. **Sequences Module**
   - List sequences
   - Create sequence

## Available Tools

### User Module
- `getUserProfile`: Get the authenticated user's profile

### Campaigns Module
- `listCampaigns`: List all campaigns with pagination
- `createCampaign`: Create a new campaign

### Templates Module
- `listTemplates`: List all email templates with pagination
- `createTemplate`: Create a new email template

### Contacts Module
- `listContacts`: List all contacts with pagination
- `createContact`: Create a new contact

### Analytics Module
- `getConsolidatedStats`: Get comprehensive engagement statistics across multiple sequences
  ```typescript
  {
    sequenceIds: string[];    // Array of sequence IDs
    startDate: string;        // Start date (YYYY-MM-DD)
    endDate: string;         // End date (YYYY-MM-DD)
    pageNum?: number;        // Optional: Page number
    pageLimit?: number;      // Optional: Items per page
  }
  ```
- `getSequenceStats`: Get high-level statistics for a specific sequence
  ```typescript
  {
    sequenceId: string;      // Sequence ID
  }
  ```
- `getCampaignAnalytics`: Get analytics for a specific campaign

### Sequences Module
- `listSequences`: List all sequences with pagination
- `createSequence`: Create a new sequence

## Error Handling

The server includes built-in error handling that will:
1. Log errors to the console
2. Return user-friendly error messages
3. Maintain proper error types for API responses
4. Validate API key before any operations

## Development

To add new features or modify existing ones:

1. Edit the `src/index.ts` file
2. Add new tools using the `server.tool()` method
3. Define input schemas using Zod
4. Implement the handler function

## License

MIT 