// src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "hello-mcp", version: "0.1.0" });

export async function echoUpperHandler({ text }: { text: string }) {
  const jsonResource = {
    type: "resource",
    resource: {
      text: JSON.stringify({ original: text, upper: text.toUpperCase() }),
      uri: "urn:json:echo_upper",
      mimeType: "application/json"
    }
  };

  const result = {
    content: [
      { type: "text", text: text.toUpperCase() },
      jsonResource
    ]
  } as unknown as Record<string, unknown>;

  return result as any;
}

server.registerTool(
  "echo_upper",
  {
    title: "Echo text in upper-case",
    description: "Demo tool: returns your text upper-cased",
    // The SDK expects a ZodRawShape (an object of Zod types) rather than a ZodObject
    inputSchema: { text: z.string().describe("Any text") }
  },
  echoUpperHandler as any
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("hello-mcp running on stdio");
}
import { fileURLToPath } from "node:url";

// Only start the server when this file is the entrypoint. This prevents the server
// from auto-starting when imported by tests.
if (process.argv && process.argv.length > 1) {
  const invokedPath = process.argv[1];
  const thisPath = fileURLToPath(import.meta.url);
  if (invokedPath === thisPath) {
    main().catch(err => { console.error(err); process.exit(1); });
  }
}
