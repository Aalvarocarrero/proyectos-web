import { z } from "zod";

export const OFFLINE_PUBLIC_KINDS = ["marketplace", "professional", "project", "farm", "post"] as const;
export const OFFLINE_PUBLIC_LIMIT_PER_KIND = 100;
export const OFFLINE_PUBLIC_MAX_BYTES = 2_000_000;
export type OfflinePublicKind = typeof OFFLINE_PUBLIC_KINDS[number];

/** Only these existing public routes can be opened from a downloaded snapshot. */
export function offlinePublicHref(kind: OfflinePublicKind, id: string): string {
  const path = {
    marketplace: "/marketplace/", professional: "/profesionales/", project: "/proyectos",
    farm: "/fincas/", post: "/red/",
  }[kind];
  return kind === "project" ? path : path + encodeURIComponent(id);
}

const itemSchema = z.object({
  kind: z.enum(OFFLINE_PUBLIC_KINDS),
  id: z.string().min(1).max(160).regex(/^[a-zA-Z0-9_-]+$/),
  title: z.string().max(180),
  summary: z.string().max(2000),
  location: z.string().max(180),
  category: z.string().max(500),
  href: z.string().max(512),
  updatedAt: z.string().max(40),
}).strict().refine((item) => item.href === offlinePublicHref(item.kind, item.id), {
  message: "The snapshot link must reference its matching public route.", path: ["href"],
});

export const offlinePublicSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime({ offset: true }),
  items: z.array(itemSchema).max(OFFLINE_PUBLIC_KINDS.length * OFFLINE_PUBLIC_LIMIT_PER_KIND),
  truncatedKinds: z.array(z.enum(OFFLINE_PUBLIC_KINDS)).max(OFFLINE_PUBLIC_KINDS.length),
}).strict().superRefine((snapshot, ctx) => {
  if (new TextEncoder().encode(JSON.stringify(snapshot)).byteLength > OFFLINE_PUBLIC_MAX_BYTES) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "The public snapshot exceeds the download size limit." });
  }
  if (new Set(snapshot.truncatedKinds).size !== snapshot.truncatedKinds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["truncatedKinds"], message: "Duplicate content kinds." });
  }
  const seen = new Set<string>();
  for (const [index, item] of snapshot.items.entries()) {
    const key = `${item.kind}:${item.id}`;
    if (seen.has(key)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["items", index], message: "Duplicate public item." });
    seen.add(key);
  }
  for (const kind of OFFLINE_PUBLIC_KINDS) {
    if (snapshot.items.filter((item) => item.kind === kind).length > OFFLINE_PUBLIC_LIMIT_PER_KIND) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["items"], message: "Too many items in a content kind." });
    }
  }
});

export type OfflinePublicItem = z.infer<typeof itemSchema>;
export type OfflinePublicSnapshot = z.infer<typeof offlinePublicSnapshotSchema>;
export function parseOfflinePublicSnapshot(input: unknown): OfflinePublicSnapshot {
  return offlinePublicSnapshotSchema.parse(input);
}
