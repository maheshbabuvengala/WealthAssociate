import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Share,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";

const { width } = Dimensions.get("window");

const PropertyDetailsScreen = ({ route, navigation }) => {
  const { property } = route.params;
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [referredInfo, setReferredInfo] = useState(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // Format the createdAt date with null check
  const formattedDate = property?.createdAt
    ? new Date(property.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date not available";

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await fetch(`${API_URL}/agent/AgentDetails`, {
          method: "GET",
          headers: {
            token: token || "",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserDetails(data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleShare = async () => {
    try {
      // Prepare property data in the same format as HomeScreen
      const shareProperty = {
        photo: property?.photo ? `${API_URL}${property.photo}` : null,
        location: property?.location || "Location not specified",
        price: property?.price || "Price not available",
        propertyType: property?.propertyType || "Property",
        PostedBy: property?.PostedBy || userDetails?.Number || "",
        fullName: property?.fullName || userDetails?.name || "Wealth Associate",
      };

      // Navigate to PropertyCard screen with the property data
      navigation.navigate("PropertyCard", {
        property: shareProperty,
      });
    } catch (error) {
      console.error("Error sharing property:", error);
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
          body: JSON.stringify({
            referredBy: userDetails.ReferredBy,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  // Helper function to format keys (camelCase to Title Case)
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Recursive function to render different value types
  const renderDynamicValue = (value, indent = 0) => {
    if (value === null || value === undefined) {
      return <Text style={styles.dynamicDataValue}>N/A</Text>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text style={styles.dynamicDataValue}>Empty</Text>;
      }
      return (
        <View style={{ marginLeft: indent * 10 }}>
          {value.map((item, index) => (
            <View key={index} style={styles.arrayItem}>
              <Text style={styles.dynamicDataValue}>
                {index + 1}. {renderDynamicValue(item, indent + 1)}
              </Text>
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

    if (typeof value === "boolean") {
      return (
        <Text style={styles.dynamicDataValue}>{value ? "Yes" : "No"}</Text>
      );
    }

    return <Text style={styles.dynamicDataValue}>{value.toString()}</Text>;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
          <View style={{ width: 24 }} /> {/* For alignment */}
        </View>

        <Image
          source={property?.image || require("../../assets/logo.png")}
          style={styles.image}
          resizeMode="cover"
        />

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

            {/* Display dynamic data if available */}
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

      {/* Fixed buttons at the bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
          onPress={handleShare}
        >
          <FontAwesome name="share" size={20} color="white" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={handleEnquiry}
        >
          <FontAwesome name="envelope" size={20} color="white" />
          <Text style={styles.actionButtonText}>Enquire</Text>
        </TouchableOpacity>
      </View>

      {/* Enquiry Modal */}
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
  },
  scrollContent: {
    paddingBottom: 80, // Add padding to prevent content from being hidden behind buttons
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
  image: {
    width: "100%",
    height: width * 0.7,
    backgroundColor: "#eee",
  },
  contentContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginLeft: 10,
  },
  detailSection: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 15,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  dynamicDataContainer: {
    marginTop: 15,
  },
  dynamicDataRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dynamicDataKey: {
    fontWeight: "bold",
    width: 120,
    color: "#555",
  },
  dynamicDataValue: {
    flex: 1,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "relative",
    bottom: "10%",
    left: 0,
    right: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
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
});

export default PropertyDetailsScreen;
