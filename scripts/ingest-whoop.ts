import fs from "node:fs/promises";
import path from "node:path";

const jsonPath =
  process.env.WHOOP_JSON_PATH ??
  "/Users/peterrowland/clawd/whoop-data/whoop.json";
const apiUrl = process.env.API_URL ?? "http://localhost:3000/api/ingest";

async function main() {
  const resolvedPath = path.resolve(jsonPath);
  const raw = await fs.readFile(resolvedPath, "utf-8");
  const payload = JSON.parse(raw);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ingest failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  console.log("Ingest complete:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
