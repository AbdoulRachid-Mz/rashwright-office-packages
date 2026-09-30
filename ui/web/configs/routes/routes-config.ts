// constants/routes-config.ts
import { UserRole } from "@/db/schema";

export interface RouteConfig {
  path: string;
  name: string;
  breadcrumbs?: boolean;
  footer?: boolean;
  navigation?: boolean;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireRole?: UserRole;
  excludeLayout?: boolean;
  description?: string;
  icon?: string;
  menu?: boolean;
  menuOrder?: number;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isWildcard?: boolean;
  parentPath?: string;
  excludeFromParent?: boolean;
  styleGroup?: string;
}

export interface UserRoles {
  isAuthenticated: boolean;
  role?: UserRole;
  isAdmin?: boolean;
  displayName?: string;
  email?: string | null;
}

// Configuration principale avec héritage
export const ROUTE_CONFIG: RouteConfig[] = [
  {
    path: "/**",
    name: "Default",
    breadcrumbs: true,
    footer: true,
    navigation: true,
    excludeLayout: false,
    menu: false,
    isWildcard: true,
    description: "Configuration par défaut",
  },
  {
    path: "/auth/**",
    name: "Authentification",
    excludeLayout: true,
    requireAuth: false,
    styleGroup: "auth",
    isWildcard: true,
    description: "Routes d'authentification",
  },
  {
    path: "/auth/sign-in",
    name: "Connexion",
    parentPath: "/auth/**",
    description: "Connectez-vous à votre compte",
    metadata: {
      title: "Connexion - Immo360",
      description: "Connectez-vous à votre compte Immo360",
    },
  },
  {
    path: "/auth/sign-up",
    name: "Inscription",
    parentPath: "/auth/**",
    description: "Créez votre compte",
    metadata: {
      title: "Inscription - Immo360",
      description: "Créez votre compte sur Immo360",
    },
  },
  {
    path: "/auth/forgot-password",
    name: "Mot de passe oublié",
    parentPath: "/auth/**",
    description: "Réinitialisez votre mot de passe",
  },
  {
    path: "/auth/reset-password",
    name: "Réinitialisation mot de passe",
    parentPath: "/auth/**",
    description: "Réinitialisez votre mot de passe",
  },
  {
    path: "/ad/**",
    name: "Administration",
    breadcrumbs: false,
    footer: false,
    navigation: false,
    requireAuth: true,
    requireAdmin: true,
    excludeLayout: true,
    styleGroup: "admin",
    isWildcard: true,
    description: "Routes d'administration",
  },
  {
    path: "/ad",
    name: "Tableau de bord",
    parentPath: "/ad/**",
    menu: false,
    requireAuth: true,
    requireAdmin: true,
  },
  {
    path: "/ad/users",
    name: "Utilisateurs",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 1,
  },
  {
    path: "/ad/organizations",
    name: "Organisations",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 2,
  },
  {
    path: "/ad/properties",
    name: "Propriétés",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 3,
  },
  {
    path: "/ad/categories",
    name: "Catégories",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 4,
  },
  {
    path: "/ad/locations",
    name: "Localisations",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 5,
  },
  {
    path: "/ad/reports",
    name: "Signalements",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 6,
  },
  {
    path: "/ad/subscriptions",
    name: "Abonnements",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 7,
  },
  {
    path: "/ad/plans",
    name: "Plans",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 8,
  },
  {
    path: "/ad/settings",
    name: "Paramètres",
    parentPath: "/ad/**",
    menu: true,
    menuOrder: 9,
  },
  {
    path: "/",
    name: "Accueil",
    breadcrumbs: true,
    footer: true,
    navigation: true,
    menu: true,
    menuOrder: 1,
    description: "Page d'accueil de Immo360",
    metadata: {
      title: "Immo360 - Accueil",
      description: "Trouvez votre propriété idéale sur Immo360",
      keywords: ["immobilier", "propriété", "location", "vente"],
    },
  },
  {
    path: "/properties",
    name: "Propriétés",
    breadcrumbs: true,
    footer: true,
    navigation: true,
    menu: true,
    menuOrder: 2,
    description: "Liste des propriétés",
  },
  {
    path: "/properties/*",
    name: "Détails Propriété",
    breadcrumbs: true,
    footer: true,
    navigation: false,
    isWildcard: true,
    description: "Détails d'une propriété",
  },
  {
    path: "/organizations/[id]/dashboard",
    name: "Dashboard Organisation",
    breadcrumbs: true,
    footer: false,
    navigation: false,
    isWildcard: true,
    description: "Dashboard d'une organisation",
  },
  {
    path: "/organizations/[id]/dashboard/**",
    name: "Dashboard Organisation",
    breadcrumbs: true,
    footer: false,
    navigation: false,
    isWildcard: true,
    description: "Dashboard d'une organisation",
  },
  {
    path: "/maintenance",
    name: "Maintenance",
    excludeLayout: true,
  },
  {
    path: "/404",
    name: "Page non trouvée",
    excludeLayout: true,
  },
  {
    path: "/500",
    name: "Erreur serveur",
    excludeLayout: true,
  },
];

const parseRoutePattern = (pattern: string): RegExp => {
  let regexPattern = pattern;
  regexPattern = regexPattern.replace(/\/\*\*/g, "(.*)?");
  regexPattern = regexPattern.replace(/\*/g, "([^/]+)");
  regexPattern = regexPattern.replace(/\[[^\]]+\]/g, "([^/]+)");
  regexPattern = regexPattern.replace(/\//g, "\\/");
  return new RegExp("^" + regexPattern + "$");
};

