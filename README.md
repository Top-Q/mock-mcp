# mock_mcp

A tiny mocked MCP (Model Context Protocol) server example.

## Requirements

- Node 18+ (for ESM support)
- npm

## Goal

Make this MCP server available to the GitHub Copilot Local Agent (the Copilot "agent") so Copilot (and Copilot Agents in VS Code) can call the `echo_upper` tool during sessions.

## What I added

- `.vscode/tasks.json` — tasks to run the server in dev (`npm run dev`) or built mode (`npm start`) and to build TypeScript.
- `.vscode/launch.json` — convenience launch configurations to run the server from the VS Code debugger.

## How to run the server

In PowerShell (Windows):

```
# dev (no build, uses tsx):
npx tsx src/server.ts

# or run the VS Code task: Run Task -> Run MCP server (dev)

# built (recommended for production test):
npm run build
npm start
```

When the server is started it will write a message to stderr: `hello-mcp running on stdio`.

The MCP server in this example communicates over stdio by default (`StdioServerTransport`). The Copilot Local Agent expects to start or connect to MCP servers in one of a few ways:

1) Copilot agent launches the MCP server as a subprocess and communicates over stdio. In that case you configure the agent to run `node --enable-source-maps ./dist/src/server.js` (or `npx tsx src/server.ts` for dev) as the MCP program.

2) Copilot agent connects to a long-lived process over stdin/stdout via a process wrapper. The agent must be configured with the process path and arguments.

3) (Less common) Use a network transport. This repository uses `StdioServerTransport`, so a network transport would require changing the server.

Below are concrete Windows instructions to configure the Copilot Local Agent to use this server.

## Configure GitHub Copilot Local Agent (Windows)

Assumptions:
- You have the GitHub Copilot Local Agent or the Copilot Agents feature installed and available in VS Code.
- The agent supports registering local MCP providers via an `agents`/`mcp` config file or environment variable. If your version of the agent uses a different method, adapt the instructions below.

Option A — agent launches the server directly (recommended):

1. Build the project: `npm run build`.
2. Locate the Copilot Local Agent config file. On Windows, it may be at `%APPDATA%\GitHub Copilot\agent.json` or `%USERPROFILE%\.config\copilot\agent.json`. If you don't have this file, create it.
3. Add an MCP provider entry that launches this repo's built server. Example `agent.json` snippet:

```json
{
	"mcpProviders": [
		{
			"name": "mock_mcp",
			"command": "node",
			"args": ["--enable-source-maps","C:/Users/yourname/git/mock_mcp/dist/src/server.js"],
			"stdio": "inherit",
			"env": {}
		}
	]
}
```

Adjust the path to `server.js` to your absolute path. When the agent starts it will spawn the MCP server and communicate over stdio.

Option B — agent connects to a pre-started process (you start the server and tell the agent how to attach):

1. Start the server in dev or built mode in a terminal with `npx tsx src/server.ts` or `npm start`.
2. Configure the agent to attach to the running process — the exact configuration method depends on your agent version; consult Copilot Local Agent docs. Typically the agent needs an `mcpProviders` entry with `attach: true` and a `pid` or a wrapper command.

If your Copilot agent supports an environment variable pointing to the MCP command, set it in your VS Code settings or the agent service. Example (PowerShell):

```
$env:COPILOT_MCP_MOCK_MCP_CMD = "node --enable-source-maps C:/Users/yourname/git/mock_mcp/dist/src/server.js"
```

## Testing the server manually

Because the server implements MCP protocol, the easiest quick test is to use the same MCP SDK client or a simple stdio wrapper that performs the MCP handshake. You can also run the included test: `npm test` which uses `tsx test/echo.test.ts` and should validate the `echo_upper` tool.

## Next steps and notes

- If you want network transports (HTTP or WebSocket) implement a Transport that uses sockets instead of `StdioServerTransport`.
- If Copilot's agent expects a specific manifest (like a JSON capabilities file), create one under `.mcp` and point the agent at it.
- If you want the agent to automatically start the MCP server when VS Code opens, use a VS Code extension or a workspace-specific agent configuration.

If you want, I can:

- Generate a small `agent.json` file in the repo (example) and a small PowerShell script `run-agent-mock.ps1` that spawns the Copilot agent pointing at this MCP server.
- Add a small test client (Node) that does a minimal MCP handshake and calls `echo_upper`.

## Install

```pwsh
npm install
```

## Run (development)

This runs the server directly from `src` using `tsx` (no build step required):

```pwsh
npm run dev
```

You should see `hello-mcp running on stdio` printed to stderr.

## Build

To compile to `dist`:

```pwsh
npm run build
```

## Notes

- The project is configured as an ES module (`"type": "module"`).
- TypeScript settings include Node types; if you add tests or other node-only code, ensure `@types/node` is installed (already in devDependencies).
- This mock registers a single tool `echo_upper` that returns a text response and a JSON resource.

If you want me to add an automated test that invokes the tool over stdio framing, I can implement a small client script next.
