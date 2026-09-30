export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "https://immo360-web.vercel.app/api",
  DEV_BASE_URL:
    process.env.EXPO_PUBLIC_API_DEV_BASE_URL ||
    "https://immo360-web.vercel.app/api",
  TIMEOUT: 30000,
  USE_DEV: __DEV__ && !process.env.EXPO_PUBLIC_API_BASE_URL,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": "immo360-mobile",
    "x-app-id":  "immo360-mobile",
  },
} as const;


export const ENDPOINTS = {
  auth: {
    sync: "/auth/sync",
    me: "/auth/me",
    signOut: "/auth/sign-out",
  },
  users: {
    list: "/users",
    byId: (id: string) => `/users/${id}`,
    stats: (id: string) => `/users/${id}/stats`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  properties: {
    list: "/properties",
    byId: (id: string) => `/properties/${id}`,
    create: "/properties",
    update: (id: string) => `/properties/${id}`,
    delete: (id: string) => `/properties/${id}`,
    views: (id: string) => `/interactions?entityId=${id}&entityType=property&type=LIKE`,
    similar: (id: string) => `/properties/${id}/similar`,
    stats: (id: string) => `/properties/${id}/stats`,
  },
  organizations: {
    list: "/organizations",
    byId: (id: string) => `/organizations/${id}`,
    create: "/organizations",
    update: (id: string) => `/organizations/${id}`,
    delete: (id: string) => `/organizations/${id}`,
    members: (id: string) => `/organizations/${id}/members`,
    addMember: (id: string) => `/organizations/${id}/members`,
    updateMember: (orgId: string, memberId: string) =>
      `/organizations/${orgId}/members/${memberId}`,
    removeMember: (orgId: string, memberId: string) =>
      `/organizations/${orgId}/members/${memberId}`,
    stats: (id: string) => `/organizations/${id}/stats`,
    followers: (id: string) => `/organizations/${id}/followers`,
  },
  categories: {
    list: "/categories",
    byId: (id: string) => `/categories/${id}`,
    bySlug: (slug: string) => `/categories/slug/${slug}`,
    stats: (id: string) => `/categories/${id}/stats`,
  },
  locations: {
    list: "/locations",
    byId: (id: string) => `/locations/${id}`,
    byParent: (parentId: string) => `/locations/parent/${parentId}`,
    create: "/locations",
    stats: (id: string) => `/locations/${id}/stats`,
  },
  media: {
    list: "/media",
    byId: (id: string) => `/media/${id}`,
    entity: (entityType: string, entityId: string) =>
      `/media/entity/${entityType}/${entityId}`,
    create: "/media",
    upload: "/media/upload",
    update: (id: string) => `/media/${id}`,
    delete: (id: string) => `/media/${id}`,
    reorder: "/media/reorder",
  },
  interactions: {
    list: "/interactions",
    create: "/interactions",
    delete: (id: string) => `/interactions/${id}`,
  },
  conversations: {
    list: "/conversations",
    byId: (id: string) => `/conversations/${id}`,
    create: "/conversations",
    update: (id: string) => `/conversations/${id}`,
    messages: (id: string) => `/conversations/${id}/messages`,
    sendMessage: (id: string) => `/conversations/${id}/messages`,
    markRead: (id: string) => `/conversations/${id}/read`,
  },
  notifications: {
    list: "/notifications",
    markRead: "/notifications/read",
    fcmToken: "/notifications/fcm-token",
  },
  favorites: {
    list: "/favorites",
    toggle: "/favorites",
  },
  savedSearches: {
    list: "/saved-searches",
  },
  plans: {
    list: "/plans",
  },
  subscriptions: {
    list: "/subscriptions",
    create: "/subscriptions",
  },
  reports: {
    create: "/reports",
    list: "/reports",
  },
  stats: {
    global: "/stats",
  },
} as const;

export type EndpointPath = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];
