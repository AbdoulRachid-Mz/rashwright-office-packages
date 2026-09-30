/**
 * Wrapper de compatibilité SwipeablePropertyCard → PropertyCard
 *
 * Ce fichier ne devrait plus être importé à terme. Remplacez les usages
 * par PropertyCard directement. Le mapping de props est le suivant :
 *
 *   SwipeablePropertyCard        PropertyCard
 *   ───────────────────────────  ─────────────────────────
 *   onFavorite(id)          →    onFavoriteToggle(id)
 *   onChat(property)        →    onContact()
 *   onShare(property)       →    onShare()
 *   onPress                 →    onPress / onViewDetail
 */
import React from "react";
import { PropertyWithRelations } from "@/types";
import PropertyCard from "./PropertyCard";

interface SwipeablePropertyCardProps {
  property: PropertyWithRelations;
  onPress: () => void;
  onFavorite?: (id: string) => void;
  onChat?: (property: PropertyWithRelations) => void;
  onShare?: (property: PropertyWithRelations) => void;
  isFavorited?: boolean;
  enableSwipe?: boolean;
  enableLongPress?: boolean;
  style?: object;
  showOwnerHeader?: boolean;
}

export const SwipeablePropertyCard: React.FC<
  SwipeablePropertyCardProps
> = ({
  property,
  onPress,
  onFavorite,
  onChat,
  onShare,
  isFavorited = false,
  enableSwipe = true,
  showOwnerHeader = false,
  style,
  enableLongPress = true,
}) => {
  return (
    <PropertyCard
      property={property}
      isFavorited={isFavorited}
      onFavoriteToggle={onFavorite}
      onContact={onChat ? () => onChat(property) : undefined}
      onShare={onShare ? () => onShare(property) : undefined}
      onViewDetail={onPress}
      onPress={onPress}
      showOwnerHeader={showOwnerHeader}
      showFavoriteButton
      enableSwipe={enableSwipe}
      enableDoubleTapLike
      style={style}
    />
  );
};

export default SwipeablePropertyCard;
