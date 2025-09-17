import assert from "node:assert/strict";
import { echoUpperHandler } from "../src/server.js";

async function run() {
  const input = { text: "Hello World" };
  const res = await echoUpperHandler(input);

  // Basic shape checks
  assert.ok(res && typeof res === "object", "result should be an object");
  assert.ok(Array.isArray((res as any).content), "content should be an array");

  const content = (res as any).content;
  assert.strictEqual(content[0].type, "text");
  assert.strictEqual(content[0].text, "HELLO WORLD");

  // resource contains the JSON string
  assert.strictEqual(content[1].type, "resource");
  const parsed = JSON.parse(content[1].resource.text);
  assert.deepStrictEqual(parsed, { original: "Hello World", upper: "HELLO WORLD" });

  console.log("PASS: echoUpperHandler test passed");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
