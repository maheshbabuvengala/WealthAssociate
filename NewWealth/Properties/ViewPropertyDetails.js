import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";

const { width } = Dimensions.get("window");

const PropertyDetailsScreen = ({ route, navigation }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [referredInfo, setReferredInfo] = useState(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userType, setUserType] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef(null);

  // Handle image auto-scroll
  useEffect(() => {
    if (!property?.images || property.images.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % property.images.length;
      setCurrentImageIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentImageIndex, property?.images]);

  const fetchPropertyDetails = async (propertyId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${API_URL}/properties/getProperty/${propertyId}`,
        {
          method: "GET",
          headers: {
            token: token || "",
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching property details:", error);
      throw error;
    }
  };

  const loadProperty = async () => {
    try {
      // First check if we have a property ID from route params (from notification)
      if (route?.params?.propertyId) {
        const propertyData = await fetchPropertyDetails(
          route.params.propertyId
        );
        setProperty({
          ...propertyData,
          images: formatImages(propertyData),
        });
        return;
      }

      // Then try to get from route.params.property
      if (route?.params?.property) {
        const propertyFromRoute = route.params.property;

        // If we don't have full details, fetch them
        if (!propertyFromRoute._id && propertyFromRoute.id) {
          const fullDetails = await fetchPropertyDetails(propertyFromRoute.id);
          setProperty({
            ...propertyFromRoute,
            ...fullDetails,
            images: formatImages(fullDetails),
          });
        } else {
          setProperty({
            ...propertyFromRoute,
            images: formatImages(propertyFromRoute),
          });
        }
        return;
      }

      // If not in route.params, try to load from AsyncStorage
      const storedProperty = await AsyncStorage.getItem("currentProperty");
      if (storedProperty) {
        const parsedProperty = JSON.parse(storedProperty);
        setProperty({
          ...parsedProperty,
          images: formatImages(parsedProperty),
        });
      }
    } catch (error) {
      console.error("Error loading property:", error);
      Alert.alert("Error", "Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  // Format images for display (handles both array and single image)
  const formatImages = (property) => {
    if (!property) return [];

    // Handle array of photos
    if (Array.isArray(property.photo) && property.photo.length > 0) {
      return property.photo.map((photo) => ({
        uri: photo.startsWith("http") ? photo : `${API_URL}${photo}`,
      }));
    }

    // Handle single photo string
    if (typeof property.photo === "string") {
      return [
        {
          uri: property.photo.startsWith("http")
            ? property.photo
            : `${API_URL}${property.photo}`,
        },
      ];
    }

    // Handle images array if passed directly
    if (Array.isArray(property.images)) {
      return property.images;
    }

    // Fallback to default image
    return [require("../../assets/logo.png")];
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadProperty();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadProperty();
    fetchUserDetails();
  }, [route.params?.propertyId]);

  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const type = await AsyncStorage.getItem("userType");
      setUserType(type);

      let endpoint = "";
      switch (type) {
        case "WealthAssociate":
          endpoint = `${API_URL}/agent/AgentDetails`;
          break;
        case "Customer":
          endpoint = `${API_URL}/customer/getcustomer`;
          break;
        case "CoreMember":
          endpoint = `${API_URL}/core/getcore`;
          break;
        case "ReferralAssociate":
          endpoint = `${API_URL}/agent/AgentDetails`;
          break;
        case "Investor":
          endpoint = `${API_URL}/investors/getinvestor`;
          break;
        case "NRI":
          endpoint = `${API_URL}/nri/getnri`;
          break;
        case "SkilledResource":
          endpoint = `${API_URL}/skillLabour/getskilled`;
          break;
        default:
          endpoint = `${API_URL}/agent/AgentDetails`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          token: token || "",
        },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    loadProperty();
    fetchUserDetails();
  }, [route.params]);

  const formattedDate = property?.createdAt
    ? new Date(property.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date not available";

  const handleShare = async () => {
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

  const handleEnquiry = () => {
    setPropertyModalVisible(true);
    fetchReferredDetails();
  };

  const fetchReferredDetails = async () => {
    if (!userDetails?.ReferredBy) {
      setReferralError("No referral information available");
      setLoadingReferral(false);
      return;
    }

    try {
      setLoadingReferral(true);
      setReferralError(null);
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${API_URL}/properties/getPropertyreffered`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({ referredBy: userDetails.ReferredBy }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === "success") {
        setReferredInfo(data.referredByDetails);
      } else {
        setReferralError(data.message || "No referral information found");
      }
    } catch (error) {
      console.error("Error fetching referredBy info:", error);
      setReferralError("Failed to fetch referral information");
    } finally {
      setLoadingReferral(false);
    }
  };

  const formatKey = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

  const renderDynamicValue = (value, indent = 0) => {
    if (value === null || value === undefined)
      return <Text style={styles.dynamicDataValue}>N/A</Text>;

    if (Array.isArray(value)) {
      if (value.length === 0)
        return <Text style={styles.dynamicDataValue}>Empty</Text>;
      return (
        <View style={{ marginLeft: indent * 10 }}>
          {value.map((item, index) => (
            <View key={index} style={styles.arrayItem}>
              <Text style={styles.dynamicDataValue}>{index + 1}.</Text>
              {renderDynamicValue(item, indent + 1)}
            </View>
          ))}
        </View>
      );
    }

    if (typeof value === "object") {
      return (
        <View style={{ marginLeft: indent * 10 }}>
          {Object.entries(value).map(([subKey, subValue]) => (
            <View key={subKey} style={styles.nestedItem}>
              <Text style={styles.dynamicDataKey}>{formatKey(subKey)}:</Text>
              <View style={styles.dynamicDataValueContainer}>
                {renderDynamicValue(subValue, indent + 1)}
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (typeof value === "boolean")
      return (
        <Text style={styles.dynamicDataValue}>{value ? "Yes" : "No"}</Text>
      );

    return <Text style={styles.dynamicDataValue}>{value.toString()}</Text>;
  };

  const renderImageSlider = () => {
    if (!property?.images || property.images.length === 0) {
      return (
        <Image
          source={require("../../assets/logo.png")}
          style={styles.image}
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
          {property.images.map((image, index) => (
            <Image
              key={index}
              source={image}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {property.images.length > 1 && (
          <View style={styles.pagination}>
            {property.images.map((_, index) => (
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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Property data not available</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderImageSlider()}

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {property?.propertyType || property?.title || "Property"}
            </Text>
            <Text style={styles.price}>
              {property?.price || "Price not available"}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.detailText}>
                {property?.location || "Location not specified"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.detailText}>Posted on: {formattedDate}</Text>
            </View>

            {property?.propertyDetails && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {property.propertyDetails.toString()}
                </Text>
              </View>
            )}

            {property?.dynamicData &&
              Object.keys(property.dynamicData).length > 0 && (
                <View style={styles.dynamicDataContainer}>
                  <Text style={styles.sectionTitle}>Additional Details</Text>
                  {Object.entries(property.dynamicData).map(([key, value]) => (
                    <View key={key} style={styles.dynamicDataRow}>
                      <Text style={styles.dynamicDataKey}>
                        {formatKey(key)}:
                      </Text>
                      <View style={styles.dynamicDataValueContainer}>
                        {renderDynamicValue(value)}
                      </View>
                    </View>
                  ))}
                </View>
              )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
          onPress={handleShare}
        >
          <FontAwesome name="share" size={20} color="white" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#D81B60" }]}
          onPress={handleEnquiry}
        >
          {/* <FontAwesome name="envelope" size={20} color="white" /> */}
          <Text style={styles.actionButtonText}>Enquiry Now</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isPropertyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPropertyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {loadingReferral ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : referralError ? (
              <>
                <Image
                  source={require("../../assets/man.png")}
                  style={styles.agentLogo}
                />
                <Text style={styles.modalTitle}>Referral Information</Text>
                <Text style={styles.modalText}>{referralError}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPropertyModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : referredInfo ? (
              <>
                <Image
                  source={require("../../assets/man.png")}
                  style={styles.agentLogo}
                />
                <Text style={styles.modalTitle}>Referred By</Text>
                <Text style={styles.modalText}>Name: {referredInfo.name}</Text>
                <Text style={styles.modalText}>
                  Mobile: {referredInfo.Number}
                </Text>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${referredInfo.Number}`)}
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
            ) : (
              <>
                <Image
                  source={require("../../assets/man.png")}
                  style={styles.agentLogo}
                />
                <Text style={styles.modalTitle}>No Referral Found</Text>
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
    backgroundColor: "#f8f8f8",
    paddingBottom:"10%"
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  imageSliderContainer: {
    position: "relative",
  },
  image: {
    width: width,
    height: 250,
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
  contentContainer: {
    padding: 15,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  detailSection: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  descriptionContainer: {},
  descriptionText: {
    fontSize: 14,
    color: "#555",
  },
  dynamicDataContainer: {
    marginTop: 10,
  },
  dynamicDataRow: {
    marginBottom: 10,
  },
  dynamicDataKey: {
    fontWeight: "bold",
    color: "#333",
  },
  dynamicDataValueContainer: {
    marginLeft: 5,
  },
  dynamicDataValue: {
    color: "#555",
  },
  arrayItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nestedItem: {
    marginBottom: 5,
  },
  buttonContainer: {
    position: "absolute",
    bottom: "8%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: width * 0.8,
  },
  agentLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#333",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    marginTop: 10,
  },
  callButtonText: {
    color: "white",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    color: "#007AFF",
    fontSize: 16,
  },
});

export default PropertyDetailsScreen;
