import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Animated,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { API_URL } from "../../data/ApiUrl";
import { getCategorizedProperties } from "../MainScreen/PropertyStock";
import PropertyCard from "../components/home/PropertyCard";
import PropertyModal from "../components/home/PropertyModal";

const { width, height } = Dimensions.get("window");
const IS_WEB = Platform.OS === "web";
const IS_SMALL_SCREEN = width < 450;

const ViewAllProperties = ({ route }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [userType, setUserType] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [referredInfo, setReferredInfo] = useState();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    propertyType: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [likedProperties, setLikedProperties] = useState([]);
  const [propertyCategories, setPropertyCategories] = useState({
    regularProperties: [],
    approvedProperties: [],
    wealthProperties: [],
    listedProperties: [],
  });

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const type = await AsyncStorage.getItem("userType");
      setUserType(type);

      const storedLikes = await AsyncStorage.getItem("likedProperties");
      if (storedLikes) {
        setLikedProperties(JSON.parse(storedLikes));
      }

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
          token: `${token}` || "",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newDetails = await response.json();
      setDetails(newDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const categories = await getCategorizedProperties();
      setPropertyCategories(categories);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferredInfoFromStorage = async () => {
    try {
      const data = await AsyncStorage.getItem("referredAddedByInfo");
      if (data) {
        setReferredInfo(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load referred info:", error);
    }
  };

  useEffect(() => {
    if (isPropertyModalVisible) {
      loadReferredInfoFromStorage();
    }
  }, [isPropertyModalVisible]);

  useEffect(() => {
    getDetails();
    fetchProperties();
    loadReferredInfoFromStorage();
  }, []);

  const handlePropertyPress = (property) => {
    if (!property?._id) {
      console.error("Property ID is missing");
      return;
    }

    const images = normalizeImageSources(property).map((uri) => ({
      uri: uri,
    }));

    let formattedPrice = "Price not available";
    try {
      const priceValue = parseInt(property.price);
      if (!isNaN(priceValue)) {
        formattedPrice = `₹${priceValue.toLocaleString()}`;
      }
    } catch (e) {
      console.error("Error formatting price:", e);
    }

    navigation.navigate("PropertyDetails", {
      property: {
        ...property,
        id: property._id,
        price: formattedPrice,
        images: images.length > 0 ? images : [require("../../assets/logo.png")],
      },
    });
  };

  const handleShare = (property) => {
    const images = normalizeImageSources(property);
    let shareImage = images.length > 0 ? images[0] : null;

    let formattedPrice = "Price not available";
    if (property.price) {
      try {
        const priceValue = parseInt(property.price);
        if (!isNaN(priceValue)) {
          formattedPrice = `₹${priceValue.toLocaleString()}`;
        }
      } catch (e) {
        console.error("Error formatting price:", e);
      }
    }

    navigation.navigate("PropertyCard", {
      property: {
        photo: shareImage,
        location: property.location || "Location not specified",
        price: formattedPrice,
        propertyType: property.propertyType || "Property",
        PostedBy: property.PostedBy || details?.Number || "",
        fullName: property.fullName || details?.name || "Wealth Associate",
      },
    });
  };

  const handleEnquiryNow = (property) => {
    setSelectedProperty(property);
    setPropertyModalVisible(true);
  };

  const normalizeImageSources = (property) => {
    if (!property) return [];

    if (Array.isArray(property.newImageUrls)) {
      return property.newImageUrls.filter(
        (url) => url && typeof url === "string"
      );
    } else if (
      typeof property.newImageUrls === "string" &&
      property.newImageUrls
    ) {
      return [property.newImageUrls];
    }

    if (Array.isArray(property.imageUrls)) {
      return property.imageUrls.filter((url) => url && typeof url === "string");
    } else if (typeof property.imageUrls === "string" && property.imageUrls) {
      return [property.imageUrls];
    }

    return [];
  };

  const toggleLike = async (propertyId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));

      const newLikedStatus = !likedProperties.includes(propertyId);
      let updatedLikes;

      if (newLikedStatus) {
        updatedLikes = [...likedProperties, propertyId];
      } else {
        updatedLikes = likedProperties.filter((id) => id !== propertyId);
      }
      setLikedProperties(updatedLikes);

      await AsyncStorage.setItem(
        "likedProperties",
        JSON.stringify(updatedLikes)
      );

      await fetch(`${API_URL}/properties/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
        body: JSON.stringify({
          propertyId: propertyId,
          like: newLikedStatus,
          userName: userDetails?.FullName || details?.FullName || "User",
          mobileNumber:
            userDetails?.MobileNumber || details?.MobileNumber || "",
        }),
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const filterProperties = () => {
    let filtered = [];

    switch (activeTab) {
      case "regular":
        filtered = propertyCategories.regularProperties;
        break;
      case "approved":
        filtered = propertyCategories.approvedProperties;
        break;
      case "wealth":
        filtered = propertyCategories.wealthProperties;
        break;
      case "listed":
        filtered = propertyCategories.listedProperties;
        break;
      default:
        filtered = [
          ...propertyCategories.regularProperties,
          ...propertyCategories.approvedProperties,
          ...propertyCategories.wealthProperties,
          ...propertyCategories.listedProperties,
        ];
    }

    if (searchQuery) {
      filtered = filtered.filter((property) => {
        const propertyId = property._id
          ? property._id.slice(-4).toLowerCase()
          : "";
        return (
          propertyId.includes(searchQuery.toLowerCase()) ||
          (property.location &&
            property.location
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (property.propertyType &&
            property.propertyType
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
        );
      });
    }

    if (filterCriteria.propertyType) {
      filtered = filtered.filter(
        (property) => property.propertyType === filterCriteria.propertyType
      );
    }

    if (filterCriteria.location) {
      filtered = filtered.filter(
        (property) => property.location === filterCriteria.location
      );
    }

    if (filterCriteria.minPrice) {
      const minPriceValue = parseFloat(filterCriteria.minPrice) * 100000;
      filtered = filtered.filter((property) => property.price >= minPriceValue);
    }

    if (filterCriteria.maxPrice) {
      const maxPriceValue = parseFloat(filterCriteria.maxPrice) * 100000;
      filtered = filtered.filter((property) => property.price <= maxPriceValue);
    }

    return filtered;
  };

  const getUniqueValues = (key) => {
    const allProperties = [
      ...propertyCategories.regularProperties,
      ...propertyCategories.approvedProperties,
      ...propertyCategories.wealthProperties,
      ...propertyCategories.listedProperties,
    ];
    return [...new Set(allProperties.map((item) => item[key]))].filter(Boolean);
  };

  const resetFilters = () => {
    setFilterCriteria({
      propertyType: "",
      location: "",
      minPrice: "",
      maxPrice: "",
    });
    setSearchQuery("");
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const renderFilterModal = () => (
    <Modal
      visible={isFilterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.filterModalContent,
                IS_SMALL_SCREEN
                  ? styles.smallScreenModal
                  : styles.largeScreenModal,
              ]}
            >
              <View style={styles.modalHandle} />
              <Text style={styles.filterHeader}>Filter Properties</Text>

              <ScrollView
                style={styles.filterScrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Property Type</Text>
                  <View style={styles.filterOptionsContainer}>
                    {getUniqueValues("propertyType").map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.filterOption,
                          filterCriteria.propertyType === item &&
                            styles.selectedFilterOption,
                        ]}
                        onPress={() =>
                          setFilterCriteria({
                            ...filterCriteria,
                            propertyType:
                              filterCriteria.propertyType === item ? "" : item,
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={styles.filterOptionText}>{item}</Text>
                        {filterCriteria.propertyType === item && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#E91E63"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Location</Text>
                  <View style={styles.filterOptionsContainer}>
                    {getUniqueValues("location").map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.filterOption,
                          filterCriteria.location === item &&
                            styles.selectedFilterOption,
                        ]}
                        onPress={() =>
                          setFilterCriteria({
                            ...filterCriteria,
                            location:
                              filterCriteria.location === item ? "" : item,
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={styles.filterOptionText}>{item}</Text>
                        {filterCriteria.location === item && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#E91E63"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Price Range (in lakhs)</Text>
                  <View style={styles.priceRangeContainer}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      value={filterCriteria.minPrice}
                      onChangeText={(text) =>
                        setFilterCriteria({ ...filterCriteria, minPrice: text })
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.priceRangeSeparator}>to</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      value={filterCriteria.maxPrice}
                      onChangeText={(text) =>
                        setFilterCriteria({ ...filterCriteria, maxPrice: text })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.filterButtonsContainer}>
                <TouchableOpacity
                  style={[styles.filterButton, styles.resetFilterButton]}
                  onPress={resetFilters}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetFilterButtonText}>Reset All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, styles.applyFilterButton]}
                  onPress={applyFilters}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LottieView
          source={require("../../assets/animations/home[1].json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }

  const filteredProperties = filterProperties();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Property ID, Location or Type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "all" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("all")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "all" && styles.activeTabButtonText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "regular" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("regular")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "regular" && styles.activeTabButtonText,
              ]}
            >
              Regular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "approved" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("approved")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "approved" && styles.activeTabButtonText,
              ]}
            >
              Approved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "wealth" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("wealth")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "wealth" && styles.activeTabButtonText,
              ]}
            >
              Wealth
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "listed" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("listed")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "listed" && styles.activeTabButtonText,
              ]}
            >
              Listed
            </Text>
          </TouchableOpacity>
        </View>

        {filteredProperties.length > 0 ? (
          <ScrollView contentContainerStyle={styles.propertyListContainer}>
            <View
              style={
                IS_WEB ? styles.webPropertyGrid : styles.mobilePropertyList
              }
            >
              {filteredProperties.map((item) => (
                <View
                  key={item._id}
                  style={
                    IS_WEB ? styles.webPropertyItem : styles.mobilePropertyItem
                  }
                >
                  <PropertyCard
                    property={item}
                    onPress={() => handlePropertyPress(item)}
                    onEnquiryPress={() => handleEnquiryNow(item)}
                    onSharePress={() => handleShare(item)}
                    isLiked={likedProperties.includes(item._id)}
                    onLikePress={() => toggleLike(item._id)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No properties found</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderFilterModal()}

        <PropertyModal
          visible={isPropertyModalVisible}
          onClose={() => setPropertyModalVisible(false)}
          property={selectedProperty}
          referredInfo={referredInfo}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8E3E7",
    paddingBottom: Platform.OS === "web" ? "45%" : "20%",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D8E3E7",
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    paddingHorizontal: 15,
    width: "100%",
  },
  searchContainer: {
    flex: 1,
    marginRight: 10,
    position: "relative",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: 15,
    top: 10,
  },
  filterButton: {
    backgroundColor: "#E91E63",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#E91E63",
  },
  tabButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  activeTabButtonText: {
    color: "#fff",
  },
  propertyListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  webPropertyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  webPropertyItem: {
    width: "32%",
    marginRight: "1%",
    marginBottom: 15,
  },
  mobilePropertyList: {
    width: "100%",
  },
  mobilePropertyItem: {
    width: "100%",
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#E91E63",
    padding: 12,
    borderRadius: 5,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  filterModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    maxHeight: height * 0.85,
  },
  smallScreenModal: {
    width: "100%",
  },
  largeScreenModal: {
    width: Platform.OS === "web" ? "50%" : "100%",
    alignSelf: "center",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 15,
  },
  filterHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  filterScrollContainer: {
    maxHeight: height * 0.6,
    paddingHorizontal: 5,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  filterOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedFilterOption: {
    backgroundColor: "#F8D7DA",
    borderColor: "#E91E63",
  },
  filterOptionText: {
    marginRight: 4,
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  priceInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  priceRangeSeparator: {
    marginHorizontal: 8,
    color: "#666",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  resetFilterButton: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  applyFilterButton: {
    backgroundColor: "#E91E63",
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  resetFilterButtonText: {
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default ViewAllProperties;
