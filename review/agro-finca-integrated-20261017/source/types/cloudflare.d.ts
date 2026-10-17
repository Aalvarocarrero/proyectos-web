/// <reference types="@cloudflare/workers-types" />
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET: R2Bucket;
  }
}
declare const __AUTH_DEPLOYMENT_TARGET__: 'sites' | 'standalone';

declare const __PUBLIC_SITE_ORIGIN__: string;
declare const __PUBLIC_INDEXING_ENABLED__: boolean;
declare const __AUTH_ACCESS_POLICY__: "private-staging" | "public-production";
