import { l as usePathname } from "../index.js";
/** Keep invitations out of focused workspaces and the isolated learning preview. */
function PublicWorkspaceControls({ children }) {
	const pathname = usePathname();
	if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
	if (pathname === "/juego-finca" || pathname.startsWith("/juego-finca/")) return null;
	return children;
}
export { PublicWorkspaceControls };
