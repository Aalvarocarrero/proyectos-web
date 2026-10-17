export type AuthDatabase = D1Database;
export type AuthUser = { googleOwnerAdmin?: true; id: string; email: string; displayName: string; fullName: string | null };
export type LoginTransaction = { state_hash: string; browser_hash: string; nonce: string; verifier: string; return_to: string; expires_at: number };
export class AuthError extends Error {
  constructor(public readonly code: string) { super(code); this.name = "AuthError"; }
}
export async function saveTransaction(db: AuthDatabase, transaction: LoginTransaction): Promise<void> {
  await db.prepare("INSERT INTO auth_transactions (state_hash, browser_hash, nonce, verifier, return_to, expires_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(transaction.state_hash, transaction.browser_hash, transaction.nonce, transaction.verifier, transaction.return_to, transaction.expires_at).run();
}
/** Single DELETE RETURNING makes consumption atomic, including simultaneous callback requests. */
export async function takeTransaction(db: AuthDatabase, stateHash: string, browserHash: string, now = Date.now()): Promise<LoginTransaction | null> {
  return db.prepare("DELETE FROM auth_transactions WHERE state_hash = ? AND browser_hash = ? AND expires_at > ? RETURNING *")
    .bind(stateHash, browserHash, now).first<LoginTransaction>();
}
export async function findOrCreateGoogleUser(db: AuthDatabase, subject: string, email: string, name: string | null): Promise<AuthUser> {
  const existing = await db.prepare("SELECT u.id, u.email, u.display_name FROM auth_identities i JOIN users u ON u.id = i.user_id WHERE i.provider = 'google' AND i.subject = ?")
    .bind(subject).first<{ id: string; email: string; display_name: string | null }>();
  if (existing) {
    // A changed provider email requires deliberate account recovery; never silently reassign ownership.
    if (existing.email.trim().toLowerCase() !== email) throw new AuthError("identity_email_changed");
    return { id: existing.id, email, displayName: existing.display_name || email, fullName: existing.display_name };
  }
  const conflict = await db.prepare("SELECT id FROM users WHERE lower(trim(email)) = ? LIMIT 1").bind(email).first();
  if (conflict) throw new AuthError("account_link_required");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  // D1 batch is transactional: a duplicate identity/email race rolls back the new user too.
  await db.batch([
    db.prepare("INSERT INTO users (id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").bind(id, email, name, now, now),
    db.prepare("INSERT INTO auth_identities (provider, subject, user_id, created_at) VALUES ('google', ?, ?, ?)").bind(subject, id, now),
  ]);
  return { id, email, displayName: name || email, fullName: name };
}
