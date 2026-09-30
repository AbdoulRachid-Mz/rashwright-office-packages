// @/db/schema.ts
import {
  pgTable,
  pgEnum,
  uuid,
  decimal,
  varchar,
  boolean,
  index,
  unique,
  text,
  jsonb,
  timestamp,
  integer,
  foreignKey,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";

// ─────────────────────────────────────────────
// APP SETTINGS TABLE
// ─────────────────────────────────────────────
export const appSettings = pgTable(
  "app_settings",
  {
    key: varchar("key", { length: 100 }).primaryKey(),
    value: jsonb("value").notNull(),
    description: text("description"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("app_settings_key_idx").on(table.key),
  ],
);
// PostgreSQL Enums
export const organizationTypeEnum = pgEnum("organization_type", [
  "PERSONAL",
  "AGENCY",
  "PROMOTER",
  "DEVELOPER",
  "COMPANY",
]);

export const organizationStatusEnum = pgEnum("organization_status", [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "OWNER",
  "ADMIN",
  "AGENT",
  "EDITOR",
  "VIEWER",
]);

export const propertyPurposeEnum = pgEnum("property_purpose", ["SALE", "RENT"]);

export const propertyStatusEnum = pgEnum("property_status", [
  "DRAFT",
  "PUBLISHED",
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "RENTED",
  "ARCHIVED",
]);

export const mediaEntityTypeEnum = pgEnum("media_entity_type", [
  "PROPERTY",
  "USER",
  "ORGANIZATION",
]);

export const mediaTypeEnum = pgEnum("media_type", [
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "TEXT",
  "IMAGE",
  "DOCUMENT",
  "OFFER",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "MESSAGE",
  "FAVORITE",
  "PROPERTY_UPDATE",
  "SYSTEM",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "REVIEWED",
  "RESOLVED",
  "DISMISSED",
]);

export const reportEntityTypeEnum = pgEnum("report_entity_type", [
  "PROPERTY",
  "USER",
  "ORGANIZATION",
  "MESSAGE",
]);

export const entityTypeEnum = pgEnum("entity_type", [
  "PROPERTY",
  "USER",
  "ORGANIZATION",
   "MESSAGE",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "CANCELED",
  "EXPIRED",
  "PENDING",
]);

export const planTypeEnum = pgEnum("plan_type", ["FREE", "PRO", "BUSINESS"]);

export const planPeriodEnum = pgEnum("plan_period", [
  "MONTHLY",
  "YEARLY",
  "LIFETIME",
]);

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "USER",
  "MODERATOR",
  "ANONYMOUS",
]);

export const localeEnum = pgEnum("locale", [
  "fr",
  "en",
  "ha",
  "ar",
]);

// Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: varchar("auth_id", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    avatar: text("avatar"),
    bio: text("bio"),
    language: localeEnum("language").default("fr"),
    city: varchar("city", { length: 255 }),
    isVerified: boolean("is_verified").default(false),
    role: userRoleEnum("role").notNull().default("USER"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    preferences: jsonb("preferences").default({}),
  },
  (table) => [
    unique("users_auth_id_unique").on(table.authId),
    index("users_email_idx").on(table.email),
    index("users_phone_idx").on(table.phone),
    index("users_city_idx").on(table.city),
    index("users_role_idx").on(table.role),
  ],
);

// Organizations Table
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    logo: text("logo"),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    address: text("address"),
    type: organizationTypeEnum("type").notNull().default("PERSONAL"),
    status: organizationStatusEnum("status").default("PENDING"),
    verified: boolean("verified").default(false),
    video: text("video"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("organizations_slug_unique").on(table.slug),
    unique("organizations_name_unique").on(table.name),
    index("organizations_type_idx").on(table.type),
    index("organizations_verified_idx").on(table.verified),
    index("organizations_status_idx").on(table.status),
  ],
);

// Organization Members Table
export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("VIEWER"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("organization_members_user_org_unique").on(
      table.userId,
      table.organizationId,
    ),
    index("organization_members_org_id_idx").on(table.organizationId),
    index("organization_members_user_id_idx").on(table.userId),
  ],
);

// Categories Table
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    icon: varchar("icon", { length: 100 }),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("categories_active_idx").on(table.active)],
);

