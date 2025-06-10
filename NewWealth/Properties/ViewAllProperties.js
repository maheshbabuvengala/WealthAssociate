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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

import { API_URL } from "../../data/ApiUrl";
import PropertyCard from "../components/home/PropertyCard";
import SectionHeader from "../components/home/SectionHeader";
import PropertyModal from "../components/home/PropertyModal";
import LazyImage from "../components/home/LazyImage";

const { width, height } = Dimensions.get("window");
const PROPERTIES_PER_PAGE = 20;
const IS_WEB = Platform.OS === "web";
const ITEMS_PER_ROW = IS_WEB ? 3 : 1; // 3 for web, 1 for mobile

const ViewAllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [userType, setUserType] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [referredInfo, setReferredInfo] = useState(null);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    propertyType: "",
    location: "",
    price: "",
  });
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] =
    useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [likedProperties, setLikedProperties] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scrollViewRef = useRef(null);

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

  useEffect(() => {
    console.log("Page changed to:", currentPage);
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    }, 100);
  }, [currentPage]);

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
        case "ReferralAssociate":
          endpoint = `${API_URL}/agent/AgentDetails`;
          break;
        case "Customer":
          endpoint = `${API_URL}/customer/getcustomer`;
          break;
        case "CoreMember":
          endpoint = `${API_URL}/core/getcore`;
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
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties/getApproveProperty`);
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setProperties(data);
        const total = Math.ceil(data.length / PROPERTIES_PER_PAGE);
        setTotalPages(total);
      } else {
        console.warn("API returned empty data.");
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTag = (createdAt) => {
    if (!createdAt) return "Listed Property";

    const currentDate = new Date();
    const propertyDate = new Date(createdAt);
    const timeDifference = currentDate - propertyDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference <= 3) return "Regular Property";
    if (daysDifference >= 4 && daysDifference <= 17) return "Approved Property";
    if (daysDifference >= 18 && daysDifference <= 25) return "Wealth Property";
    return "Listed Property";
  };

  const sortPropertiesByConstituency = (properties) => {
    if (!details.Contituency) return properties;

    return [...properties].sort((a, b) => {
      const aInConstituency = a.location?.includes(details.Contituency);
      const bInConstituency = b.location?.includes(details.Contituency);

      if (aInConstituency && !bInConstituency) return -1;
      if (!aInConstituency && bInConstituency) return 1;
      return 0;
    });
  };

  const handleEnquiryNow = (property) => {
    setSelectedProperty(property);
    setPropertyModalVisible(true);
  };

  const filterProperties = (properties) => {
    if (!searchQuery) return properties;

    return properties.filter((property) => {
      const propertyId = property._id
        ? property._id.slice(-4).toLowerCase()
        : "";
      return propertyId.includes(searchQuery.toLowerCase());
    });
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
    const fetchReferredDetails = async () => {
      if (!details?.ReferredBy) return;

      try {
        const response = await fetch(
          `${API_URL}/properties/getPropertyreffered`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token: (await AsyncStorage.getItem("authToken")) || "",
            },
            body: JSON.stringify({
              referredBy: details.ReferredBy,
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
          console.error("API returned unsuccessful status:", data);
        }
      } catch (error) {
        console.error("Error fetching referredBy info:", error);
      }
    };

    fetchReferredDetails();
  }, [details?.ReferredBy]);

  useEffect(() => {
    getDetails();
    fetchProperties();
  }, []);

  useEffect(() => {
    console.log("Page changed to:", currentPage);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  }, [currentPage]);

  const uniquePropertyTypes = [
    ...new Set(properties.map((item) => item.propertyType)),
  ];
  const uniqueLocations = [...new Set(properties.map((item) => item.location))];
  const uniquePrices = [
    ...new Set(properties.map((item) => Math.floor(item.price / 100000))),
  ].sort((a, b) => a - b);

  const applyFilters = () => {
    let filteredProperties = [...properties];

    if (filterCriteria.propertyType) {
      filteredProperties = filteredProperties.filter(
        (item) => item.propertyType === filterCriteria.propertyType
      );
    }

    if (filterCriteria.location) {
      filteredProperties = filteredProperties.filter(
        (item) => item.location === filterCriteria.location
      );
    }

    if (filterCriteria.price) {
      filteredProperties = filteredProperties.filter(
        (item) => Math.floor(item.price / 100000) === filterCriteria.price
      );
    }

    setProperties(filteredProperties);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE));
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setFilterCriteria({ propertyType: "", location: "", price: "" });
    fetchProperties();
    setFilterModalVisible(false);
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

  const regularProperties = sortPropertiesByConstituency(
    filterProperties(
      properties.filter(
        (property) => getPropertyTag(property.createdAt) === "Regular Property"
      )
    )
  );
  const approvedProperties = sortPropertiesByConstituency(
    filterProperties(
      properties.filter(
        (property) => getPropertyTag(property.createdAt) === "Approved Property"
      )
    )
  );
  const wealthProperties = sortPropertiesByConstituency(
    filterProperties(
      properties.filter(
        (property) => getPropertyTag(property.createdAt) === "Wealth Property"
      )
    )
  );
  const listedProperties = sortPropertiesByConstituency(
    filterProperties(
      properties.filter(
        (property) => getPropertyTag(property.createdAt) === "Listed Property"
      )
    )
  );

  const getFilteredProperties = () => {
    switch (activeTab) {
      case "regular":
        return regularProperties;
      case "approved":
        return approvedProperties;
      case "wealth":
        return wealthProperties;
      case "listed":
        return listedProperties;
      default:
        return sortPropertiesByConstituency(filterProperties(properties));
    }
  };

  const getPaginatedProperties = () => {
    const filtered = getFilteredProperties();
    const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
    const endIndex = startIndex + PROPERTIES_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const renderPagination = () => {
    const filteredProperties = getFilteredProperties();
    const totalFilteredPages = Math.ceil(
      filteredProperties.length / PROPERTIES_PER_PAGE
    );

    if (totalFilteredPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalFilteredPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pageNumbersContainer}
        >
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
            <TouchableOpacity
              key={page}
              style={[
                styles.pageNumber,
                currentPage === page && styles.activePage,
              ]}
              onPress={() => setCurrentPage(page)}
            >
              <Text
                style={
                  currentPage === page
                    ? styles.activePageText
                    : styles.pageNumberText
                }
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === totalFilteredPages && styles.disabledButton,
          ]}
          onPress={() =>
            setCurrentPage(Math.min(totalFilteredPages, currentPage + 1))
          }
          disabled={currentPage === totalFilteredPages}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

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

  const chunkArray = (array, chunkSize) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

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
              placeholder="Search by Property ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {renderPagination()}

        <ScrollView
          ref={scrollViewRef}
          style={styles.propertyScrollView}
          contentContainerStyle={styles.propertyGridContainer}
        >
          {getPaginatedProperties().length > 0 ? (
            chunkArray(getPaginatedProperties(), ITEMS_PER_ROW).map(
              (row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.propertyRow}>
                  {row.map((item) => (
                    <View
                      key={item._id}
                      style={[
                        styles.propertyItemContainer,
                        IS_WEB && { width: `${100 / ITEMS_PER_ROW}%` },
                      ]}
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
                  {row.length < ITEMS_PER_ROW &&
                    Array(ITEMS_PER_ROW - row.length)
                      .fill()
                      .map((_, index) => (
                        <View
                          key={`empty-${rowIndex}-${index}`}
                          style={[
                            styles.propertyItemContainer,
                            IS_WEB && { width: `${100 / ITEMS_PER_ROW}%` },
                          ]}
                        />
                      ))}
                </View>
              )
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No properties found</Text>
            </View>
          )}
        </ScrollView>
        <Modal
          visible={isFilterModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeading}>Filter Properties</Text>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Property Type</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TouchableOpacity
                      style={styles.filterButtonDropdown}
                      onPress={() =>
                        setShowPropertyTypeDropdown(!showPropertyTypeDropdown)
                      }
                    >
                      <Text style={styles.filterButtonText}>
                        {filterCriteria.propertyType ||
                          "-- Select Property Type --"}
                      </Text>
                      <MaterialIcons
                        name={
                          showPropertyTypeDropdown
                            ? "arrow-drop-up"
                            : "arrow-drop-down"
                        }
                        size={24}
                        color="#E82E5F"
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                    {showPropertyTypeDropdown && (
                      <View style={styles.dropdownContainer}>
                        <ScrollView style={styles.scrollView}>
                          <TouchableOpacity
                            style={styles.listItem}
                            onPress={() => {
                              setFilterCriteria({
                                ...filterCriteria,
                                propertyType: "",
                              });
                              setShowPropertyTypeDropdown(false);
                            }}
                          >
                            <Text>-- Select Property Type --</Text>
                          </TouchableOpacity>
                          {uniquePropertyTypes.map((type, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.listItem}
                              onPress={() => {
                                setFilterCriteria({
                                  ...filterCriteria,
                                  propertyType: type,
                                });
                                setShowPropertyTypeDropdown(false);
                              }}
                            >
                              <Text>{type}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Location</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TouchableOpacity
                      style={styles.filterButtonDropdown}
                      onPress={() =>
                        setShowLocationDropdown(!showLocationDropdown)
                      }
                    >
                      <Text style={styles.filterButtonText}>
                        {filterCriteria.location || "-- Select Location --"}
                      </Text>
                      <MaterialIcons
                        name={
                          showLocationDropdown
                            ? "arrow-drop-up"
                            : "arrow-drop-down"
                        }
                        size={24}
                        color="#E82E5F"
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                    {showLocationDropdown && (
                      <View style={styles.dropdownContainer}>
                        <ScrollView style={styles.scrollView}>
                          <TouchableOpacity
                            style={styles.listItem}
                            onPress={() => {
                              setFilterCriteria({
                                ...filterCriteria,
                                location: "",
                              });
                              setShowLocationDropdown(false);
                            }}
                          >
                            <Text>-- Select Location --</Text>
                          </TouchableOpacity>
                          {uniqueLocations.map((location, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.listItem}
                              onPress={() => {
                                setFilterCriteria({
                                  ...filterCriteria,
                                  location: location,
                                });
                                setShowLocationDropdown(false);
                              }}
                            >
                              <Text>{location}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Price (in lakhs)</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TouchableOpacity
                      style={styles.filterButtonDropdown}
                      onPress={() => setShowPriceDropdown(!showPriceDropdown)}
                    >
                      <Text style={styles.filterButtonText}>
                        {filterCriteria.price
                          ? `${filterCriteria.price} Lakh`
                          : "-- Select Price --"}
                      </Text>
                      <MaterialIcons
                        name={
                          showPriceDropdown
                            ? "arrow-drop-up"
                            : "arrow-drop-down"
                        }
                        size={24}
                        color="#E82E5F"
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                    {showPriceDropdown && (
                      <View style={styles.dropdownContainer}>
                        <ScrollView style={styles.scrollView}>
                          <TouchableOpacity
                            style={styles.listItem}
                            onPress={() => {
                              setFilterCriteria({
                                ...filterCriteria,
                                price: "",
                              });
                              setShowPriceDropdown(false);
                            }}
                          >
                            <Text>-- Select Price --</Text>
                          </TouchableOpacity>
                          {uniquePrices.map((price, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.listItem}
                              onPress={() => {
                                setFilterCriteria({
                                  ...filterCriteria,
                                  price: price,
                                });
                                setShowPriceDropdown(false);
                              }}
                            >
                              <Text>{price} Lakh</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.applyButton]}
                  onPress={applyFilters}
                >
                  <Text style={styles.modalButtonText}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.resetButton]}
                  onPress={resetFilters}
                >
                  <Text style={styles.modalButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <PropertyModal
          visible={isPropertyModalVisible}
          onClose={() => setPropertyModalVisible(false)}
          referredInfo={referredInfo || {}}
          property={selectedProperty || {}}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8E3E7",
    width: "100%",
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
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  filterButton: {
    backgroundColor: "#E91E63",
    padding: 10,
    borderRadius: 5,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyScrollView: {
    width: "100%",
    marginBottom: 10,
  },
  propertyGridContainer: {
    paddingHorizontal: Platform.OS === "web" ? 8 : 15,
  },
  propertyRow: {
    flexDirection: "row",
    justifyContent: Platform.OS === "web" ? "space-between" : "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  propertyItemContainer: {
    width: Platform.OS === "web" ? "32%" : "95%",
    marginBottom: Platform.OS === "web" ? 0 : 15,
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: Platform.OS === "web" ? "50%" : "90%",
    maxHeight: "80%",
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  filterGroup: {
    marginBottom: 15,
    width: "100%",
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    position: "relative",
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
  filterButtonDropdown: {
    width: "100%",
    height: 47,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButtonText: {
    flex: 1,
  },
  icon: {
    right: 0,
    top: 0,
  },
  dropdownContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    maxHeight: 200,
    width: "100%",
  },
  scrollView: {
    maxHeight: 200,
    width: "100%",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: "#E91E63",
  },
  resetButton: {
    backgroundColor: "#2196F3",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  pageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: "#E91E63",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pageNumber: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E91E63",
    minWidth: 35,
    alignItems: "center",
  },
  activePage: {
    backgroundColor: "#E91E63",
  },
  pageNumberText: {
    color: "#E91E63",
  },
  activePageText: {
    color: "#fff",
  },
});

export default ViewAllProperties;
