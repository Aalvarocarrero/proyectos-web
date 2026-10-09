import type {ChatGPTUser} from "@/app/chatgpt-auth";
/** Approved administrators. Call only with the server-authenticated Sites identity. */
const ADMIN_EMAILS=new Set(["alimentosparcelalosmorochos@gmail.com","alvarojuniorcarrerovasquez@gmail.com"]);
export function isAdminIdentity(user:ChatGPTUser|null|undefined):boolean {
 return !!user?.id && ADMIN_EMAILS.has(user.email.trim().toLowerCase());
}
