"use client";
import {PublicWorkspaceControls} from "@/components/public-workspace-controls";
import {usePathname} from "next/navigation";
import {OfflineSyncManager} from "@/components/offline-sync-manager";
import {OfflineWorkspaceGate} from "@/components/offline-workspace-gate";
import {IdeaInvitation} from "@/components/idea-invitation";
/** Practice mode never mounts services which can read or write a real workspace. */
export function AccountServices(){const path=usePathname();if(path==="/finca-demo"||path.startsWith("/finca-demo/")||path==="/finca-modelo"||path.startsWith("/finca-modelo/")||path==="/juego-finca"||path.startsWith("/juego-finca/"))return null;return <><OfflineSyncManager/><OfflineWorkspaceGate/><PublicWorkspaceControls><IdeaInvitation/></PublicWorkspaceControls></>;}
