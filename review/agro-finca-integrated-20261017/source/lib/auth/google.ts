import * as oauth from "oauth4webapi";
import { isGoogleAccountAllowed, type GoogleAuthConfig } from "./config";
import { decryptVerifier, encryptVerifier, isOpaqueToken, randomToken, tokenHash } from "./crypto";
import { AuthError, findOrCreateGoogleUser, saveTransaction, takeTransaction, type AuthDatabase } from "./store";
import { createSession } from "./session";
export type { GoogleAuthConfig } from "./config";
export const TRANSACTION_COOKIE_NAME = "__Host-va_oauth";
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";
const TRANSACTION_MAX_AGE = 10 * 60;
// Fixed Google endpoints prevent user-controlled issuer discovery and token/JWKS endpoint substitution.
const GOOGLE: oauth.AuthorizationServer = {
  issuer: "https://accounts.google.com",
  authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  token_endpoint: "https://oauth2.googleapis.com/token",
  jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
  id_token_signing_alg_values_supported: ["RS256"],
};
export function clearTransactionCookie(): string {
  return `${TRANSACTION_COOKIE_NAME}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
}
export { safeRelativeReturnPath as safeReturnTo } from "../auth-paths";
import { safeRelativeReturnPath as safeReturnTo } from "../auth-paths";
export async function startGoogleLogin(db: AuthDatabase, config: GoogleAuthConfig, returnTo = "/") {
  const state = randomToken();
  const browser = randomToken();
  const nonce = oauth.generateRandomNonce();
  const verifier = oauth.generateRandomCodeVerifier();
  const stateHash = await tokenHash(config.sessionSecret, "state", state);
  await saveTransaction(db, {
    state_hash: stateHash,
    browser_hash: await tokenHash(config.sessionSecret, "browser", browser),
    nonce, verifier: await encryptVerifier(config.sessionSecret, stateHash, verifier), return_to: safeReturnTo(returnTo), expires_at: Date.now() + TRANSACTION_MAX_AGE * 1000,
  });
  const url = new URL(GOOGLE.authorization_endpoint!);
  url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: `${config.origin}${GOOGLE_CALLBACK_PATH}`, response_type: "code", scope: "openid email profile", state, nonce, code_challenge: await oauth.calculatePKCECodeChallenge(verifier), code_challenge_method: "S256", prompt: "select_account" }).toString();
  return { authorizationUrl: url.href, transactionCookie: `${TRANSACTION_COOKIE_NAME}=${browser}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${TRANSACTION_MAX_AGE}` };
}
export async function consumeGoogleCallback(db: AuthDatabase, config: GoogleAuthConfig, callbackUrl: URL, transactionCookie: string | undefined) {
  if (callbackUrl.origin !== config.origin || callbackUrl.pathname !== GOOGLE_CALLBACK_PATH) throw new AuthError("invalid_callback");
  const states = callbackUrl.searchParams.getAll("state");
  if (states.length !== 1 || !isOpaqueToken(states[0]) || !isOpaqueToken(transactionCookie)) throw new AuthError("invalid_transaction");
  const state = states[0];
  const transaction = await takeTransaction(db, await tokenHash(config.sessionSecret, "state", state), await tokenHash(config.sessionSecret, "browser", transactionCookie));
  if (!transaction) throw new AuthError("expired_or_used_transaction");
  const client: oauth.Client = { client_id: config.clientId, id_token_signed_response_alg: "RS256" };
  const parameters = oauth.validateAuthResponse(GOOGLE, client, callbackUrl, state);
  const response = await oauth.authorizationCodeGrantRequest(GOOGLE, client, oauth.ClientSecretPost(config.clientSecret), parameters, `${config.origin}${GOOGLE_CALLBACK_PATH}`, await decryptVerifier(config.sessionSecret, transaction.state_hash, transaction.verifier), { signal: AbortSignal.timeout(15_000) });
  // Processing validates issuer, audience/azp, expiry, nonce and required claims. Signature validation is deliberately explicit.
  const tokens = await oauth.processAuthorizationCodeResponse(GOOGLE, client, response, { expectedNonce: transaction.nonce, requireIdToken: true });
  await oauth.validateApplicationLevelSignature(GOOGLE, response, { signal: AbortSignal.timeout(15_000) });
  const claims = oauth.getValidatedIdTokenClaims(tokens);
  if (claims?.azp !== undefined && claims.azp !== config.clientId) throw new AuthError("invalid_authorized_party");
  if (!claims || claims.email_verified !== true || typeof claims.email !== "string" || !claims.email.trim() || !claims.sub) throw new AuthError("unverified_identity");
  if (typeof claims.exp !== "number" || typeof claims.iat !== "number" || !Number.isFinite(claims.exp) || !Number.isFinite(claims.iat) || claims.iat > Math.floor(Date.now() / 1000) + 60) throw new AuthError("invalid_token_time");
  const email = claims.email.trim().toLowerCase();
  if (!isGoogleAccountAllowed(config, email)) throw new AuthError("account_not_allowed");
  const name = typeof claims.name === "string" ? claims.name.slice(0, 200) : null;
  const user = await findOrCreateGoogleUser(db, claims.sub, email, name);
  return { user, ...(await createSession(db, config, user.id)), returnTo: transaction.return_to };
}
