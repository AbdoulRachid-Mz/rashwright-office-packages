// components/entity-cards.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Check,
  X,
  Building2,
  User,
  Tag,
  MapPin,
  AlertCircle,
  CreditCard,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Heart,
  CornerDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User as DbUser,
  Organization,
  Property,
  Category,
  Location,
  Report,
  Plan,
  Subscription,
  PropertyStatus,
  OrganizationStatus,
  SubscriptionStatus,
  ReportStatus,
  Media,
  Message,
  SavedSearch,
  Notification as DbNotification,
} from "@/db/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface BaseCardProps<T> {
  item: T;
  viewMode?: "grid" | "list" | "compact";
  status?: "default" | "success" | "warning" | "error" | "info" | string;
  isCliquable?: boolean;
  isMini?: boolean;
  activeAction?: "view" | "edit" | "delete";
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  extraActions?: {
    id: string;
    label: string;
    icon: any;
    onClick: () => void;
    className?: string;
  }[];
  className?: string;
}

const getStatusBorder = (status?: string) => {
  switch (status) {
    case "success":
      return "border-l-4 border-l-green-500";
    case "warning":
      return "border-l-4 border-l-yellow-500";
    case "error":
      return "border-l-4 border-l-red-500";
    case "info":
      return "border-l-4 border-l-blue-500";
    case "default":
      return "border-l-4 border-l-gray-300";
    default:
      return status?.startsWith("#") ? "border-l-4" : "";
  }
};

