import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import LazyImage from "./LazyImage";
import { Ionicons } from "@expo/vector-icons";

const PropertyImageSlider = ({ property, width }) => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const normalizeImageSources = (property) => {
    if (!property) return [];
    if (Array.isArray(property.newImageUrls)) {
      return property.newImageUrls.filter((url) => url);
    } else if (typeof property.newImageUrls === "string") {
      return [property.newImageUrls];
    }
    if (Array.isArray(property.imageUrls)) {
      return property.imageUrls.filter((url) => url);
    } else if (typeof property.imageUrls === "string") {
      return [property.imageUrls];
    }
    return [];
  };

  const images = normalizeImageSources(property);

  if (images.length === 0) {
    return (
      <LazyImage
        source={require("../../../assets/logo.png")}
        style={{ width, height: 200 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={styles.imageSlider}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={200}
        loop={images.length > 1}
        data={images}
        scrollAnimationDuration={800}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item, index }) => (
          <LazyImage
            key={index}
            source={{ uri: item }}
            style={{
              width: width,
              height: 200,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
            resizeMode="cover"
            cacheKey={`property_${property._id}_${index}`}
          />
        )}
      />

      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const PropertyCard = ({
  property,
  onPress,
  onEnquiryPress,
  onSharePress,
  isLiked,
  onLikePress,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = Platform.OS === "web" ? 350 : width - 32; // full width minus horizontal padding
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);

  const handleLike = (e) => {
    e.stopPropagation();
    const state = !localIsLiked;
    setLocalIsLiked(state);
    onLikePress(state);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.card, { width: cardWidth }]}
    >
      <PropertyImageSlider property={property} width={cardWidth} />

      <View style={styles.content}>
        <View style={styles.propertyIdWrapper}>
          <Text style={styles.propertyIdText}>
            Property ID: {property?._id?.slice(-4)}
          </Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.propertyType}>{property.propertyType}</Text>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={localIsLiked ? "heart" : "heart-outline"}
              size={26}
              color={localIsLiked ? "red" : "gray"}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.location}>📍 {property.location}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹ {parseInt(property.price).toLocaleString()}
          </Text>

          <View style={styles.priceButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.enquireBtn]}
              onPress={(e) => {
                e.stopPropagation();
                onEnquiryPress();
              }}
            >
              <Text style={styles.btnText}>Enquire</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.shareBtn]}
              onPress={(e) => {
                e.stopPropagation();
                onSharePress();
              }}
            >
              <Text style={styles.btnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginVertical: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    alignSelf: "center",
  },
  imageSlider: {
    position: "relative",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  pagination: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  inactiveDot: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  content: {
    padding: 14,
  },
  propertyIdWrapper: {
    backgroundColor: "#EEF2F3",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  propertyIdText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  location: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B4D3E",
  },
  priceButtons: {
    flexDirection: "row",
    marginTop: Platform.OS === "web" ? 0 : 6,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  enquireBtn: {
    backgroundColor: "#3E5C76",
  },
  shareBtn: {
    backgroundColor: "#666",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default PropertyCard;
