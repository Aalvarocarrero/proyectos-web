import {isStandaloneAuth} from "@/lib/auth-paths";
import type {ChatGPTUser} from "@/app/chatgpt-auth";
/** Approved administrators. Call only with getChatGPTUser(), never request JSON or forwarded headers. */
const ADMIN_EMAILS=new Set(["alvarojuniorcarrerovasquez@gmail.com"]);
export function isAdminIdentity(user:ChatGPTUser|null|undefined):boolean {
 // Google grants are recomputed from the verified session + explicit email/subject binding.
 if (isStandaloneAuth()) return !!user?.id && user.googleOwnerAdmin === true;
 return !!user?.id && ADMIN_EMAILS.has(user.email.trim().toLowerCase());
}
