export type GoogleAuthConfig = {
  accessPolicy?: "private-staging" | "public-production"; ownerAdmin?: {email: string; subject: string};
  origin: string; clientId: string; clientSecret: string; sessionSecret: string;
  turnstileSiteKey: string; turnstileSecret: string; allowedEmails: string[];
};
export type AuthEnvironment = Record<string, unknown>;
export function deploymentTarget(): 'sites' | 'standalone' {
  if (typeof __AUTH_DEPLOYMENT_TARGET__ === 'undefined') throw new Error('auth_deployment_target_missing');
  if (__AUTH_DEPLOYMENT_TARGET__ !== 'sites' && __AUTH_DEPLOYMENT_TARGET__ !== 'standalone') throw new Error('auth_deployment_target_invalid');
  return __AUTH_DEPLOYMENT_TARGET__;
}
export function parseAuthConfig(env: AuthEnvironment): GoogleAuthConfig {
  const required = (key: string) => { const value = env[key]; if (typeof value !== 'string' || !value.trim()) throw new Error('auth_configuration_incomplete'); return value.trim(); };
  if (required('AUTH_MODE') !== 'google') throw new Error('auth_mode_invalid');
  const origin = required('APP_ORIGIN');
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.origin !== origin || url.username || url.password) throw new Error('auth_origin_invalid');
  const sessionSecret = required('AUTH_SESSION_SECRET');
  if (sessionSecret.length < 43) throw new Error('auth_session_secret_invalid');
  const accessPolicy = env.AUTH_ACCESS_POLICY ?? "private-staging";
  if (accessPolicy !== "private-staging" && accessPolicy !== "public-production") throw new Error("auth_access_policy_invalid");
  if (typeof __AUTH_ACCESS_POLICY__ !== "undefined" && accessPolicy !== __AUTH_ACCESS_POLICY__) throw new Error("auth_build_policy_mismatch");
  // Public mode is a deliberate production-domain opt-in, never inferred from a missing tester list.
  if (accessPolicy === "public-production" && origin !== "https://venezuelaagro.com") throw new Error("production_origin_invalid");
  const validEmail = (value: string) => /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(value);
  const allowedEmails = accessPolicy === "private-staging"
    ? required('STAGING_ALLOWED_EMAILS').split(',').map(value => value.trim().toLowerCase()).filter(Boolean) : [];
  if (accessPolicy === "private-staging" && (!allowedEmails.length || allowedEmails.some(value => !validEmail(value)))) throw new Error('auth_allowlist_invalid');
  const ownerEmail = typeof env.OWNER_ADMIN_EMAIL === "string" ? env.OWNER_ADMIN_EMAIL.trim().toLowerCase() : "";
  const ownerSubject = typeof env.OWNER_GOOGLE_SUBJECT === "string" ? env.OWNER_GOOGLE_SUBJECT.trim() : "";
  if ((ownerEmail || ownerSubject) && (accessPolicy !== "public-production" || !validEmail(ownerEmail) || !/^[A-Za-z0-9_-]{1,255}$/.test(ownerSubject))) throw new Error("owner_admin_configuration_invalid");
  const ownerAdmin = ownerEmail && ownerSubject ? {email: ownerEmail, subject: ownerSubject} : undefined;
  return {accessPolicy, ownerAdmin, origin, sessionSecret, allowedEmails, clientId: required('GOOGLE_CLIENT_ID'), clientSecret: required('GOOGLE_CLIENT_SECRET'), turnstileSiteKey: required('TURNSTILE_SITE_KEY'), turnstileSecret: required('TURNSTILE_SECRET_KEY')};
}
export async function getAuthConfig(): Promise<GoogleAuthConfig> {
  if (deploymentTarget() !== 'standalone') throw new Error('google_auth_disabled');
  const {env} = await import('cloudflare:workers');
  return parseAuthConfig(env as unknown as AuthEnvironment);
}

/** Only called after Google token validation, or a valid server session joined to a Google identity. */
export function isGoogleAccountAllowed(config: GoogleAuthConfig, email: string): boolean {
  return config.accessPolicy === "public-production" || config.allowedEmails.includes(email.trim().toLowerCase());
}
