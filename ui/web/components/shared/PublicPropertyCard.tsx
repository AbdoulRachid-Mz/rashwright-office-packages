// ✅ components/shared/PublicPropertyCard.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
// @ts-ignore
import { InteractionButton, LikeButton } from "@/components/shared/interaction-button";
import {
  Building2,
  MapPin,
  MessageSquare,
  Share2,
  Bed,
  Bath,
  Maximize2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveLink } from "./active-link";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

export interface MiniOrganization {
  id: string;
  name: string;
  logo?: string | null;
  type?: string;
  verified?: boolean;
}

export interface MiniLocation {
  id: string;
  city?: string | null;
  district?: string | null;
  quarter?: string | null;
}

export interface MiniMedia {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
}

export interface PropertyCardProps {
  id: string;
  title: string;
  slug?: string;
  price: number | string | null;
  currency?: string;
  purpose: "SALE" | "RENT";
  status?: "DRAFT" | "PUBLISHED" | "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "ARCHIVED";
  surface?: number | string | null;
  rooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  locationId?: string | null;
  location?: MiniLocation | null;
  organization?: MiniOrganization | null;
  media?: MiniMedia[];
  coverImageUrl?: string | null;
  favoritesCount?: number;
  viewsCount?: number;
  createdAt?: string | Date;
}

export interface PublicPropertyCardProps {
  property: PropertyCardProps;
  viewMode?: "grid" | "list";
  className?: string;
  onLikeToggle?: (isLiked: boolean) => void;
  onFollowToggle?: (isFollowing: boolean) => void;
  showOrganization?: boolean;
  showActions?: boolean;
}

// ============================================
// HELPERS
// ============================================

function getStatusLabel(status: PropertyCardProps["status"]): string {
  const map: Record<string, string> = {
    AVAILABLE: "Disponible",
    PUBLISHED: "Publié",
    RESERVED: "Réservé",
    SOLD: "Vendu",
    RENTED: "Loué",
    DRAFT: "Brouillon",
    ARCHIVED: "Archivé",
  };
  return map[status || ""] || status || "Inconnu";
}

function getStatusVariant(status: PropertyCardProps["status"]): "default" | "destructive" | "outline" | "secondary" {
  const map: Record<string, any> = {
    AVAILABLE: "default",
    PUBLISHED: "default",
    RESERVED: "outline",
    SOLD: "destructive",
    RENTED: "destructive",
    DRAFT: "secondary",
    ARCHIVED: "secondary",
  };
  return map[status || ""] || "outline";
}

function formatPrice(price: number | string | null, currency: string = "XOF"): string {
  if (price === null || price === undefined) return "Prix sur demande";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "Prix sur demande";
  return `${numPrice.toLocaleString()} ${currency}`;
}

function getLocationDisplay(location: MiniLocation | null, locationId?: string | null): string {
  if (location?.city) return location.city;
  if (location?.district) return location.district;
  if (location?.quarter) return location.quarter;
  return locationId || "Localisation non spécifiée";
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function PublicPropertyCard({
  property,
  viewMode = "grid",
  className,
  onLikeToggle,
  onFollowToggle,
  showOrganization = true,
  showActions = true,
}: PublicPropertyCardProps) {
  const isListView = viewMode === "list";

  // Extraire les données avec des valeurs par défaut
  const {
    id,
    title,
    price,
    currency = "XOF",
    purpose,
    status,
    surface,
    rooms,
    bathrooms,
    description,
    location,
    locationId,
    organization,
    media = [],
    coverImageUrl,
    favoritesCount = 0,
    viewsCount = 0,
  } = property;

  // Trouver l'image de couverture
  const coverImage = coverImageUrl || media.find((m) => m.type === "IMAGE")?.url || null;

  const statusLabel = getStatusLabel(status);
  const statusVariant = getStatusVariant(status);
  const formattedPrice = formatPrice(price, currency);
  const locationDisplay = getLocationDisplay(location ?? null, locationId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("h-full", className)}
    >
      <Card
        className={cn(
          "overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col",
          isListView && "flex-row flex-wrap md:flex-nowrap"
        )}
      >
        {/* ===== IMAGE ===== */}
        <div
          className={cn(
            "relative bg-muted flex-shrink-0",
            isListView ? "w-full md:w-64 h-48 md:h-auto" : "w-full aspect-video"
          )}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Building2 className="h-16 w-16" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="default" className="text-xs font-medium">
              {purpose === "SALE" ? "Vente" : "Location"}
            </Badge>
            {status && status !== "AVAILABLE" && status !== "PUBLISHED" && (
              <Badge variant={statusVariant} className="text-xs font-medium">
                {statusLabel}
              </Badge>
            )}
          </div>

          {/* Views count */}
          {viewsCount > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{viewsCount}</span>
            </div>
          )}
        </div>

        {/* ===== CONTENT ===== */}
        <div className={cn("flex-1 flex flex-col", isListView ? "p-4" : "p-4")}>
          {/* Organization */}
          {showOrganization && organization && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt={organization.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Building2 className="h-3 w-3" />
                )}
              </div>
              <Typography
                variant="caption2"
                weight="medium"
                className="truncate flex-1"
              >
                {organization.name}
              </Typography>
              {organization.verified && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">
                  ✓
                </Badge>
              )}
            </div>
          )}

          {/* Price */}
          <Typography
            variant="h4"
            weight="bold"
            className="text-primary mb-1"
          >
            {formattedPrice}
          </Typography>

          {/* Title */}
          <Link href={`/properties/${id}`} className="group">
            <Typography
              variant="body-base"
              weight="semibold"
              className="line-clamp-2 group-hover:text-primary transition-colors"
            >
              {title}
            </Typography>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <Typography variant="caption2" className="truncate">
              {locationDisplay}
            </Typography>
          </div>

          {/* Features */}
          {(surface || rooms || bathrooms) && (
            <div className="flex flex-wrap gap-3 mt-2">
              {surface && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <Typography variant="caption2">{surface} m²</Typography>
                </div>
              )}
              {rooms && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bed className="h-3.5 w-3.5" />
                  <Typography variant="caption2">{rooms}</Typography>
                </div>
              )}
              {bathrooms && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bath className="h-3.5 w-3.5" />
                  <Typography variant="caption2">{bathrooms}</Typography>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <Typography
              variant="caption2"
              theme="muted"
              className="line-clamp-2 mt-2 flex-1"
            >
              {description}
            </Typography>
          )}

          {/* Actions */}
          {showActions && (
            <CardFooter className="p-0 mt-3 border-t pt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <LikeButton
                  entityType="PROPERTY"
                  entityId={id}
                  count={favoritesCount}
                  size="sm"
                  variant="ghost"
                  iconOnly
                  onToggle={onLikeToggle}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  
                >
                  <ActiveLink href={`/properties/${id}`} disabledOnActive={false}>
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Contacter</span>
                  </ActiveLink>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: title,
                        text: `Découvrez ce bien immobilier: ${title}`,
                        url: window.location.origin + `/properties/${id}`,
                      });
                    } else {
                      navigator.clipboard.writeText(
                        window.location.origin + `/properties/${id}`
                      );
                      toast.success("Lien copié dans le presse-papier");
                    }
                  }}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Partager</span>
                </Button>
              </div>

              <Button
                size="sm"
                variant="default"
                className="h-8 px-3 text-xs"
                
              >
                <ActiveLink href={`/properties/${id}`} disabledOnActive={false}>
                  Voir détails
                </ActiveLink>
              </Button>
            </CardFooter>
          )}
        </div>
      </Card>
    </motion.div>
  );
}