import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH - 32;

interface MediaGalleryProps {
  media: Array<{
    id: string;
    url: string;
    type?: string;
    thumbnailUrl?: string | null;
  }>;
  style?: object;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, style }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (!media.length) return null;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: typeof media[0] }) => {
    return (
      <View style={styles.slide}>
        <Image
          source={{ uri: item.url }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={flatListRef}
        data={media}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      {/* Indicators */}
      {media.length > 1 && (
        <View style={styles.indicatorsContainer}>
          {media.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.border,
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>
      )}

      {/* Counter */}
      {media.length > 1 && (
        <View
          style={[
            styles.counter,
            { backgroundColor: "rgba(0,0,0,0.6)" },
          ]}
        >
          <Text style={styles.counterText}>
            {currentIndex + 1} / {media.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  slide: {
    width: ITEM_WIDTH,
    height: 280,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  counter: {
    position: "absolute",
    top: 24,
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default MediaGallery;
