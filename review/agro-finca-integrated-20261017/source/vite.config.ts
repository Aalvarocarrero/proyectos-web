import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";
import {clientPreloadConsistency} from "./build/client-preload-consistency";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  const target = process.env.AUTH_DEPLOYMENT_TARGET ?? "sites";
  if (target !== "sites" && target !== "standalone") throw new Error("Invalid AUTH_DEPLOYMENT_TARGET");
  const release = process.env.AUTH_RELEASE_MODE ?? "staging";
  if (release !== "staging" && release !== "production") throw new Error("Invalid AUTH_RELEASE_MODE");
  if (release === "production" && target !== "standalone") throw new Error("Production requires standalone Google authentication");
  const publicOrigin = process.env.PUBLIC_SITE_ORIGIN ?? "https://venezuelaagro.aalvarocarrero.chatgpt.site";
  const indexing = process.env.PUBLIC_INDEXING_ENABLED ?? "false";
  if (!["true", "false"].includes(indexing)) throw new Error("Invalid PUBLIC_INDEXING_ENABLED");
  if (release === "production" && publicOrigin !== "https://venezuelaagro.com") throw new Error("Set PUBLIC_SITE_ORIGIN explicitly for production");
  if (release !== "production" && (indexing === "true" || publicOrigin !== "https://venezuelaagro.aalvarocarrero.chatgpt.site")) throw new Error("Origin/indexing transition requires production release");
  return {
    define: {__AUTH_DEPLOYMENT_TARGET__: JSON.stringify(target), __AUTH_ACCESS_POLICY__: JSON.stringify(release === "production" ? "public-production" : "private-staging"), __PUBLIC_SITE_ORIGIN__: JSON.stringify(publicOrigin), __PUBLIC_INDEXING_ENABLED__: indexing},
    worker: {format: "es" as const},
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      ...clientPreloadConsistency(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        ...(target === "standalone" ? {configPath: release === "production" ? "./wrangler.production.jsonc" : "./wrangler.staging.jsonc"} : {config: localBindingConfig}),
      }),
    ],
  };
});
