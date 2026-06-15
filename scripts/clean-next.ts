import { rmSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");

try {
  rmSync(nextDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  console.log("Removed .next cache");
} catch (error) {
  console.error("Could not remove .next — stop the dev server first, then retry.");
  console.error(error);
  process.exit(1);
}
