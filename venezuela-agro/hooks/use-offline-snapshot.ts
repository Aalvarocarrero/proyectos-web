"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
function validSnapshot<T>(value:unknown,initial:T):value is T {
 if(Array.isArray(initial))return Array.isArray(value);
 if(initial && typeof initial==="object")return !!value && typeof value==="object" && !Array.isArray(value) && Object.entries(initial).every(([key,entry])=>Array.isArray(entry)?Array.isArray((value as Record<string,unknown>)[key]):true);
 return typeof value===typeof initial;
}
function createOfflineStore<T>(initial:T,key:string) {
 let previous:string|null=null;
 let cached=initial;
 return {
  snapshot(){
   if(navigator.onLine)return initial;
   try {const raw=localStorage.getItem(key);if(raw!==previous){previous=raw;const parsed:unknown=raw?JSON.parse(raw):initial;cached=validSnapshot(parsed,initial)?parsed:initial;}}catch{cached=initial;}
   return cached;
  },
  subscribe(callback:()=>void){
   window.addEventListener("online",callback);window.addEventListener("offline",callback);window.addEventListener("storage",callback);
   return()=>{window.removeEventListener("online",callback);window.removeEventListener("offline",callback);window.removeEventListener("storage",callback);};
  },
 };
}
/** Browser-owned public snapshots use an external store; effects only persist data. */
export function useOfflineSnapshot<T>(initial:T,key:string,persist=true):T {
 const store=useMemo(()=>createOfflineStore(initial,key),[initial,key]);
 useEffect(()=>{if(persist&&navigator.onLine){try{localStorage.setItem(key,JSON.stringify(initial));}catch{}}},[initial,key,persist]);
 return useSyncExternalStore(store.subscribe,store.snapshot,()=>initial);
}
