import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import LazyImage from "./LazyImage";

const { width } = Dimensions.get("window");

const RequestedPropertyCard = ({ item, onIHavePress }) => {
  const getPropertyTag = (createdAt) => {
    const currentDate = new Date();
    const propertyDate = new Date(createdAt);
    const timeDifference = currentDate - propertyDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference <= 3) {
      return "Regular Property";
    } else if (daysDifference >= 4 && daysDifference <= 17) {
      return "Approved Property";
    } else if (daysDifference >= 18 && daysDifference <= 25) {
      return "Wealth Property";
    } else {
      return "Listed Property";
    }
  };

  const getLastFourCharss = (id) => {
    if (!id) return "N/A";
    return id.length > 4 ? id.slice(-4) : id;
  };

  const propertyTag = getPropertyTag(item.createdAt);
  const propertyId = getLastFourCharss(item.id);

  const getImageByPropertyType = (propertyType) => {
    switch ((propertyType || "").toLowerCase()) {
      case "flat(apartment)":
      case "apartment":
        return require("../../../assets/download.jpeg");
      case "land(opensite)":
      case "land":
        return require("../../../assets/Land.jpg");
      case "house(individual)":
      case "house":
        return require("../../../assets/house.png");
      case "villa":
        return require("../../../assets/villa.jpg");
      case "agriculture land":
        return require("../../../assets/agriculture.jpeg");
      case "commercial property":
        return require("../../../assets/commercial.jpeg");
      case "commercial land":
        return require("../../../assets/commland.jpeg");
      default:
        return require("../../../assets/house.png");
    }
  };

  const getImageSource = () => {
    if (item.images && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === "string") {
        return { uri: firstImage };
      } else if (firstImage?.uri) {
        return firstImage;
      }
    }
    return getImageByPropertyType(item.type);
  };

  const imageSource = getImageSource();

  return (
    <View style={styles.requestedCard}>
      <LazyImage
        source={imageSource}
        style={styles.requestedImage}
        cacheKey={`requested_${item.id}`}
      />
      <View style={styles.propertyIdContainer}>
        <Text style={styles.propertyId}>ID: {propertyId}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.requestedTitle}>{item.title}</Text>
        <Text style={styles.requestedText}>Type: {item.type}</Text>
        <Text style={styles.requestedText}>Location: {item.location}</Text>
        <Text style={styles.requestedText}>Budget: {item.budget}</Text>
      </View>
      <TouchableOpacity
        style={styles.iHaveButton}
        onPress={(e) => {
          e.stopPropagation();
          onIHavePress();
        }}
      >
        <Text style={styles.buttonText}>I Have</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  requestedCard: {
    width: Platform.select({
      web: 350,
      default: width * 0.8, // ✅ This now works
    }),
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
    elevation: 3,
  },
  requestedImage: {
    width: "100%",
    height: 120,
  },
  requestedTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  requestedText: {
    fontSize: 12,
    color: "#666",
  },
  details: {
    padding: 10,
  },
  iHaveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
    margin: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  propertyIdContainer: {
    alignItems: "flex-end",
    paddingRight: 5,
    marginTop: 5,
  },
  propertyId: {
    backgroundColor: "green",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: "#fff",
    fontWeight: "600",
  },
});

export default RequestedPropertyCard;