// Locations Table
export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    parentId: uuid("parent_id"),

    country: varchar("country", { length: 100 }),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }),
    name: varchar("name", { length: 100 }),
    district: varchar("district", { length: 100 }),
    quarter: varchar("quarter", { length: 100 }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "locations_parent_fk",
    }).onDelete("set null"),
  ],
);
// Properties Table
export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    purpose: propertyPurposeEnum("purpose").notNull().default("SALE"),
    price: decimal("price", { precision: 15, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("XOF"),
    surface: decimal("surface", { precision: 10, scale: 2 }),
    rooms: integer("rooms"),
    bathrooms: integer("bathrooms"),
    viewsCount: integer("views_count").default(0),
    favoritesCount: integer("favorites_count").default(0),
    coverMediaId: uuid("cover_media_id"),
    floors: integer("floors"),
    features: jsonb("features").$type<string[]>(),
    attributes: jsonb("attributes").$type<Record<string, unknown>>(),
    video: text("video"),
    status: propertyStatusEnum("status").default("DRAFT"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    unique("properties_title_org_unique").on(table.title, table.organizationId),
    index("properties_org_id_idx").on(table.organizationId),
    index("properties_category_id_idx").on(table.categoryId),
    index("properties_location_id_idx").on(table.locationId),
    index("properties_purpose_idx").on(table.purpose),
    index("properties_price_idx").on(table.price),
    index("properties_status_idx").on(table.status),
    index("properties_title_description_search_idx").using(
      "gin",
      sql`to_tsvector('french', ${table.title} || ' ' || coalesce(${table.description}, ''))`,
    ),
    index("properties_created_at_idx").on(table.createdAt),
  ],
);

// Media Table
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: mediaEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    url: text("url").notNull(),
    type: mediaTypeEnum("type").default("IMAGE"),
    position: integer("position").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("media_entity_idx").on(table.entityType, table.entityId),
    index("media_position_idx").on(table.position),
  ],
);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "LIKE",
  "BOOKMARK",
  "FOLLOW",
  "SHARE",
]);

// Nouvelle table interactions (remplace/étend favorites)
export const interactions = pgTable(
  "interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    type: interactionTypeEnum("type").notNull().default("LIKE"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}), // Pour stocker des infos supplémentaires
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Une seule interaction par (user, entity, type)
    unique("interactions_user_entity_type_unique").on(
      table.userId,
      table.entityId,
      table.entityType,
      table.type
    ),
    index("interactions_user_id_idx").on(table.userId),
    index("interactions_entity_idx").on(table.entityType, table.entityId),
    index("interactions_type_idx").on(table.type),
    index("interactions_created_at_idx").on(table.createdAt),
  ],
);

// Relations pour interactions
export const interactionsRelations = relations(interactions, ({ one }) => ({
  user: one(users, {
    fields: [interactions.userId],
    references: [users.id],
  }),
}));

// Favorites Table
export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("favorites_user_property_unique").on(table.userId, table.propertyId),
    index("favorites_user_id_idx").on(table.userId),
    index("favorites_property_id_idx").on(table.propertyId),
  ],
);

// Conversations Table
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id").references(() => properties.id, {
      onDelete: "set null",
    }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: conversationStatusEnum("status").default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("conversations_property_id_idx").on(table.propertyId),
    index("conversations_buyer_id_idx").on(table.buyerId),
    index("conversations_seller_id_idx").on(table.sellerId),
    index("conversations_status_idx").on(table.status),
    index("conversations_participants_idx").on(table.buyerId, table.sellerId),
  ],
);

// Messages Table
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Support des réponses / threads (auto-référence)
    parentId: uuid("parent_id").references((): AnyPgColumn => messages.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: messageTypeEnum("type").notNull().default("TEXT"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    index("messages_sender_id_idx").on(table.senderId),
    index("messages_parent_id_idx").on(table.parentId),
    index("messages_read_idx").on(table.read),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);

// Notifications Table
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    referenceId: uuid("reference_id"),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("notifications_user_entity_idx").on(
      table.userId,
      table.entityType,
      table.entityId,
    ),
    index("notifications_user_read_idx").on(table.userId, table.read),
    index("notifications_type_idx").on(table.type),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
);

