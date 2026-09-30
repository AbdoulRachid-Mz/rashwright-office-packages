import type {
  Category,
  NewCategory,
  Notification as DbNotification,
  NewNotification,
  Organization,
  NewOrganization,
  PlatformStats,
  Subscription,
  NewSubscription,
  User,
  NewUser,
} from "@/db/schema";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> extends PaginationMeta {
  items: T[];
}

export interface CategoriesListPayload {
  categories: Category[];
}

export interface CategoryPayload {
  category: Category;
}

export interface NotificationsListPayload {
  notifications: DbNotification[];
}

export interface NotificationPayload {
  notification: DbNotification;
}

export interface SubscriptionsListPayload {
  subscriptions: Subscription[];
}

export interface SubscriptionPayload {
  subscription: Subscription;
}

export interface OrganizationsListPayload {
  organizations: Organization[];
}

export interface OrganizationPayload {
  organization: Organization;
}

export interface UsersListPayload {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserPayload {
  user: User;
}

export interface DeletePayload {
  message: string;
}

export type CreateCategoryInput = NewCategory;
export type UpdateCategoryInput = Partial<NewCategory>;

export type CreateNotificationInput = NewNotification;
export type UpdateNotificationInput = Partial<Pick<DbNotification, "read" | "title" | "message">>;

export type CreateSubscriptionInput = NewSubscription;
export type UpdateSubscriptionInput = Partial<NewSubscription>;

export type CreateOrganizationInput = NewOrganization;
export type UpdateOrganizationInput = Partial<NewOrganization>;

export type CreateUserInput = NewUser;
export type UpdateUserInput = Partial<NewUser>;

export interface AdminStatsPayload extends PlatformStats {}
