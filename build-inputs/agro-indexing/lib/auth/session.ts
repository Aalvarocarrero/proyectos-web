import { isGoogleAccountAllowed, type GoogleAuthConfig } from "./config";
import { isOpaqueToken, randomToken, tokenHash } from "./crypto";
import type { AuthDatabase, AuthUser } from "./store";
export const SESSION_COOKIE_NAME = "__Host-va_session";
export const SESSION_IDLE_TIMEOUT = 12 * 60 * 60;
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
export function sessionCookie(token: string): string {
  if (!isOpaqueToken(token)) throw new Error("invalid_session_token");
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
}
export async function createSession(db: AuthDatabase, config: GoogleAuthConfig, userId: string) {
  const token = randomToken();
  const now = Date.now();
  await db.prepare("INSERT INTO auth_sessions (token_hash, user_id, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?, ?)")
    .bind(await tokenHash(config.sessionSecret, "session", token), userId, now, now, now + SESSION_MAX_AGE * 1000).run();
  return { sessionToken: token, sessionCookie: sessionCookie(token) };
}
export async function getSession(db: AuthDatabase, config: GoogleAuthConfig, token: string | undefined | null): Promise<AuthUser | null> {
  if (!isOpaqueToken(token)) return null;
  const user = await db.prepare("SELECT u.id, u.email, u.display_name, i.subject AS google_subject FROM auth_sessions s JOIN users u ON u.id = s.user_id JOIN auth_identities i ON i.user_id = u.id AND i.provider = 'google' WHERE s.token_hash = ? AND s.expires_at > ? AND s.last_seen_at > ?")
    .bind(await tokenHash(config.sessionSecret, "session", token), Date.now(), Date.now() - SESSION_IDLE_TIMEOUT * 1000).first<{ id: string; email: string; display_name: string | null; google_subject: string }>();
  if (!user || !isGoogleAccountAllowed(config, user.email)) return null;
  const now = Date.now();
  const refreshed = await db.prepare("UPDATE auth_sessions SET last_seen_at = ? WHERE token_hash = ? AND expires_at > ? AND last_seen_at > ? RETURNING token_hash")
    .bind(now, await tokenHash(config.sessionSecret, "session", token), now, now - SESSION_IDLE_TIMEOUT * 1000).first();
  if (!refreshed) return null;
  const owner = config.accessPolicy === "public-production" && config.ownerAdmin
    && config.ownerAdmin.email === user.email.trim().toLowerCase() && config.ownerAdmin.subject === user.google_subject;
  return { ...(owner ? {googleOwnerAdmin: true as const} : {}), id: user.id, email: user.email, displayName: user.display_name || user.email, fullName: user.display_name };
}
export async function revokeSession(db: AuthDatabase, config: GoogleAuthConfig, token: string | undefined | null): Promise<void> {
  if (!isOpaqueToken(token)) return;
  await db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(await tokenHash(config.sessionSecret, "session", token)).run();
}
