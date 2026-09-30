import React from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import PropertyCard from "@/components/shared/PropertyCard";
import PropertyCardHorizontal from "@/components/shared/PropertyCardHorizontal";
import OrganizationCard from "@/components/shared/OrganizationCard";
import CategoryChips from "@/components/shared/CategoryChips";
import StatsCard from "@/components/shared/StatsCard";
import EmptyState from "@/components/shared/EmptyState";
import BadgeStatus from "@/components/shared/BadgeStatus";
import ConversationCard from "@/components/shared/ConversationCard";
import MediaGallery from "@/components/shared/MediaGallery";
import MessageBubble from "@/components/shared/MessageBubble";
import ThemedText from "@/components/ui/text";
import type { PropertyWithRelations, OrganizationWithStats, Conversation, Message } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOCK_PROPERTY: PropertyWithRelations = {
  id: "1",
  organizationId: "org1",
  categoryId: "cat1",
  locationId: "loc1",
  title: "Villa moderne avec piscine à Niamey",
  slug: "villa-moderne-niamey",
  description: "Belle villa moderne",
  purpose: "SALE",
  price: 25000000,
  currency: "XOF",
  surface: 120,
  rooms: 4,
  bathrooms: 2,
  floors: 1,
  viewsCount: 120,
  favoritesCount: 8,
  coverMediaId: null,
  hasInstallments: true,
  installmentMonths: 12,
  installmentDeposit: 5000000,
  isFeatured: true,
  isVerified: true,
  features: ["parking", "swimmingPool", "garden"],
  attributes: { constructionYear: 2023 },
  status: "AVAILABLE",
  expiresAt: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  organization: {
    id: "org1",
    name: "Immo360 Agency",
    slug: "immo360-agency",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200",
    verified: true,
    phone: "+227 90 00 00 00",
    email: "contact@immo360.com",
    type: "AGENCY",
  } as any,
  category: { id: "cat1", name: "Villa", slug: "villa", icon: "home", active: true } as any,
  location: { id: "loc1", name: "Niamey", city: "Niamey", country: "Niger", latitude: "13.5137", longitude: "2.1098" } as any,
  media: [
    { id: "m1", propertyId: "1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800", type: "IMAGE", position: 0, thumbnailUrl: null, metadata: null, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    { id: "m2", propertyId: "1", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800", type: "IMAGE", position: 1, thumbnailUrl: null, metadata: null, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  ],
  favorites: [],
  hasCurrentUserLiked: false,
};

const MOCK_ORGANIZATION: OrganizationWithStats = {
  id: "org1",
  // ownerId: "user1",
  userId: "user1",
  name: "Immo360 Agency",
  slug: "immo360-agency",
  description: "Agence immobilière de référence au Niger",
  logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200",
  banner: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
  phone: "+227 90 00 00 00",
  email: "contact@immo360.com",
  address: "Avenue de l'Indépendance, Niamey",
  website: null,
  taxId: null,
  type: "AGENCY",
  status: "ACTIVE",
  verified: true,
  socialLinks: {},
  businessHours: {},
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  stats: {
    totalMembers: 5,
    membersByRole: { OWNER: 1, AGENT: 4, ADMIN: 0, EDITOR: 0, VIEWER: 0 },
    totalProperties: 24,
    activeProperties: 18,
    soldProperties: 4,
    rentedProperties: 2,
    draftProperties: 0,
    archivedProperties: 0,
    propertiesByCategory: {},
    propertiesByPurpose: { SALE: 12, RENT: 6 },
    totalPropertyViews: 1200,
    totalPropertyFavorites: 85,
    totalConversations: 42,
    activeConversations: 12,
    unreadMessages: 3,
    currentPlan: "PRO",
    subscriptionStatus: "ACTIVE",
    daysUntilExpiration: 28,
  },
};

const MOCK_CONVERSATION: Conversation = {
  id: "conv1",
  propertyId: "prop1",
  buyerId: "user2",
  sellerId: "user1",
  organizationId: "org1",
  status: "ACTIVE",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  property: { id: "prop1", title: "Villa moderne", price: 25000000, currency: "XOF", coverMediaId: null, coverImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=200" } as any,
  buyer: { id: "user2", fullName: "Amadou Diallo", avatar: null } as any,
  seller: { id: "user1", fullName: "Agence Immo360", avatar: null } as any,
  lastMessage: { content: "Bonjour, cette villa est-elle toujours disponible ?", createdAt: "2024-01-02T10:00:00Z", senderId: "user2", type: "TEXT" },
  unreadCount: 2,
};

const MOCK_MESSAGES: Message[] = [
  {
    id: "msg1",
    conversationId: "conv1",
    parentId: null,
    senderId: "user2",
    content: "Bonjour, cette villa est-elle toujours disponible ?",
    type: "TEXT",
    read: true,
    readAt: "2024-01-02T10:05:00Z",
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-02T10:05:00Z",
    sender: { id: "user2", fullName: "Amadou Diallo", avatar: null } as any,
  },
  {
    id: "msg2",
    conversationId: "conv1",
    parentId: null,
    senderId: "user1",
    content: "Oui, elle est toujours disponible. Voulez-vous programmer une visite ?",
    type: "TEXT",
    read: true,
    readAt: "2024-01-02T10:10:00Z",
    createdAt: "2024-01-02T10:05:00Z",
    updatedAt: "2024-01-02T10:10:00Z",
    sender: { id: "user1", fullName: "Agence Immo360", avatar: null } as any,
  },
  {
    id: "msg3",
    conversationId: "conv1",
    parentId: null,
    senderId: "user2",
    content: "Parfait, je suis disponible samedi matin.",
    type: "TEXT",
    read: false,
    readAt: null,
    createdAt: "2024-01-02T10:15:00Z",
    updatedAt: "2024-01-02T10:15:00:00Z",
    sender: { id: "user2", fullName: "Amadou Diallo", avatar: null } as any,
  },
];

const ComponentsPlayground: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16 }}>
        <ThemedText variant="3xl" weight="bold" style={{ color: theme.colors.cardForeground, marginBottom: 4 }}>
          Composants Shared
        </ThemedText>
        <ThemedText variant="base" style={{ color: theme.colors.mutedForeground, marginBottom: 24 }}>
          Storyboard visuel de la Phase 3
        </ThemedText>

        {/* PropertyCard */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginBottom: 12 }}>
          PropertyCard
        </ThemedText>
        <PropertyCard property={MOCK_PROPERTY} onPress={() => {}} onFavoriteToggle={() => {}} />

        {/* PropertyCardHorizontal */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          PropertyCardHorizontal
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <PropertyCardHorizontal property={MOCK_PROPERTY} onPress={() => {}} />
        </ScrollView>

        {/* OrganizationCard */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          OrganizationCard
        </ThemedText>
        <OrganizationCard organization={MOCK_ORGANIZATION} onPress={() => {}} onFollow={() => {}} />

        {/* CategoryChips */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          CategoryChips
        </ThemedText>
        <CategoryChips
          categories={[
            { id: "cat1", name: "Villa", slug: "villa", icon: "home", active: true } as any,
            { id: "cat2", name: "Appartement", slug: "apartment", icon: "apartment", active: true } as any,
            { id: "cat3", name: "Terrain", slug: "land", icon: "land", active: true } as any,
          ]}
          selectedId="cat1"
          onSelect={() => {}}
        />

        {/* StatsCard */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          StatsCard
        </ThemedText>
        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
          <StatsCard title="Vues totales" value={1200} icon="eye-outline" delta={12} deltaLabel="vs mois dernier" />
          <StatsCard title="Favoris" value={85} icon="heart-outline" delta={-3} />
          <StatsCard title="Messages" value={42} icon="chatbubble-outline" />
        </View>

        {/* BadgeStatus */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          BadgeStatus
        </ThemedText>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <BadgeStatus status="AVAILABLE" />
          <BadgeStatus status="RESERVED" />
          <BadgeStatus status="SOLD" />
          <BadgeStatus status="RENTED" />
          <BadgeStatus status="DRAFT" />
        </View>

        {/* EmptyState */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          EmptyState
        </ThemedText>
        <EmptyState
          icon="heart-outline"
          title="Aucun favori"
          subtitle="Parcourez les annonces et ajoutez vos coups de cœur."
          actionLabel="Explorer"
          onAction={() => {}}
        />

        {/* ConversationCard */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          ConversationCard
        </ThemedText>
        <ConversationCard conversation={MOCK_CONVERSATION} onPress={() => {}} />

        {/* MessageBubble */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          MessageBubble
        </ThemedText>
        <View style={{ gap: 8 }}>
          {MOCK_MESSAGES.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === "user1"}
              showAvatar={message.senderId !== "user1"}
              senderAvatar={message.sender.avatar ?? undefined}
              senderName={message.sender.fullName}
              conversationId={message.conversationId}
            />
          ))}
        </View>

        {/* MediaGallery */}
        <ThemedText variant="lg" weight="bold" style={{ color: theme.colors.cardForeground, marginTop: 24, marginBottom: 12 }}>
          MediaGallery
        </ThemedText>
        <MediaGallery media={MOCK_PROPERTY.media} />
      </View>
    </ScrollView>
  );
};

export default ComponentsPlayground;
