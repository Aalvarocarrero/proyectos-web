"use client";
import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { safeDirectoryReturn } from "@/lib/directory-filters";
const subscribe = () => () => {};

/** A new visit gets the directory; a detail visit keeps this tab's public filters. */
export function DirectoryReturnLink({href,children,className}:{href:string;children:ReactNode;className?:string}) {
  const target=useSyncExternalStore(subscribe,()=>{
    try { return safeDirectoryReturn(sessionStorage.getItem(`agro-directory-return:${href}`),href); }
    catch { return href; }
  },()=>href);
  return <Link href={target} className={className}>{children}</Link>;
}
