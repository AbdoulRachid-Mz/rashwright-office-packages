// ✅ components/shared/interaction-button.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark, UserPlus, Share2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";
import {
  useToggleInteraction,
  useInteractionExists,
  useEntityInteractionCounts,
  type InteractionType,
  type EntityType,
} from "@/hooks/use-interactions";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ButtonProps } from "@base-ui/react";

type InteractionCounts = Record<InteractionType, number>;


interface InteractionButtonProps  {
  type: InteractionType;
  entityType: EntityType;
  entityId: string;
  count?: number;
  iconOnly?: boolean;
  showCount?: boolean;
  withConfetti?: boolean;
  onToggle?: (isActive: boolean) => void;
  className?: string;
  variant?: "ghost" | "default" | "secondary" | "destructive" | "outline";
  size?: "default" | "icon" | "lg" | "xs" | "sm" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
}

const iconMap: Record<InteractionType, any> = {
  LIKE: Heart,
  BOOKMARK: Bookmark,
  FOLLOW: UserPlus,
  SHARE: Share2,
};

const labelMap: Record<InteractionType, { active: string; inactive: string }> = {
  LIKE: { active: "Favori", inactive: "J'aime" },
  BOOKMARK: { active: "Sauvegardé", inactive: "Sauvegarder" },
  FOLLOW: { active: "Suivi", inactive: "Suivre" },
  SHARE: { active: "Partagé", inactive: "Partager" },
};

const colorMap: Record<InteractionType, string> = {
  LIKE: "text-red-500 fill-red-500",
  BOOKMARK: "text-blue-500 fill-blue-500",
  FOLLOW: "text-emerald-500 fill-emerald-500",
  SHARE: "text-purple-500 fill-purple-500",
};

export function InteractionButton({
  type,
  entityType,
  entityId,
  count: initialCount = 0,
  iconOnly = false,
  showCount = true,
  withConfetti = false,
  onToggle,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: InteractionButtonProps) {
  const { userDocument: user, loading } = useAuth();
  const [optimisticActive, setOptimisticActive] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);

  // Vérifier si l'interaction existe
  const { data: exists, isLoading: checkingExists } = useInteractionExists(
    user?.id,
    entityId,
    entityType,
    type
  );

  // Récupérer les compteurs
  const { data: counts, isLoading: loadingCounts } = useEntityInteractionCounts(
    entityId,
    entityType
  );

  // Mutations
  const { mutate: toggle, isPending } = useToggleInteraction();

  // Synchro des états avec les données serveur
  useEffect(() => {
    if (exists !== undefined) {
      setOptimisticActive(exists);
    }
  }, [exists]);

  useEffect(() => {
    if (counts) {
      const typedCounts = counts as InteractionCounts;
      if (typedCounts[type] !== undefined) {
        setOptimisticCount(typedCounts[type]);
      }
    }
  }, [counts, type]);

  const isLoading = checkingExists || loadingCounts || isPending;
  const Icon = iconMap[type];
  const labels = labelMap[type];
  const colorClass = optimisticActive ? colorMap[type] : "";

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user?.id) {
        toast.error("Connectez-vous pour interagir");
        return;
      }

      if (isPending) return;

      // Optimistic update
      const newActive = !optimisticActive;
      setOptimisticActive(newActive);
      setOptimisticCount((prev) => (newActive ? prev + 1 : Math.max(0, prev - 1)));

      // Appel API
      toggle({
        userId: user.id!,
        entityId,
        entityType,
        type,
      });

      onToggle?.(newActive);

      // Confetti pour les likes
      if (newActive && withConfetti && type === "LIKE") {
        // Importer dynamiquement pour éviter le bundle
        import("@/utils/confetti").then(({ fireConfettiPreset }) => {
          fireConfettiPreset("success");
        });
      }
      },
    [
      loading,
      user,
      isPending,
      optimisticActive,
      toggle,
      entityId,
      entityType,
      type,
      onToggle,
      withConfetti,
    ]
  );

  // Ne pas afficher le compteur si 0 et qu'on est en mode icône
  const shouldShowCount = showCount && optimisticCount > 0;

  return (
    <Button
      variant={optimisticActive ? "default" : variant}
      size={size}
      className={cn(
        "relative transition-all duration-200",
        iconOnly ? "h-9 w-9 p-0" : "gap-1.5",
        optimisticActive && "bg-primary/10 text-primary hover:bg-primary/20",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <motion.div
            initial={false}
            animate={{ scale: optimisticActive ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative"
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                optimisticActive && colorClass
              )}
            />
            {optimisticActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary"
              />
            )}
          </motion.div>

          {!iconOnly && (
            <span className="text-sm font-medium">
              {optimisticActive ? labels.active : labels.inactive}
            </span>
          )}

          {shouldShowCount && (
            <motion.span
              key={optimisticCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs text-muted-foreground ml-0.5"
            >
              {optimisticCount}
            </motion.span>
          )}
        </>
      )}
    </Button>
  );
}

// Variantes pré-configurées
export const LikeButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="LIKE" withConfetti />
);

export const BookmarkButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="BOOKMARK" />
);

export const FollowButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="FOLLOW" />
);

export const ShareButton = (props: Omit<InteractionButtonProps, "type">) => (
  <InteractionButton {...props} type="SHARE" />
);