export function CardActionMenu<T>({
  onEdit,
  onView,
  onDelete,
  extraActions = [],
  entityName = "cet élément",
}: {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  extraActions?: {
    id: string;
    label: string;
    icon: any;
    onClick: () => void;
    className?: string;
  }[];
  entityName?: string;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  if (!onEdit && !onView && !onDelete && extraActions.length === 0)
    return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={() => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-primary/20 text-primary absolute z-2 top-4 right-4"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Action sur ${entityName}`}
            title={`Action sur ${entityName}`}
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        )}/>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          {onView && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <Eye className="h-4 w-4 mr-2" /> Voir
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Modifier
            </DropdownMenuItem>
          )}
          {extraActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={action.className}
            >
              <action.icon className="h-4 w-4 mr-2" /> {action.label}
            </DropdownMenuItem>
          ))}
          {onDelete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {entityName} ? Cette action est
              irréversible et supprimera définitivement toutes les données
              associées.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(false);
              }}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(false);
                onDelete?.();
              }}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function UserCard({
  item: user,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<DbUser>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(user);
    else if (activeAction === "edit" && onEdit) onEdit(user);
    else if (activeAction === "delete" && onDelete) onDelete(user);
    else if (onView) onView(user);
  };

  const hasActions = onEdit || onView || onDelete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              <User className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {user.fullName}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(user)}
                    onView={() => onView?.(user)}
                    onDelete={() => onDelete?.(user)}
                    entityName={`l'utilisateur ${user.fullName}`}
                  />
                </div>
              )}
            </div>
            {user.email && (
              <Typography variant="caption2" theme="muted" className="truncate">
                {user.email}
              </Typography>
            )}
            {user.phone && (
              <Typography variant="caption2" theme="muted" className="truncate">
                {user.phone}
              </Typography>
            )}
            {user.isVerified && (
              <Badge variant="default" className="mt-1">
                Vérifié
              </Badge>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(user)}
                onView={() => onView?.(user)}
                onDelete={() => onDelete?.(user)}
                entityName={`l'utilisateur ${user.fullName}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function OrganizationCard({
  item: organization,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  extraActions,
  className,
}: BaseCardProps<Organization>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(organization);
    else if (activeAction === "edit" && onEdit) onEdit(organization);
    else if (activeAction === "delete" && onDelete) onDelete(organization);
    else if (onView) onView(organization);
  };

  const hasActions = onEdit || onView || onDelete || (extraActions && extraActions.length > 0);

  const getStatusConfig = (status: OrganizationStatus) => {
    switch (status) {
      case "ACTIVE":
        return { variant: "default", label: "Actif" };
      case "INACTIVE":
        return { variant: "secondary", label: "Inactif" };
      case "PENDING":
        return { variant: "outline", label: "En attente" };
      default:
        return { variant: "outline", label: status };
    }
  };

  const statusConfig = getStatusConfig(organization.status ?? "PENDING");

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Building2 className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {organization.name}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(organization)}
                    onView={() => onView?.(organization)}
                    onDelete={() => onDelete?.(organization)}
                    extraActions={extraActions}
                    entityName={`l'organisation ${organization.name}`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusConfig.variant as "default" | "link" | "destructive" | "outline" | "ghost" | "secondary" | null | undefined}>{statusConfig.label}</Badge>
              {organization.verified && (
                <Badge variant="default">Vérifiée</Badge>
              )}
            </div>
            {organization.email && (
              <Typography variant="caption2" theme="muted" className="truncate mt-1">
                {organization.email}
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(organization)}
                onView={() => onView?.(organization)}
                onDelete={() => onDelete?.(organization)}
                extraActions={extraActions}
                entityName={`l'organisation ${organization.name}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function PropertyCard({
  item: property,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<Property>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(property);
    else if (activeAction === "edit" && onEdit) onEdit(property);
    else if (activeAction === "delete" && onDelete) onDelete(property);
    else if (onView) onView(property);
  };

  const hasActions = onEdit || onView || onDelete;

  const getStatusConfig = (status: PropertyStatus) => {
    switch (status) {
      case "AVAILABLE":
        return { variant: "default", label: "Disponible" };
      case "PUBLISHED":
        return { variant: "default", label: "Publié" };
      case "DRAFT":
        return { variant: "secondary", label: "Brouillon" };
      case "RESERVED":
        return { variant: "outline", label: "Réservé" };
      case "SOLD":
        return { variant: "outline", label: "Vendu" };
      case "RENTED":
        return { variant: "outline", label: "Loué" };
      case "ARCHIVED":
        return { variant: "destructive", label: "Archivé" };
      default:
        return { variant: "outline", label: status };
    }
  };

  const statusConfig = getStatusConfig((property.status as PropertyStatus) ?? "DRAFT");

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Building2 className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {property.title}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(property)}
                    onView={() => onView?.(property)}
                    onDelete={() => onDelete?.(property)}
                    entityName={`la propriété ${property.title}`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={statusConfig.variant as "default" | "link" | "destructive" | "outline" | "ghost" | "secondary" | null | undefined}>{statusConfig.label}</Badge>
              <Badge variant="outline">{property.purpose}</Badge>
              {property.price && (
                <Badge variant="outline">
                  {property.price.toLocaleString()} {property.currency || "XOF"}
                </Badge>
              )}
            </div>
            {property.surface && (
              <Typography variant="caption2" theme="muted" className="truncate mt-1">
                Surface: {property.surface} m²
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(property)}
                onView={() => onView?.(property)}
                onDelete={() => onDelete?.(property)}
                entityName={`la propriété ${property.title}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function CategoryCard({
  item: category,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<Category>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(category);
    else if (activeAction === "edit" && onEdit) onEdit(category);
    else if (activeAction === "delete" && onDelete) onDelete(category);
    else if (onView) onView(category);
  };

  const hasActions = onEdit || onView || onDelete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Tag className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {category.name}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(category)}
                    onView={() => onView?.(category)}
                    onDelete={() => onDelete?.(category)}
                    entityName={`la catégorie ${category.name}`}
                  />
                </div>
              )}
            </div>
            {!category.active && (
              <Badge variant="secondary" className="mt-1">
                Inactive
              </Badge>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(category)}
                onView={() => onView?.(category)}
                onDelete={() => onDelete?.(category)}
                entityName={`la catégorie ${category.name}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function LocationCard({
  item: location,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<Location>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(location);
    else if (activeAction === "edit" && onEdit) onEdit(location);
    else if (activeAction === "delete" && onDelete) onDelete(location);
    else if (onView) onView(location);
  };

  const hasActions = onEdit || onView || onDelete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <MapPin className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {location.name}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(location)}
                    onView={() => onView?.(location)}
                    onDelete={() => onDelete?.(location)}
                    entityName={`la localisation ${location.name}`}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {location.city && <Badge variant="outline">{location.city}</Badge>}
              {location.district && <Badge variant="outline">{location.district}</Badge>}
              {location.quarter && <Badge variant="outline">{location.quarter}</Badge>}
            </div>
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(location)}
                onView={() => onView?.(location)}
                onDelete={() => onDelete?.(location)}
                entityName={`la localisation ${location.name}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ReportCard({
  item: report,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  extraActions,
  className,
}: BaseCardProps<Report>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(report);
    else if (activeAction === "edit" && onEdit) onEdit(report);
    else if (activeAction === "delete" && onDelete) onDelete(report);
    else if (onView) onView(report);
  };

  const hasActions = onEdit || onView || onDelete || (extraActions && extraActions.length > 0);

  const getStatusConfig = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return { variant: "default", label: "En attente" };
      case "REVIEWED":
        return { variant: "outline", label: "Vérifié" };
      case "RESOLVED":
        return { variant: "default", label: "Résolu" };
      case "DISMISSED":
        return { variant: "secondary", label: "Rejeté" };
      default:
        return { variant: "outline", label: status };
    }
  };

  const statusConfig = getStatusConfig((report.status as ReportStatus) ?? "PENDING");

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive font-bold">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                Signalement #{report.id.slice(0, 8)}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(report)}
                    onView={() => onView?.(report)}
                    onDelete={() => onDelete?.(report)}
                    extraActions={extraActions}
                    entityName={`le signalement`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusConfig.variant as "default" | "link" | "destructive" | "outline" | "ghost" | "secondary" | null | undefined}>{statusConfig.label}</Badge>
              <Badge variant="outline">{report.entityType}</Badge>
            </div>
            {report.reason && (
              <Typography variant="caption2" theme="muted" className="truncate mt-1">
                Motif: {report.reason}
              </Typography>
            )}
            {report.createdAt && (
              <Typography variant="caption2" theme="muted" className="mt-1">
                {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(report)}
                onView={() => onView?.(report)}
                onDelete={() => onDelete?.(report)}
                extraActions={extraActions}
                entityName={`le signalement`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function PlanCard({
  item: plan,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<Plan>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(plan);
    else if (activeAction === "edit" && onEdit) onEdit(plan);
    else if (activeAction === "delete" && onDelete) onDelete(plan);
    else if (onView) onView(plan);
  };

  const hasActions = onEdit || onView || onDelete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {plan.name}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(plan)}
                    onView={() => onView?.(plan)}
                    onDelete={() => onDelete?.(plan)}
                    entityName={`le plan ${plan.name}`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{plan.type}</Badge>
              <Badge variant="outline">{plan.period}</Badge>
              <Badge variant="default">
                {plan.price.toLocaleString()} {" "} {plan.currency || "XOF"}
              </Badge>
            </div>
            {!plan.active && (
              <Badge variant="secondary" className="mt-1">
                Inactif
              </Badge>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(plan)}
                onView={() => onView?.(plan)}
                onDelete={() => onDelete?.(plan)}
                entityName={`le plan ${plan.name}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function SubscriptionCard({
  item: subscription,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<Subscription>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(subscription);
    else if (activeAction === "edit" && onEdit) onEdit(subscription);
    else if (activeAction === "delete" && onDelete) onDelete(subscription);
    else if (onView) onView(subscription);
  };

  const hasActions = onEdit || onView || onDelete;

  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return { variant: "default", label: "Actif" };
      case "CANCELED":
        return { variant: "secondary", label: "Annulé" };
      case "EXPIRED":
        return { variant: "destructive", label: "Expiré" };
      case "PENDING":
        return { variant: "outline", label: "En attente" };
      default:
        return { variant: "outline", label: status };
    }
  };

  const statusConfig = getStatusConfig((subscription.status as SubscriptionStatus) ?? "PENDING");

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                Abonnement #{subscription.id.slice(0, 8)}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(subscription)}
                    onView={() => onView?.(subscription)}
                    onDelete={() => onDelete?.(subscription)}
                    entityName={`l'abonnement #${subscription.id.slice(0, 8)}`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusConfig.variant as "default" | "link" | "destructive" | "outline" | "ghost" | "secondary" | null | undefined}>{statusConfig.label}</Badge>
            </div>
            {subscription.startDate && (
              <Typography variant="caption2" theme="muted" className="truncate mt-1">
                Début: {format(new Date(subscription.startDate), "dd/MM/yyyy", { locale: fr })}
              </Typography>
            )}
            {subscription.endDate && (
              <Typography variant="caption2" theme="muted" className="truncate">
                Fin: {format(new Date(subscription.endDate), "dd/MM/yyyy", { locale: fr })}
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(subscription)}
                onView={() => onView?.(subscription)}
                onDelete={() => onDelete?.(subscription)}
                entityName={`l'abonnement #${subscription.id.slice(0, 8)}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function MediaCard({
  item: media,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<Media>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(media);
    else if (activeAction === "edit" && onEdit) onEdit(media);
    else if (activeAction === "delete" && onDelete) onDelete(media);
    else if (onView) onView(media);
  };

  const hasActions = onEdit || onView || onDelete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            {media.type === "IMAGE" && (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10">
                <img
                  src={media.url}
                  alt="Media"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {media.type === "VIDEO" && (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            )}
            {media.type === "DOCUMENT" && (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                Média #{media.id.slice(0, 8)}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(media)}
                    onView={() => onView?.(media)}
                    onDelete={() => onDelete?.(media)}
                    entityName={`le média #${media.id.slice(0, 8)}`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{media.type}</Badge>
              <Badge variant="outline">{media.entityType}</Badge>
            </div>
            {media.createdAt && (
              <Typography variant="caption2" theme="muted" className="truncate mt-1">
                {format(new Date(media.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(media)}
                onView={() => onView?.(media)}
                onDelete={() => onDelete?.(media)}
                entityName={`le média #${media.id.slice(0, 8)}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function MessageCard({
  item: message,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<Message>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(message);
    else if (activeAction === "edit" && onEdit) onEdit(message);
    else if (activeAction === "delete" && onDelete) onDelete(message);
    else if (onView) onView(message);
  };

  const hasActions = onEdit || onView || onDelete;

  type ExtendedMessage = Message & {
    parentId?: string | null;
    stats?: {
      repliesCount?: number;
      interactions?: {
        LIKE?: number;
        total?: number;
      };
    };
    hasCurrentUserLiked?: boolean;
  };
  const ext = message as ExtendedMessage;
  const repliesCount = ext?.stats?.repliesCount ?? 0;
  const likesCount = ext?.stats?.interactions?.LIKE ?? 0;
  const hasCurrentUserLiked = ext?.hasCurrentUserLiked ?? false;
  const isReply = !!ext.parentId;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <Typography
                  variant={isCompact ? "body-sm" : "h4"}
                  weight="bold"
                  className="truncate group-hover:text-primary transition-colors"
                >
                  Message #{message.id.slice(0, 8)}
                </Typography>
                {isReply && (
                  <Badge variant="outline" className="gap-1 shrink-0">
                    <CornerDownRight className="h-3 w-3" />
                    Réponse
                  </Badge>
                )}
              </div>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(message)}
                    onView={() => onView?.(message)}
                    onDelete={() => onDelete?.(message)}
                    entityName={`le message #${message.id.slice(0, 8)}`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline">{message.type}</Badge>
              {message.read ? (
                <Badge variant="default">Lu</Badge>
              ) : (
                <Badge variant="secondary">Non lu</Badge>
              )}
              {repliesCount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {repliesCount}
                </Badge>
              )}
              {likesCount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Heart
                    className={cn(
                      "h-3 w-3",
                      hasCurrentUserLiked
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    )}
                  />
                  {likesCount}
                </Badge>
              )}
            </div>
            <Typography
              variant="caption2"
              theme="muted"
              className="truncate mt-1 line-clamp-2"
            >
              {message.content}
            </Typography>
            {message.createdAt && (
              <Typography variant="caption2" theme="muted" className="mt-1">
                {format(new Date(message.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(message)}
                onView={() => onView?.(message)}
                onDelete={() => onDelete?.(message)}
                entityName={`le message #${message.id.slice(0, 8)}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function NotificationCard({
  item: notification,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<DbNotification>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(notification);
    else if (activeAction === "edit" && onEdit) onEdit(notification);
    else if (activeAction === "delete" && onDelete) onDelete(notification);
    else if (onView) onView(notification);
  };

  const hasActions = onEdit || onView || onDelete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {notification.title}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(notification)}
                    onView={() => onView?.(notification)}
                    onDelete={() => onDelete?.(notification)}
                    entityName={`la notification #${notification.id.slice(0, 8)}`}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{notification.type}</Badge>
              {notification.read ? (
                <Badge variant="default">Lu</Badge>
              ) : (
                <Badge variant="secondary">Non lu</Badge>
              )}
            </div>
            <Typography
              variant="caption2"
              theme="muted"
              className="truncate mt-1 line-clamp-2"
            >
              {notification.message}
            </Typography>
            {notification.createdAt && (
              <Typography variant="caption2" theme="muted" className="mt-1">
                {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(notification)}
                onView={() => onView?.(notification)}
                onDelete={() => onDelete?.(notification)}
                entityName={`la notification #${notification.id.slice(0, 8)}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function SavedSearchCard({
  item: savedSearch,
  viewMode = "grid",
  status,
  isCliquable = true,
  isMini = false,
  activeAction = "view",
  onEdit,
  onView,
  onDelete,
  className,
}: BaseCardProps<SavedSearch>) {
  const isListView = viewMode === "list";
  const isCompact = viewMode === "compact" || isMini;

  const handleMainAction = () => {
    if (!isCliquable) return;
    if (activeAction === "view" && onView) onView(savedSearch);
    else if (activeAction === "edit" && onEdit) onEdit(savedSearch);
    else if (activeAction === "delete" && onDelete) onDelete(savedSearch);
    else if (onView) onView(savedSearch);
  };

  const hasActions = onEdit || onView || onDelete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 group relative overflow-hidden",
        isListView && "flex items-center",
        isCliquable && "cursor-pointer active:scale-[0.98]",
        getStatusBorder(status),
        className
      )}
      style={status?.startsWith("#") ? { borderLeftColor: status } : {}}
      onClick={handleMainAction}
    >
      <div
        className={cn(
          "p-3 flex w-full gap-3",
          isListView ? "flex-row items-center" : "flex-col"
        )}
      >
        <div className={cn("flex items-center gap-3", !isListView && "w-full")}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Typography
                variant={isCompact ? "body-sm" : "h4"}
                weight="bold"
                className="truncate group-hover:text-primary transition-colors"
              >
                {savedSearch.name}
              </Typography>

              {!isListView && hasActions && (
                <div
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardActionMenu
                    onEdit={() => onEdit?.(savedSearch)}
                    onView={() => onView?.(savedSearch)}
                    onDelete={() => onDelete?.(savedSearch)}
                    entityName={`la recherche sauvegardée #${savedSearch.id.slice(0, 8)}`}
                  />
                </div>
              )}
            </div>
            {savedSearch.createdAt && (
              <Typography variant="caption2" theme="muted" className="truncate mt-1">
                Créée le {format(new Date(savedSearch.createdAt), "dd/MM/yyyy", { locale: fr })}
              </Typography>
            )}
          </div>

          {isListView && hasActions && (
            <div
              className="flex-shrink-0 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionMenu
                onEdit={() => onEdit?.(savedSearch)}
                onView={() => onView?.(savedSearch)}
                onDelete={() => onDelete?.(savedSearch)}
                entityName={`la recherche sauvegardée #${savedSearch.id.slice(0, 8)}`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
