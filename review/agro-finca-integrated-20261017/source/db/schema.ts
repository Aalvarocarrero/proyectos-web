import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    phoneE164: text("phone_e164"),
    phoneVerifiedAt: text("phone_verified_at"),
    lastSeenAt: text("last_seen_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("idx_users_email").on(table.email)],
);

export const farms = sqliteTable(
  "farms",
  {
    revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    location: text("location"),
    areaSqM: integer("area_sq_m"),
    boundaryShape: text("boundary_shape").notNull().default("Irregular / polígono"),
    boundaryJson: text("boundary_json").notNull().default("{}"),
    objective: text("objective"),
    clientUpdatedAt: text("client_updated_at").notNull(),
    serverUpdatedAt: text("server_updated_at").notNull(),
    deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [index("idx_farms_owner").on(table.ownerId)],
);

export const farmRecords = sqliteTable(
  "farm_records",
  {
    revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    farmId: text("farm_id")
      .notNull()
      .references(() => farms.id),
    recordType: text("record_type").notNull(),
    category: text("category"),
    title: text("title").notNull(),
    dataJson: text("data_json").notNull(),
    clientUpdatedAt: text("client_updated_at").notNull(),
    serverUpdatedAt: text("server_updated_at").notNull(),
    deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    index("idx_farm_records_owner_type").on(table.ownerId, table.recordType),
    index("idx_farm_records_farm_type").on(table.farmId, table.recordType),
    index("idx_farm_records_category").on(table.category),
  ],
);

export const marketplaceListings = sqliteTable(
  "marketplace_listings",
  {
    revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id: text("id").primaryKey(),
    ownerId: text("owner_id"),
    sellerName: text("seller_name").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    priceCents: integer("price_cents"),
    currency: text("currency").notNull().default("USD"),
    location: text("location").notNull(),
    state: text("state").notNull().default(""),
    municipality: text("municipality").notNull().default(""),
    shortIntro: text("short_intro").notNull().default(""),
    photoContext: text("photo_context").notNull().default(""),
    saleFormat: text("sale_format").notNull().default("A convenir"),
    supplyUnit: text("supply_unit").notNull().default("unidad"),
    minimumOrder: text("minimum_order").notNull().default(""),
    buyerType: text("buyer_type").notNull().default("Personas y empresas"),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    imageAlt: text("image_alt").notNull().default(""),
    contact: text("contact"),
    imageKey: text("image_key"),
    status: text("status").notNull().default("pending"),
    clientUpdatedAt: text("client_updated_at").notNull(),
    serverUpdatedAt: text("server_updated_at").notNull(),
    deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    index("idx_listings_status_category").on(table.status, table.category),
    index("idx_listings_owner").on(table.ownerId),
    index("idx_listings_updated").on(table.serverUpdatedAt),
  ],
);

export const userConsents = sqliteTable(
  "user_consents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    policyVersion: text("policy_version").notNull(),
    essentialAccepted: integer("essential_accepted", { mode: "boolean" }).notNull().default(false),
    publicContentAccepted: integer("public_content_accepted", { mode: "boolean" }).notNull().default(false),
    securitySignalsAccepted: integer("security_signals_accepted", { mode: "boolean" }).notNull().default(false),
    acceptedAt: text("accepted_at").notNull(),
    revokedAt: text("revoked_at"),
  },
  (table) => [
    index("idx_user_consents_user").on(table.userId),
    uniqueIndex("idx_user_consents_user_version").on(table.userId, table.policyVersion),
  ],
);

export const trustedDevices = sqliteTable(
  "trusted_devices",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    tokenHash: text("token_hash").notNull(),
    label: text("label").notNull(),
    platform: text("platform"),
    timezone: text("timezone"),
    connectionClass: text("connection_class"),
    networkHintHash: text("network_hint_hash"),
    countryCode: text("country_code"),
    lastVerifiedAt: text("last_verified_at"),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    revokedAt: text("revoked_at"),
  },
  (table) => [
    index("idx_trusted_devices_user").on(table.userId),
    uniqueIndex("idx_trusted_devices_token").on(table.tokenHash),
  ],
);

export const passkeyCredentials = sqliteTable(
  "passkey_credentials",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    webauthnUserId: text("webauthn_user_id").notNull(),
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    deviceType: text("device_type").notNull(),
    backedUp: integer("backed_up", { mode: "boolean" }).notNull().default(false),
    transports: text("transports").notNull().default("[]"),
    createdAt: text("created_at").notNull(),
    lastUsedAt: text("last_used_at"),
  },
  (table) => [index("idx_passkeys_user").on(table.userId)],
);

export const securityChallenges = sqliteTable(
  "security_challenges",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    purpose: text("purpose").notNull(),
    challenge: text("challenge").notNull(),
    webauthnUserId: text("webauthn_user_id"),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    consumedAt: text("consumed_at"),
  },
  (table) => [index("idx_security_challenges_user_purpose").on(table.userId, table.purpose)],
);

