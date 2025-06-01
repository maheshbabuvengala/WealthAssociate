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
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../data/ApiUrl";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const RegularPropertiesScreen = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [referredInfo, setReferredInfo] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProperties();
    loadReferredInfoFromStorage();
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

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/properties/getApproveProperty`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        const regularProps = data.filter(
          (property) =>
            getPropertyTag(property.createdAt) === "Regular Property"
        );
        setProperties(
          regularProps.map((property) => ({
            ...property,
            images: formatImages(property), // This now uses newImageUrls
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format images for display (handles both array and single image)
  const formatImages = (property) => {
    if (!property) return [];

    // Handle array of newImageUrls
    if (
      Array.isArray(property.newImageUrls) &&
      property.newImageUrls.length > 0
    ) {
      return property.newImageUrls.map((url) => ({
        uri: url, // Assuming URLs are already complete
      }));
    }

    // Handle single image as string
    if (typeof property.newImageUrls === "string") {
      return [{ uri: property.newImageUrls }];
    }

    // Fallback to default logo
    return [require("../../../assets/logo.png")];
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

  const getLastFourChars = (id) => {
    return id ? id.slice(-4) : "N/A";
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
      // Store the property in AsyncStorage before navigating
      await AsyncStorage.setItem(
        "currentProperty",
        JSON.stringify({
          ...property,
          id: property._id,
          price: formattedPrice,
          images: property.images,
        })
      );

      navigation.navigate("PropertyDetails", {
        property: {
          ...property,
          id: property._id,
          price: formattedPrice,
          images: property.images,
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
        photo: property.images?.[0]?.uri || null,
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

  const PropertyImageSlider = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollRef = useRef(null);

    useEffect(() => {
      if (images.length <= 1) return;

      const interval = setInterval(() => {
        const nextIndex = (currentImageIndex + 1) % images.length;
        setCurrentImageIndex(nextIndex);
        scrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
      }, 3000);

      return () => clearInterval(interval);
    }, [currentImageIndex, images.length]);

    if (images.length === 0) {
      return (
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.propertyImage}
          resizeMode="contain"
        />
      );
    }

    return (
      <View style={styles.imageSliderContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const newIndex = Math.round(offsetX / width);
            setCurrentImageIndex(newIndex);
          }}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              source={image}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.activeDot,
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
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {properties.length === 0 ? (
          <Text style={styles.noPropertiesText}>
            No regular properties available
          </Text>
        ) : (
          properties.map((property, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handlePropertyPress(property)}
              activeOpacity={0.8}
              style={styles.propertyCardContainer}
            >
              <View style={styles.propertyCard}>
                <PropertyImageSlider images={property.images} />

                <View
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor: "#FF9800",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>Regular Property</Text>
                </View>
                <View style={styles.propertyIdContainer}>
                  <Text style={styles.propertyId}>
                    ID: {getLastFourChars(property._id)}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{property.propertyType}</Text>
                <Text style={styles.cardSubtitle}>
                  Location: {property.location}
                </Text>
                <Text style={styles.cardPrice}>
                  ₹ {parseInt(property.price).toLocaleString()}
                </Text>
                <View style={styles.cardButtons}>
                  <TouchableOpacity
                    style={styles.enquiryBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEnquiryNow(property);
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Enquiry Now
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleShare(property);
                    }}
                  >
                    <FontAwesome name="share" size={16} color="white" />
                    <Text
                      style={{
                        color: "white",
                        marginLeft: 5,
                        fontWeight: "bold",
                      }}
                    >
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 15,
    paddingBottom: "15%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  noPropertiesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  propertyCardContainer: {
    marginBottom: 15,
  },
  propertyCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  imageSliderContainer: {
    position: "relative",
    marginBottom: 10,
  },
  propertyImage: {
    width: width - 40,
    height: 200,
    borderRadius: 8,
  },
  pagination: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  statusTag: {
    position: "absolute",
    top: 20,
    left: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  propertyIdContainer: {
    alignItems: "flex-end",
    paddingRight: 5,
    marginBottom: 5,
  },
  propertyId: {
    backgroundColor: "green",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: "#fff",
    fontWeight: "600",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginVertical: 8,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  enquiryBtn: {
    backgroundColor: "#D81B60",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  shareBtn: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
  },
  modalText: {
    fontSize: 16,
    marginVertical: 4,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  callButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#dc3545",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
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

export default RegularPropertiesScreen;
