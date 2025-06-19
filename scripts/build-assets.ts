#!/usr/bin/env bun

import { $ } from "bun";

console.log("🔨 Building assets...");

try {
  await $`npx @tailwindcss/cli -i ./assets/css/main.css -o ./src/public/css/main.css`;

  await $`bun build assets/scripts/htmx.ts --outfile ./src/public/js/htmx.min.js`;
  await $`bun build assets/scripts/hyperscript.ts --outfile ./src/public/js/hyperscript.min.js`;
  await $`bun build assets/js/error-handling.ts --outfile ./src/public/js/error-handling.min.js`;

  console.log("✅ Assets built successfully!");
} catch (error) {
  console.error("❌ Error building assets:", error);
  process.exit(1);
}