export const professionals = sqliteTable(
  "professionals",
  {
    revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    profession: text("profession").notNull(),
    specialties: text("specialties").notNull(),
    state: text("state").notNull(),
    municipality: text("municipality").notNull().default(""),
    serviceMode: text("service_mode").notNull(),
    introduction: text("introduction").notNull(),
    contact: text("contact").notNull(),
    credentialNote: text("credential_note").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_professionals_status_state").on(table.status, table.state)],
);

export const projectProposals = sqliteTable(
  "project_proposals",
  {
    revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    sector: text("sector").notNull(),
    state: text("state").notNull(),
    summary: text("summary").notNull(),
    hasJson: text("has_json").notNull(),
    needsJson: text("needs_json").notNull(),
    impact: text("impact").notNull(),
    requestedSupport: text("requested_support").notNull(),
    contact: text("contact").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_projects_status_sector").on(table.status, table.sector)],
);

export const feedbackSubmissions = sqliteTable(
  "feedback_submissions",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id"),
    area: text("area").notNull(),
    role: text("role").notNull(),
    message: text("message").notNull(),
    contact: text("contact"),
    status: text("status").notNull().default("new"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_feedback_status_area").on(table.status, table.area)],
);

export const orderRequests = sqliteTable(
  "order_requests",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id"),
    customerName: text("customer_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    itemsJson: text("items_json").notNull(),
    note: text("note"),
    status: text("status").notNull().default("new"),
    clientUpdatedAt: text("client_updated_at").notNull(),
    serverUpdatedAt: text("server_updated_at").notNull(),
  },
  (table) => [
    index("idx_order_requests_status").on(table.status),
    index("idx_order_requests_owner").on(table.ownerId),
  ],
);

export const knowledgeArticles = sqliteTable(
  "knowledge_articles",
  {
    slug: text("slug").primaryKey(),
    category: text("category").notNull(),
    emoji: text("emoji").notNull().default("🌿"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    bodyJson: text("body_json").notNull(),
    keywords: text("keywords").notNull().default(""),
    readMinutes: integer("read_minutes").notNull().default(5),
    status: text("status").notNull().default("draft"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_knowledge_articles_status_updated").on(table.status, table.updatedAt),
  ],
);

export const syncReceipts = sqliteTable(
  "sync_receipts",
  {
    receiptStatus: text("receipt_status").notNull().default("accepted"),
    serverRevision: text("server_revision"),
    operationHash: text("operation_hash"),
    id: text("id").primaryKey(),
    ownerKey: text("owner_key").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_sync_receipts_owner").on(table.ownerKey),
    index("idx_sync_receipts_entity").on(table.entityType, table.entityId),
  ],
);

export const publicFarmProfiles=sqliteTable('public_farm_profiles',{
 revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),name:text('name').notNull(),state:text('state').notNull(),profileJson:text('profile_json').notNull(),status:text('status').notNull().default('pending'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[index('idx_public_farms_status_state').on(t.status,t.state),index('idx_public_farms_owner').on(t.ownerId)]);
export const communityPosts=sqliteTable('community_posts',{
 revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),farmId:text('farm_id').notNull(),body:text('body').notNull(),status:text('status').notNull().default('pending'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[index('idx_community_posts_status_date').on(t.status,t.createdAt),index('idx_community_posts_farm').on(t.farmId)]);
export const communityComments=sqliteTable('community_comments',{
 revision: text("revision").notNull().default(""), lastOperationId: text("last_operation_id"), lastOperationHash: text("last_operation_hash"),
    id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),postId:text('post_id').notNull(),authorName:text('author_name').notNull(),body:text('body').notNull(),status:text('status').notNull().default('pending'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[index('idx_community_comments_post_status').on(t.postId,t.status)]);
export const communityReactions=sqliteTable('community_reactions',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),postId:text('post_id').notNull(),liked:integer('liked',{mode:'boolean'}).notNull().default(true),updatedAt:text('updated_at').notNull(),
},t=>[index('idx_community_reactions_post').on(t.postId)]);

/** Moderated business directory. The owner identity is never a public field. */
export const companies = sqliteTable(
  "companies",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull().references(() => users.id),
    revision: text("revision").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    state: text("state").notNull(),
    municipality: text("municipality").notNull().default(""),
    description: text("description").notNull(),
    profileJson: text("profile_json").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  table => [
    index("idx_companies_status_category").on(table.status, table.category),
    index("idx_companies_status_state").on(table.status, table.state),
    index("idx_companies_owner").on(table.ownerId),
    index("idx_companies_updated").on(table.updatedAt),
  ],
);

// One independently versioned draft/public snapshot per managed website page.
export const websiteContent = sqliteTable("website_content", {
  id: text("id").primaryKey(),
  draftJson: text("draft_json").notNull(),
  publishedJson: text("published_json"),
  revision: text("revision").notNull(),
  updatedAt: text("updated_at").notNull(),
  publishedAt: text("published_at"),
});

// Portable authentication is additive: historical Sites users and ownership remain untouched.
export const authIdentities = sqliteTable("auth_identities", {
  provider: text("provider").notNull(),
  subject: text("subject").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("idx_auth_identity_subject").on(table.provider, table.subject), uniqueIndex("idx_auth_identity_user").on(table.provider, table.userId)]);

export const authSessions = sqliteTable("auth_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: integer("created_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("idx_auth_sessions_user").on(table.userId), index("idx_auth_sessions_expiry").on(table.expiresAt)]);

export const authTransactions = sqliteTable("auth_transactions", {
  stateHash: text("state_hash").primaryKey(),
  browserHash: text("browser_hash").notNull(),
  nonce: text("nonce").notNull(),
  verifier: text("verifier").notNull(),
  returnTo: text("return_to").notNull(),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("idx_auth_transactions_expiry").on(table.expiresAt)]);