const matchesPattern = (pathname: string, pattern: string): boolean => {
  if (pattern === pathname) return true;
  const regex = parseRoutePattern(pattern);
  return regex.test(pathname);
};

export const findApplicableConfigs = (pathname: string): RouteConfig[] => {
  const applicableConfigs: RouteConfig[] = [];
  for (const config of ROUTE_CONFIG) {
    if (matchesPattern(pathname, config.path)) {
      applicableConfigs.push(config);
    }
  }
  if (applicableConfigs.length === 0) {
    const defaultConfig = ROUTE_CONFIG.find((c) => c.path === "/**");
    if (defaultConfig) applicableConfigs.push(defaultConfig);
  }
  applicableConfigs.sort((a, b) => {
    const aScore = (a.path.match(/\[|\*+/g) || []).length;
    const bScore = (b.path.match(/\[|\*+/g) || []).length;
    if (aScore !== bScore) return aScore - bScore;
    return b.path.length - a.path.length;
  });
  return applicableConfigs;
};

export const mergeRouteConfigs = (configs: RouteConfig[]): RouteConfig => {
  if (configs.length === 0) {
    return {
      path: "",
      name: "Unknown",
      breadcrumbs: true,
      footer: true,
      navigation: true,
      excludeLayout: false,
      menu: false,
    };
  }
  const merged: RouteConfig = { ...configs[0] };
  for (let i = 1; i < configs.length; i++) {
    const parent = configs[i];
    Object.keys(parent).forEach((key) => {
      if (
        key !== "path" &&
        key !== "parentPath" &&
        key !== "isWildcard" &&
        key !== "styleGroup" &&
        (merged[key as keyof RouteConfig] === undefined ||
          merged[key as keyof RouteConfig] === null ||
          merged[key as keyof RouteConfig] === false)
      ) {
        (merged as any)[key] = parent[key as keyof RouteConfig];
      }
    });
  }
  if (merged.parentPath) {
    const parentConfig = ROUTE_CONFIG.find((c) => c.path === merged.parentPath);
    if (parentConfig && !merged.excludeFromParent) {
      Object.keys(parentConfig).forEach((key) => {
        if (
          key !== "path" &&
          key !== "parentPath" &&
          key !== "isWildcard" &&
          key !== "styleGroup" &&
          (merged[key as keyof RouteConfig] === undefined ||
            merged[key as keyof RouteConfig] === null ||
            merged[key as keyof RouteConfig] === false)
        ) {
          (merged as any)[key] = parentConfig[key as keyof RouteConfig];
        }
      });
    }
  }
  return merged;
};

export const findRouteConfig = (pathname: string): RouteConfig => {
  const applicableConfigs = findApplicableConfigs(pathname);
  return mergeRouteConfigs(applicableConfigs);
};

export const canAccessRoute = (
  pathname: string,
  user: UserRoles | null,
): {
  hasAccess: boolean;
  requiresAuth: boolean;
  requiresAdmin: boolean;
  redirectTo?: string;
} => {
  const config = findRouteConfig(pathname);
  const requiresAuth = config.requireAuth || config.requireAdmin || false;
  const requiresAdmin = config.requireAdmin || false;

  if (requiresAdmin && (!user?.isAuthenticated || !user.isAdmin)) {
    return {
      hasAccess: false,
      requiresAuth,
      requiresAdmin,
      redirectTo: "/",
    };
  }
  if (requiresAuth && !user?.isAuthenticated) {
    return {
      hasAccess: false,
      requiresAuth,
      requiresAdmin,
      redirectTo: "/auth/sign-in",
    };
  }
  return {
    hasAccess: true,
    requiresAuth,
    requiresAdmin,
  };
};

export const getLayoutOptions = (
  pathname: string,
): Omit<
  RouteConfig,
  | "path"
  | "name"
  | "requireAuth"
  | "requireAdmin"
  | "description"
  | "metadata"
  | "parentPath"
  | "isWildcard"
  | "styleGroup"
  | "excludeFromParent"
> => {
  const config = findRouteConfig(pathname);
  const {
    path,
    name,
    requireAuth,
    requireAdmin,
    description,
    metadata,
    parentPath,
    isWildcard,
    styleGroup,
    excludeFromParent,
    ...layoutOptions
  } = config;
  return layoutOptions;
};

export const shouldExcludeLayout = (pathname: string): boolean => {
  const config = findRouteConfig(pathname);
  return config.excludeLayout || false;
};

export const getRouteStyleGroup = (pathname: string): string | undefined => {
  const config = findRouteConfig(pathname);
  return config.styleGroup;
};

export const routeContainsTerm = (
  pathname: string,
  terms: string[],
): boolean => {
  return terms.some(
    (term) => pathname.includes(`/${term}`) || pathname.endsWith(`/${term}`),
  );
};

export const getRouteMetadata = (pathname: string) => {
  const config = findRouteConfig(pathname);
  return (
    config.metadata || {
      title: config.name,
      description: config.description,
    }
  );
};

export const getBreadcrumbForRoute = (
  pathname: string,
): Array<{ name: string; path: string }> => {
  const parts = pathname.split("/").filter((p) => p);
  const breadcrumb = [{ name: "Accueil", path: "/" }];
  let currentPath = "";
  for (const part of parts) {
    currentPath += "/" + part;
    const config = findRouteConfig(currentPath);
    if (config.name && config.name !== "Unknown") {
      breadcrumb.push({ name: config.name, path: currentPath });
    }
  }
  return breadcrumb;
};
