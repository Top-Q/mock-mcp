## quick orientation

This repository is a tiny mock MCP (Model Context Protocol) server implemented in TypeScript. The server registers a single tool `echo_upper` and uses the SDK's `StdioServerTransport` to communicate over stdin/stdout.

Key files:
- `src/server.ts` — MCP server setup, tool registration (`echo_upper`), and the entrypoint `main()`.
- `test/echo.test.ts` — small unit-style test that calls `echoUpperHandler` directly.
- `package.json` — scripts: `npm run dev` (`tsx src/server.ts`), `npm run build` (`tsc -p .`), `npm start` (run built server), and `npm test`.
- `README.md` — usage notes and Copilot Local Agent configuration examples.

What an AI coding agent should know and do first
- The server is an ES module (`"type": "module"`). Use `import`/`export` syntax and respect `node` ESM resolution.
- Prefer editing `src/server.ts`; the built artifacts live under `dist/` after `npm run build`.
- The dev runner is `npx tsx src/server.ts` (or `npm run dev`). Building with `npm run build` emits `dist/src/server.js` which is the production entrypoint.

Patterns & conventions specific to this repo
- Tools are registered on a single `McpServer` instance (`new McpServer({ name: "hello-mcp" })`). Follow that pattern when adding more tools.
- Input schemas are provided as a plain object of Zod types (not a ZodObject). Example in `src/server.ts`: `inputSchema: { text: z.string().describe("Any text") }`.
- The server uses `StdioServerTransport` — tests or agent integrations should communicate over stdio or adapt a transport if using network sockets.
- The file contains a guard to avoid auto-starting when imported by tests — keep the `if (invokedPath === thisPath)` pattern when refactoring entry logic.

Developer workflows (explicit commands)
- Install: `npm install`
- Dev run (no build): `npm run dev` or `npx tsx src/server.ts` — the process will print `hello-mcp running on stdio` to stderr on success.
- Build: `npm run build` (produces `dist/`)
- Run built server: `npm start` (node --enable-source-maps ./dist/src/server.js)
- Test (quick): `npm test` (runs `tsx test/echo.test.ts`)

Integration notes for Copilot Local Agent
- The agent typically launches the MCP server as a subprocess over stdio. Point the agent at `node --enable-source-maps /absolute/path/to/dist/src/server.js` after building.
- The README contains example `agent.json` snippets for Windows; keep those paths absolute.

Files to inspect when extending behavior
- `src/server.ts` — for tool registration and transport choice
- `test/echo.test.ts` — example of how handlers are tested in-process
- `.vscode/tasks.json` and `README.md` — show how the project is intended to be run during development

Examples (copyable snippets found in this repo)
- Registering a tool input schema: `inputSchema: { text: z.string().describe("Any text") }`
- Dev run: `npx tsx src/server.ts` — prints `hello-mcp running on stdio` on stderr

If something is unclear or you need more automation (agent.json, a small MCP client, or a network transport), ask and I'll add it.