// Saved Searches Table
export const savedSearches = pgTable(
  "saved_searches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    filters: jsonb("filters").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("saved_searches_user_id_idx").on(table.userId),
    index("saved_searches_filters_idx").using("gin", table.filters),
  ],
);

// Reports Table
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: reportEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("reports_reporter_id_idx").on(table.reporterId),
    index("reports_entity_idx").on(table.entityType, table.entityId),
    index("reports_status_idx").on(table.status),
  ],
);

// Plans Table
export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("XOF"),
    type: planTypeEnum("type").default("FREE"),
    period: planPeriodEnum("period").default("MONTHLY"),
    limits: jsonb("limits").$type<Record<string, unknown>>().notNull(),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("plans_active_idx").on(table.active)],
);

// Subscriptions Table
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").default("PENDING"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("subscriptions_org_id_idx").on(table.organizationId),
    index("subscriptions_plan_id_idx").on(table.planId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_dates_idx").on(table.startDate, table.endDate),
  ],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
  favorites: many(favorites),
  buyerConversations: many(conversations, { relationName: "buyer" }),
  sellerConversations: many(conversations, { relationName: "seller" }),
  sentMessages: many(messages),
  notifications: many(notifications),
  savedSearches: many(savedSearches),
  reports: many(reports),
  interactions: many(interactions),
}));

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    members: many(organizationMembers),
    properties: many(properties),
    conversations: many(conversations, { relationName: "organization" }),
    interactions: many(interactions),
    subscription: one(subscriptions, {
      fields: [organizations.id],
      references: [subscriptions.organizationId],
    }),
  }),
);

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  properties: many(properties),
}));

