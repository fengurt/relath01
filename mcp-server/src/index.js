import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

const mcpServer = new McpServer({
  name: "relath-mcp",
  version: "0.1.0",
});

mcpServer.registerTool(
  "relath_health",
  {
    description: "GET /api/v1/public/health on the relath backend",
    inputSchema: {
      baseUrl: z
        .string()
        .url()
        .optional()
        .describe("API base URL (default http://host.docker.internal:8080 or http://localhost:8080)"),
    },
  },
  async ({ baseUrl }) => {
    const resolvedBase =
      baseUrl ?? process.env.RELATH_API_BASE ?? "http://127.0.0.1:8080";
    const url = new URL("/api/v1/public/health", resolvedBase).toString();
    const response = await fetch(url);
    const bodyText = await response.text();
    return {
      content: [
        {
          type: "text",
          text: `HTTP ${response.status}\n${bodyText}`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await mcpServer.connect(transport);
