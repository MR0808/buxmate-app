import "dotenv/config";
import { execSync } from "node:child_process";

function assertSafeToReset(): void {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const allowReset = process.env.ALLOW_DB_RESET === "true";
  const isProduction = process.env.NODE_ENV === "production";

  const looksLikeProduction =
    /supabase\.co|prod|production|live/i.test(databaseUrl) &&
    !/localhost|127\.0\.0\.1/i.test(databaseUrl);

  if (isProduction && !allowReset) {
    console.error(
      "Refusing to reset: NODE_ENV=production. Set ALLOW_DB_RESET=true to override.",
    );
    process.exit(1);
  }

  if (looksLikeProduction && !allowReset) {
    console.error(
      "Refusing to reset: DATABASE_URL looks like a remote/production database.",
    );
    console.error("");
    console.error("To reset your Supabase dev database, add to .env:");
    console.error("  ALLOW_DB_RESET=true");
    console.error("");
    console.error("Or run once in PowerShell:");
    console.error('  $env:ALLOW_DB_RESET="true"; npm run db:reset');
    process.exit(1);
  }
}

function run(command: string): void {
  console.log(`\n> ${command}\n`);
  execSync(command, { stdio: "inherit", env: process.env });
}

assertSafeToReset();

console.log("⚠️  This will DELETE ALL DATA in the database and reseed it.");

run("npx prisma db push --force-reset");
run("npx prisma generate");
run("npx prisma db seed");

console.log("\n✓ Database reset and seed complete.\n");
