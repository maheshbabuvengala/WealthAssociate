import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../data/ApiUrl";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const ListedPropertiesScreen = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [referredInfo, setReferredInfo] = useState(null);
  const [likedProperties, setLikedProperties] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchProperties();
    loadReferredInfoFromStorage();
    loadLikedProperties();
  }, []);

  const loadReferredInfoFromStorage = async () => {
    try {
      const storedInfo = await AsyncStorage.getItem("referredAddedByInfo");
      if (storedInfo) {
        setReferredInfo(JSON.parse(storedInfo));
      }
    } catch (error) {
      console.error("Error loading referred info from storage:", error);
    }
  };

  const loadLikedProperties = async () => {
    try {
      const liked = await AsyncStorage.getItem("likedProperties");
      if (liked) {
        setLikedProperties(JSON.parse(liked));
      }
    } catch (error) {
      console.error("Error loading liked properties:", error);
    }
  };

  const saveLikedProperty = async (propertyId, isLiked) => {
    try {
      const updatedLikedProperties = {
        ...likedProperties,
        [propertyId]: isLiked,
      };
      setLikedProperties(updatedLikedProperties);
      await AsyncStorage.setItem(
        "likedProperties",
        JSON.stringify(updatedLikedProperties)
      );
    } catch (error) {
      console.error("Error saving liked property:", error);
    }
  };

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

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/properties/getApproveProperty`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const listedProps = data.filter(
          (property) => getPropertyTag(property.createdAt) === "Listed Property"
        );
        setProperties(listedProps);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePropertyPress = async (property) => {
    if (!property?._id) {
      console.error("Property ID is missing");
      return;
    }

    let formattedPrice = "Price not available";
    try {
      const priceValue = parseInt(property.price);
      if (!isNaN(priceValue)) {
        formattedPrice = `₹${priceValue.toLocaleString()}`;
      }
    } catch (e) {
      console.error("Error formatting price:", e);
    }

    try {
      await AsyncStorage.setItem(
        "currentProperty",
        JSON.stringify({
          ...property,
          id: property._id,
          price: formattedPrice,
          images: normalizeImageSources(property),
        })
      );

      navigation.navigate("PropertyDetails", {
        property: {
          ...property,
          id: property._id,
          price: formattedPrice,
          images: normalizeImageSources(property),
        },
      });
    } catch (error) {
      console.error("Error storing property:", error);
      Alert.alert("Error", "Failed to navigate to property details");
    }
  };

  const handleEnquiryNow = (property) => {
    setSelectedProperty(property);
    setPropertyModalVisible(true);
  };

  const handleShare = async (property) => {
    try {
      if (!property) {
        Alert.alert("Error", "No property data to share");
        return;
      }

      const shareData = {
        photo: normalizeImageSources(property)[0] || null,
        location: property.location || "Location not specified",
        price: property.price || "Price not available",
        propertyType: property.propertyType || "Property",
        PostedBy: property.PostedBy || "",
        fullName: property.fullName || "Wealth Associate",
        mobile: property.mobile || property.MobileNumber || "",
      };

      await AsyncStorage.setItem("sharedProperty", JSON.stringify(shareData));
      navigation.navigate("PropertyCard", { property: shareData });
    } catch (error) {
      console.error("Sharing error:", error);
      Alert.alert("Error", "Failed to share property");
    }
  };

  const PropertyImageSlider = ({ property, width }) => {
    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const images = normalizeImageSources(property);

    if (images.length === 0) {
      return (
        <Image
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
            <Image
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E5C76" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {properties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No listed properties available</Text>
          </View>
        ) : (
          properties.map((property) => {
            const isLiked = likedProperties[property._id] || false;
            const cardWidth = Platform.OS === "web" ? 350 : width - 32;

            return (
              <TouchableOpacity
                key={property._id}
                onPress={() => handlePropertyPress(property)}
                activeOpacity={0.9}
                style={[styles.card, { width: cardWidth }]}
              >
                <PropertyImageSlider property={property} width={cardWidth} />

                <View style={styles.content}>
                  <View style={styles.propertyIdWrapper}>
                    <Text style={styles.propertyIdText}>
                      Property ID: {property._id?.slice(-4)}
                    </Text>
                  </View>

                  <View style={styles.headerRow}>
                    <Text style={styles.propertyType}>
                      {property.propertyType}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        saveLikedProperty(property._id, !isLiked);
                      }}
                    >
                      <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={26}
                        color={isLiked ? "red" : "gray"}
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
                          handleEnquiryNow(property);
                        }}
                      >
                        <Text style={styles.btnText}>Enquire</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btn, styles.shareBtn]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleShare(property);
                        }}
                      >
                        <Text style={styles.btnText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={isPropertyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPropertyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {!referredInfo ? (
              <View style={styles.noReferredInfo}>
                <Text style={styles.noReferredInfoText}>
                  No referral information available
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPropertyModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Image
                  source={require("../../../assets/man.png")}
                  style={styles.agentLogo}
                />
                <Text style={styles.modalTitle}>Referred By</Text>
                <Text style={styles.modalText}>Name: {referredInfo.name}</Text>
                <Text style={styles.modalText}>
                  Mobile: {referredInfo.mobileNumber}
                </Text>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() =>
                    Linking.openURL(`tel:${referredInfo.mobileNumber}`)
                  }
                >
                  <Ionicons name="call" size={20} color="white" />
                  <Text style={styles.callButtonText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPropertyModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F3",
    paddingHorizontal: Platform.OS === "web" ? 20 : 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2F3",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
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
    paddingVertical: 8,
    paddingHorizontal: 14,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  agentLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginVertical: 4,
    color: "#555",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  callButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#dc3545",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noReferredInfo: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noReferredInfoText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
});

export default ListedPropertiesScreen;