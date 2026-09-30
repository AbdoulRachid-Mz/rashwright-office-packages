// constants/header-config.ts
import {
  Home,
  Building2,
  User,
  Shield,
  Users,
  MapPin,
  Tag,
  AlertTriangle,
  CreditCard,
  Settings,
  BarChart3,
} from "lucide-react";
import { UserRoles } from "@/configs/routes/routes-config";

export interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: any;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const getHeaderMenuGroups = (user: UserRoles | null): MenuGroup[] => {
  const publicGroups: MenuGroup[] = [
    {
      title: "Navigation",
      items: [
        {
          title: "Accueil",
          url: "/",
          icon: Home,
        },
        {
          title: "Propriétés",
          url: "/properties",
          icon: Building2,
        },
        {
          title: "Agences",
          url: "/organizations",
          icon: Building2,
        },
      ],
    },
  ];

  const adminGroups: MenuGroup[] = [
    {
      title: "Administration",
      items: [
        {
          title: "Tableau de bord",
          url: "/ad",
          icon: BarChart3,
          description: "Vue d'ensemble",
        },
        {
          title: "Utilisateurs",
          url: "/ad/users",
          icon: Users,
          description: "Gérer les utilisateurs",
        },
        {
          title: "Organisations",
          url: "/ad/organizations",
          icon: Building2,
          description: "Gérer les organisations",
        },
        {
          title: "Propriétés",
          url: "/ad/properties",
          icon: Building2,
          description: "Gérer les propriétés",
        },
        {
          title: "Catégories",
          url: "/ad/categories",
          icon: Tag,
          description: "Gérer les catégories",
        },
        {
          title: "Localisations",
          url: "/ad/locations",
          icon: MapPin,
          description: "Gérer les localisations",
        },
        {
          title: "Signalements",
          url: "/ad/reports",
          icon: AlertTriangle,
          description: "Gérer les signalements",
        },
        {
          title: "Abonnements",
          url: "/ad/subscriptions",
          icon: CreditCard,
          description: "Gérer les abonnements",
        },
        {
          title: "Plans",
          url: "/ad/plans",
          icon: CreditCard,
          description: "Gérer les plans",
        },
        {
          title: "Paramètres",
          url: "/ad/settings",
          icon: Settings,
          description: "Paramètres du système",
        },
      ],
    },
  ];

  if (user?.isAdmin) {
    return [...publicGroups, ...adminGroups];
  }

  return publicGroups;
};

export const getRouteIcon = (url: string) => {
  const iconMap: Record<string, any> = {
    "/": Home,
    "/properties": Building2,
    "/ad": BarChart3,
    "/ad/users": Users,
    "/ad/organizations": Building2,
    "/ad/properties": Building2,
    "/ad/categories": Tag,
    "/ad/locations": MapPin,
    "/ad/reports": AlertTriangle,
    "/ad/subscriptions": CreditCard,
    "/ad/plans": CreditCard,
    "/ad/settings": Settings,
  };
  return iconMap[url] || null;
};
