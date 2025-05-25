import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  TextInput,
  FlatList,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropertyCards from "./PropertyCards";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = Dimensions.get("window").width;

const ViewAllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({ Contituency: "" });
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [postedProperty, setPostedProperty] = useState(null);
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
  const [userType, setUserType] = useState("");
  const navigations = useNavigation();

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const type = await AsyncStorage.getItem("userType");
      setUserType(type);

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
      } else {
        console.warn("API returned empty data.");
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

  const handleShare = (property) => {
    let shareImage;
    if (Array.isArray(property.photo) && property.photo.length > 0) {
      shareImage = property.photo[0].startsWith("http")
        ? property.photo[0]
        : `${API_URL}${property.photo[0]}`;
    } else if (property.photo) {
      shareImage = property.photo.startsWith("http")
        ? property.photo
        : `${API_URL}${property.photo}`;
    } else {
      shareImage = null;
    }

    setPostedProperty({
      propertyType: property.propertyType,
      photo: shareImage,
      location: property.location,
      price: property.price,
      PostedBy: property.PostedBy || details?.Number || "",
      fullName: property.fullName || details?.name || "Wealth Associate",
    });
  };

  const getLastFourChars = (id) => {
    return id ? id.slice(-4) : "N/A";
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

  // Extract unique property types, locations, and prices for filtering
  const uniquePropertyTypes = [
    ...new Set(properties.map((item) => item.propertyType)),
  ];
  const uniqueLocations = [...new Set(properties.map((item) => item.location))];
  const uniquePrices = [
    ...new Set(properties.map((item) => Math.floor(item.price / 100000))),
  ].sort((a, b) => a - b);

  // Apply filters based on selected criteria
  const applyFilters = () => {
    let filteredProperties = [...properties]; // Create a copy of the original properties

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
    setFilterModalVisible(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterCriteria({ propertyType: "", location: "", price: "" });
    fetchProperties();
    setFilterModalVisible(false);
  };

  // Categorize properties with search filtering
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

  const renderPropertyImage = (property) => {
    const scrollRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const images = Array.isArray(property.photo) ? property.photo : [];

    // Auto-scroll every 3 seconds
    useEffect(() => {
      if (!images.length) return;

      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        scrollRef.current?.scrollTo({
          x: nextIndex * (SCREEN_WIDTH - 40),
          animated: true,
        });
      }, 3000);

      return () => clearInterval(interval);
    }, [currentIndex, images.length]);

    // Handle horizontal scroll view with swiping
    if (images.length > 0) {
      return (
        <View style={{ marginBottom: 10 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
            onMomentumScrollEnd={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const newIndex = Math.round(offsetX / (SCREEN_WIDTH - 40));
              setCurrentIndex(newIndex);
            }}
          >
            {images.map((item, index) => (
              <Image
                key={index}
                source={{
                  uri: item.startsWith("http") ? item : `${API_URL}${item}`,
                }}
                style={{
                  width: SCREEN_WIDTH - 40,
                  height: 200,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination dots */}
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.activeDot : null,
                ]}
                onPress={() => {
                  setCurrentIndex(index);
                  scrollRef.current?.scrollTo({
                    x: index * (SCREEN_WIDTH - 40),
                    animated: true,
                  });
                }}
              />
            ))}
          </View>
        </View>
      );
    }

    // Single image
    else if (typeof property.photo === "string") {
      return (
        <Image
          source={{
            uri: property.photo.startsWith("http")
              ? property.photo
              : `${API_URL}${property.photo}`,
          }}
          style={{ width: SCREEN_WIDTH - 40, height: 200, borderRadius: 10 }}
          resizeMode="cover"
        />
      );
    }

    // Fallback image
    else {
      return (
        <Image
          source={require("../../assets/logo.png")}
          style={{ width: SCREEN_WIDTH - 40, height: 200, borderRadius: 10 }}
          resizeMode="contain"
        />
      );
    }
  };

  const handlePropertyPress = (property) => {
    if (!property?._id) {
      console.error("Property ID is missing");
      return;
    }

    let images = [];
    if (Array.isArray(property.photo)) {
      images = property.photo.map((photo) => ({
        uri: photo.startsWith("http") ? photo : `${API_URL}${photo}`,
      }));
    } else if (property.photo) {
      images = [
        {
          uri: property.photo.startsWith("http")
            ? property.photo
            : `${API_URL}${property.photo}`,
        },
      ];
    } else {
      images = [require("../../assets/logo.png")];
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

    navigations.navigate("PropertyDetails", {
      property: {
        ...property,
        id: property._id,
        price: formattedPrice,
        images: images,
      },
    });
  };

  const RenderPropertyCard = ({ property }) => {
    const propertyTag = getPropertyTag(property.createdAt);
    const propertyId = getLastFourChars(property._id);

    return (
      <TouchableOpacity
        onPress={() => handlePropertyPress(property)}
        activeOpacity={0.8}
      >
        <View style={styles.propertyCard}>
          {renderPropertyImage(property)}

          <View
            style={[
              styles.statusTag,
              {
                backgroundColor:
                  propertyTag === "Approved Property" ? "#4CAF50" : "#FF9800",
              },
            ]}
          >
            <Text style={styles.statusText}>{propertyTag}</Text>
          </View>

          <View style={styles.propertyIdContainer}>
            <Text style={styles.propertyId}>ID: {propertyId}</Text>
          </View>

          <Text style={styles.cardTitle}>{property.propertyType}</Text>
          {/* <Text style={styles.cardSubtitle}>
            {property.propertyDetails || "20 sqft"}
          </Text> */}
          <Text style={styles.cardSubtitle}>Location: {property.location}</Text>
          <Text style={styles.cardPrice}>
            ₹ {parseInt(property.price).toLocaleString()}
          </Text>

          <View style={styles.cardButtons}>
            <TouchableOpacity
              style={styles.enquiryBtn}
              onPress={() => handleEnquiryNow(property)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Enquiry Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => handleShare(property)}
            >
              <FontAwesome name="share" size={16} color="white" />
              <Text
                style={{ color: "white", marginLeft: 5, fontWeight: "bold" }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>All Properties</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Property ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Filter Properties</Text>

            {/* Property Type Filter */}
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

            {/* Location Filter */}
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

            {/* Price Filter */}
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
                        showPriceDropdown ? "arrow-drop-up" : "arrow-drop-down"
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

            {/* Apply and Reset Buttons */}
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

      {/* Regular Properties */}
      {regularProperties.length > 0 && (
        <>
          <SectionHeader title="Regular Properties" />
          <FlatList
            data={regularProperties}
            renderItem={({ item }) => <RenderPropertyCard property={item} />}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </>
      )}

      {/* Approved Properties */}
      {approvedProperties.length > 0 && (
        <>
          <SectionHeader title="Approved Properties" />
          <FlatList
            data={approvedProperties}
            renderItem={({ item }) => <RenderPropertyCard property={item} />}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </>
      )}

      {/* Wealth Properties */}
      {wealthProperties.length > 0 && (
        <>
          <SectionHeader title="Wealth Properties" />
          <FlatList
            data={wealthProperties}
            renderItem={({ item }) => <RenderPropertyCard property={item} />}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </>
      )}

      {/* Listed Properties */}
      {listedProperties.length > 0 && (
        <>
          <SectionHeader title="Listed Properties" />
          <FlatList
            data={listedProperties}
            renderItem={({ item }) => <RenderPropertyCard property={item} />}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </>
      )}

      {/* Property Modal */}
      <Modal
        visible={isPropertyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPropertyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {!referredInfo ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <>
                <Image
                  source={require("../../assets/man.png")}
                  style={styles.agentLogo}
                />
                <Text style={styles.modalTitle}>Referred By</Text>
                <Text style={styles.modalText}>Name: {referredInfo.name}</Text>
                <Text style={styles.modalText}>
                  Mobile: {referredInfo.mobileNumber || referredInfo.Number}
                </Text>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() =>
                    Linking.openURL(
                      `tel:${referredInfo.mobileNumber || referredInfo.Number}`
                    )
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

      {/* Share Property Modal */}
      <Modal
        visible={!!postedProperty}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPostedProperty(null)}
      >
        <View style={styles.modalContainer}>
          {postedProperty && (
            <PropertyCards
              property={postedProperty}
              closeModal={() => setPostedProperty(null)}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  propertyCardContainer: {
    marginBottom: 15,
  },
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  filterButton: {
    backgroundColor: "#E91E63",
    padding: 10,
    borderRadius: 5,
  },
  filterButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  propertyCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusTag: {
    position: "absolute",
    top: 20,
    left: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  propertyIdContainer: {
    alignItems: "flex-end",
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
    // margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    // padding: 20,
    elevation: 5,
    borderRadius:10
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  filterGroup: {
    marginBottom: 15,
  },
  inputContainer: {
    width: "100%",
    position: "relative",
  },
  inputWrapper: {
    position: "relative",
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
  },
  scrollView: {
    maxHeight: 200,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#000",
  },
});

export default ViewAllProperties;
