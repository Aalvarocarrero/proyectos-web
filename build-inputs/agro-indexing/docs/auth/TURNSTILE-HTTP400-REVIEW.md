# Turnstile HTTP400 diagnostic refinement

Production e50dc78 returned the fixed code `provider_http_400` after a fresh online challenge at2026-10-15 11:39:44UTC. That establishes the provider HTTP status, not its cause. The earlier verifier returned before reading the documented failure envelope.

This patch accumulates at most16KiB of the provider response for JSON parsing, under the same8-second request deadline, and only maps exact documented error codes when `success` is the boolean `false`. It never exposes the body, raw error codes, tokens, secrets, hostname, cdata or exception messages. For non2xx malformed/unknown responses it retains the fixed HTTP status category. A `success:true` body with any non2xx status is always rejected. Valid login acceptance remains2xx + boolean success + exact apex hostname + action `login`; CSRF and session ownership are unchanged.

Examples: HTTP400 with `invalid-input-secret` becomes `secret_rejected`; `bad-request` becomes `request_rejected`. These are safe labels. A live result is still required before deciding whether a secret, request or external configuration needs correction. Do not rotate credentials, disable Turnstile or relax hostname/action checks speculatively.

The same release includes the separately approved account-free Los Morochos WhatsApp CTA at `/nosotros#contacto`, targeting+584264263601 with its existing contextual message. No message is sent until the visitor explicitly submits it in WhatsApp.

After deployment, use one fresh online challenge, submit once, and record only the visible fixed diagnostic and UTC time. Do not capture/share cookies, tokens, provider payloads or secret values. Administration remains disabled; no verified owner Google subject exists yet. Real dialog focus/pointer testing from the prior offline patch remains pending until login succeeds. The reported incognito9,190,312-byte browser estimate is one observed browsing state, not a universal download size.