export const locationsRelations = relations(locations, ({ many, one }) => ({
  children: many(locations, {
    relationName: "parent",
  }),
  parent: one(locations, {
    fields: [locations.parentId],
    references: [locations.id],
    relationName: "parent",
  }),
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [properties.organizationId],
    references: [organizations.id],
  }),
  category: one(categories, {
    fields: [properties.categoryId],
    references: [categories.id],
  }),
  location: one(locations, {
    fields: [properties.locationId],
    references: [locations.id],
  }),
  media: many(media, {
    relationName: "propertyMedia",
  }),
  favorites: many(favorites),
  interactions: many(interactions),
  conversations: many(conversations, { relationName: "property" }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [conversations.propertyId],
      references: [properties.id],
    }),
    buyer: one(users, {
      fields: [conversations.buyerId],
      references: [users.id],
      relationName: "buyer",
    }),
    seller: one(users, {
      fields: [conversations.sellerId],
      references: [users.id],
      relationName: "seller",
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  // Thread / Réponses
  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
    relationName: "replies",
  }),
  replies: many(messages, { relationName: "replies" }),
  // Interactions (likes, etc.)
  interactions: many(interactions),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, {
    fields: [savedSearches.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

// TypeScript Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export type Interaction = typeof interactions.$inferSelect;
export type NewInteraction = typeof interactions.$inferInsert;
export type InteractionType = (typeof interactionTypeEnum.enumValues)[number];

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;

// Known app settings keys
export type AppSettingsKey =
  | "individual_property_limit"
  | "free_agency_property_limit"
  | "max_organizations_per_user"
  | "is_maintenance"
  | "app_name"
  | "app_version"
  | "app_email"
  | "app_phone"
  | "app_country"
  | "app_regions"
  | "app_address"
  | "app_description";

// enums type
export type PropertyStatus = (typeof propertyStatusEnum.enumValues)[number];
export type OrganizationType = (typeof organizationTypeEnum.enumValues)[number];
export type OrganizationStatus =
  (typeof organizationStatusEnum.enumValues)[number];
export type MemberRole = (typeof memberRoleEnum.enumValues)[number];
export type PropertyPurpose = (typeof propertyPurposeEnum.enumValues)[number];
export type MediaEntityType = (typeof mediaEntityTypeEnum.enumValues)[number];
export type MediaType = (typeof mediaTypeEnum.enumValues)[number];
export type ConversationStatus =
  (typeof conversationStatusEnum.enumValues)[number];
export type MessageType = (typeof messageTypeEnum.enumValues)[number];
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type ReportStatus = (typeof reportStatusEnum.enumValues)[number];
export type ReportEntityType = (typeof reportEntityTypeEnum.enumValues)[number];
export type EntityType = (typeof entityTypeEnum.enumValues)[number];
export type SubscriptionStatus =
  (typeof subscriptionStatusEnum.enumValues)[number];
export type PlanType = (typeof planTypeEnum.enumValues)[number];
export type PlanPeriod = (typeof planPeriodEnum.enumValues)[number];
export type UserRole = (typeof userRoleEnum.enumValues)[number];

// mini entities
export interface MiniUser {
  id: string;
  fullName: string;
  avatar: string | null;
  role: UserRole;
}

export interface MiniOrganization {
  id: string;
  name: string;
  logo: string | null;
  verified: boolean;
  userId?: string | null;
}

export interface MiniCategory {
  id: string;
  name: string;
  slug: string;
}

export interface MiniLocation {
  id: string;
  city: string | null;
  district: string | null;
  quarter: string | null;
}

export interface MiniProperty {
  id: string;
  title: string;
  slug: string;
  price: string | null;
  status: PropertyStatus;
}

export interface MiniMedia {
  id: string;
  url: string;
  entityType: MediaEntityType;
  entity: string;
  type: MediaType;
}

export interface MiniFavorite {
  id: string;
  userId: string;
  propertyId: string;
}

export interface MiniInteraction {
  id: string;
  userId: string;
  entityId: string;
  entityType: EntityType;
  type: InteractionType;
  createdAt: Date;
}



export interface MiniConversation {
  id: string;
  propertyId: string;
  buyer: string;
  seller: string;
  status: ConversationStatus;
}

export interface MiniMessage {
  id: string;
  conversationId: string;
  userId: string;
  type: MessageType;
  content: string;
  parentId: string | null;
  read: boolean;
  createdAt: Date;
}

// Breakdown des interactions par type pour un message
export interface MessageStats {
  repliesCount: number;
  interactions: InteractionsBreakdown;
}

export interface MiniNotification {
  id: string;
  userId: string;
  type: NotificationType;
  content: string;
  createdAt: Date;
}

export interface MiniSavedSearch {
  id: string;
  userId: string;
  entityType: ReportEntityType;
  entity: string;
  status: ReportStatus;
}

export interface MiniReport {
  id: string;
  reporterId: string;
  entityType: ReportEntityType;
  status: string;
  createdAt: Date;
}

export interface MiniPlan {
  id: string;
  type: PlanType;
  period: PlanPeriod;
  active: boolean;
  price: number;
}

export interface MiniSubscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
}

// entites with relations

export interface UserWithMiniRelations extends User {
  organizations?: MiniOrganization[];
  categories?: MiniCategory[];
  locations?: MiniLocation[];
  properties?: MiniProperty[];
  media?: MiniMedia[];
  favorites?: MiniFavorite[];
  interactions?: MiniInteraction[];
  conversations?: MiniConversation[];
  messages?: MiniMessage[];
  notifications?: MiniNotification[];
  savedSearches?: MiniSavedSearch[];
  reports?: MiniReport[];
  plans?: MiniPlan[];
  subscriptions?: MiniSubscription[];
  stats?: UserStats;
}

export interface OrganizationWithMiniRelations extends MiniOrganization {
  users?: MiniUser[];
  stats?: OrganizationStats;
}

export interface CategoryWithMiniRelations extends MiniCategory {
  properties?: MiniProperty[];
  stats?: CategoryStats;
}

export interface LocationWithMiniRelations extends MiniLocation {
  properties?: MiniProperty[];
  stats?: LocationStats;
}

export interface PropertyWithMiniRelations extends MiniProperty {
  media?: MiniMedia[];
  favorites?: MiniFavorite[];
  interactions?: MiniInteraction[];
  stats?: PropertyStats;
}

export interface ConversationWithMiniRelations extends Conversation {
  buyer?: User;
  seller?: User;
}

// Breakdown des interactions par type
export interface InteractionsBreakdown {
  LIKE: number;
  BOOKMARK: number;
  FOLLOW: number;
  SHARE: number;
  total: number;
}


// interactions with relations
export interface InteractionWithMiniRelations extends MiniInteraction {
  user?: MiniUser;
  entity?: MiniProperty | MiniOrganization | MiniUser;
}


// entities stats
export interface UserStats {
  // General user activity
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  draftProperties: number;
  archivedProperties: number;

  // Favorites (legacy - pour compatibilité mobile)
  totalFavorites: number;

  // Interactions (nouveau système - source de vérité)
  interactions: InteractionsBreakdown;

  totalConversations: number;
  activeConversations: number;
  unreadMessages: number;
  totalMessages: number;
  unreadNotifications: number;
  totalNotifications: number;

  // Saved items & reports
  totalSavedSearches: number;
  totalReports: number;
  pendingReports: number;
}

export interface PropertyStats {
  totalViews: number;
  // Favorites (legacy - pour compatibilité mobile)
  totalFavorites: number;
  // Interactions (nouveau système - source de vérité)
  interactions: InteractionsBreakdown;
}

export interface OrganizationStats {
  // Members
  totalMembers: number;
  membersByRole: Record<string, number>;

  // Properties
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  draftProperties: number;
  archivedProperties: number;
  propertiesByCategory: Record<string, number>;
  propertiesByPurpose: Record<string, number>;
  totalPropertyViews: number;
  // Favorites (legacy - pour compatibilité mobile)
  totalPropertyFavorites: number;
  // Interactions (nouveau système - source de vérité)
  totalPropertyInteractions: InteractionsBreakdown;
  totalFollowers: number;

  // Media
  totalMedia: number;
  mediaByType: Record<string, number>;

  // Conversations & messages
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  unreadMessages: number;

  // Subscription
  currentPlan: string | null;
  subscriptionStatus: string;
  daysUntilExpiration: number | null;

  // Reports
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}

export interface CategoryStats {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalViews: number;
  // Favorites (legacy - pour compatibilité mobile)
  totalFavorites: number;
  // Interactions (nouveau système)
  totalInteractions?: InteractionsBreakdown;
  propertiesByPurpose?: Record<string, number>;
}

export interface LocationStats {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalViews: number;
  // Favorites (legacy - pour compatibilité mobile)
  totalFavorites?: number;
  // Interactions (nouveau système)
  totalInteractions?: InteractionsBreakdown;
  childLocationsCount?: number;
  propertiesByCategory?: Record<string, number>;
}

export interface PlatformStats {
  // Users
  totalUsers: number;
  activeUsers: number;
  newUsersLast30Days: number;
  verifiedUsers: number;

  // Organizations
  totalOrganizations: number;
  activeOrganizations: number;
  verifiedOrganizations: number;
  newOrganizationsLast30Days: number;
  organizationsByType?: Record<string, number>;

  // Properties
  totalProperties: number;
  activeProperties: number;
  soldPropertiesLast30Days: number;
  rentedPropertiesLast30Days: number;
  propertiesByCategory?: Record<string, number>;
  propertiesByLocation?: Record<string, number>;
  propertiesByPurpose?: Record<string, number>;
  totalPropertyViews: number;

  // Subscriptions
  activeSubscriptions: number;
  totalRevenue: number;
  revenueLast30Days: number;
  subscriptionsByPlan?: Record<string, number>;

  // Activity
  totalConversations: number;
  newConversationsLast30Days: number;
  totalMessages: number;
  newMessagesLast30Days: number;
  // Favorites (legacy - pour compatibilité mobile)
  totalFavorites: number;
  newFavoritesLast30Days: number;
  // Interactions (nouveau système)
  totalInteractions?: InteractionsBreakdown;

  // Moderation
  totalReports: number;
  pendingReports: number;
  resolvedReportsLast30Days: number;
}

export interface DashboardStats {
  properties: number;

  activeProperties: number;

  soldProperties: number;

  rentedProperties: number;

  // Favorites (legacy - pour compatibilité mobile)
  favorites: number;

  // Interactions (nouveau système)
  interactions: InteractionsBreakdown;

  conversations: number;

  unreadMessages: number;
}
