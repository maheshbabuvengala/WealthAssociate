import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PropertyCard from "./PropertyCard";
import { FlatList } from "react-native-gesture-handler";


const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [properties, setProperties] = useState([]);
  const [propertiess, setPropertiess] = useState([]);
  const [coreClients, setCoreClients] = useState([]);
  const [coreProjects, setCoreProjects] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [likedProperties, setLikedProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [referredInfo, setReferredInfo] = useState({
    name: "",
    mobileNumber: "",
  });

  const SCREEN_WIDTH = Dimensions.get("window").width;

  const navigation = useNavigation();
  const [postedProperty, setPostedProperty] = useState(null);

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const type = await AsyncStorage.getItem("userType");
      setUserType(type);

      // Load liked properties from storage
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCoreClients = async () => {
    try {
      const response = await fetch(`${API_URL}/coreclient/getallcoreclients`);
      const data = await response.json();
      setCoreClients(data);
    } catch (error) {
      console.error("Error fetching core clients:", error);
    }
  };

  const fetchCoreProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/coreproject/getallcoreprojects`);
      const data = await response.json();
      setCoreProjects(data);
    } catch (error) {
      console.error("Error fetching core projects:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/properties/getApproveProperty`);
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchPropertiess = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("Token not found in AsyncStorage");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `${API_URL}/requestProperty/getallrequestProperty`,
        {
          method: "GET",
          headers: {
            token: `${token}` || "",
          },
        }
      );
      const data = await response.json();

      const doneProperties = data.filter((item) => item.Approved === "Done");

      const formattedProperties = doneProperties.map((item) => ({
        id: item._id,
        title: item.propertyTitle,
        type: item.propertyType,
        location: item.location,
        budget: `₹${item.Budget.toLocaleString()}`,
        image: getImageByPropertyType(item.propertyType),
        createdAt: item.createdAt,
      }));

      setPropertiess(formattedProperties);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
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

  const getImageByPropertyType = (propertyType) => {
    switch (propertyType.toLowerCase()) {
      case "flat(apartment)":
      case "apartment":
        return require("../../assets/download.jpeg");
      case "land(opensite)":
      case "land":
        return require("../../assets/Land.jpg");
      case "house(individual)":
      case "house":
        return require("../../assets/house.png");
      case "villa":
        return require("../../assets/villa.jpg");
      case "agriculture land":
        return require("../../assets/agriculture.jpeg");
      case "commercial property":
        return require("../../assets/commercial.jpeg");
      case "commercial land":
        return require("../../assets/commland.jpeg");
      default:
        return require("../../assets/house.png");
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

  const getLastFourChars = (id) => {
    return id ? id.slice(-4) : "N/A";
  };

  const getLastFourCharss = (id) => {
    if (!id) return "N/A";
    return id.length > 4 ? id.slice(-4) : id;
  };

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err)
      );
    } else {
      alert("Website link not available");
    }
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

    navigation.navigate("PropertyCard", {
      property: {
        photo: shareImage,
        location: property.location || "Location not specified",
        price: property.price || "Price not available",
        propertyType: property.propertyType || "Property",
        PostedBy: property.PostedBy || details?.Number || "",
        fullName: property.fullName || details?.name || "Wealth Associate",
      },
    });
  };

  const handleIHave = (property) => {
    setSelectedProperty(property);
    setPropertyModalVisible(true);
  };

  const handleEnquiryNow = (property) => {
    setSelectedProperty(property);
    setPropertyModalVisible(true);
  };

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
    fetchCoreClients();
    fetchCoreProjects();
    fetchProperties();
    fetchPropertiess();
    loadReferredInfoFromStorage();
  }, []);

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

    navigation.navigate("PropertyDetails", {
      property: {
        ...property,
        id: property._id,
        price: formattedPrice,
        images: images,
      },
    });
  };

  const regularProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Regular Property"
  );
  const approvedProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Approved Property"
  );
  const wealthProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Wealth Property"
  );
  const listedProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Listed Property"
  );

  const showReferralCode = [
    "WealthAssociate",
    "Customer",
    "CoreMember",
    "ReferralAssociate",
  ].includes(userType);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

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
            onScrollBeginDrag={() => {
              // Clear interval when user starts scrolling manually
              clearInterval(interval);
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
          style={{ width: 260, height: 200, borderRadius: 10 }}
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

   const RenderPropertyCard = ({ property }) => {
  const propertyTag = getPropertyTag(property.createdAt);
  const propertyId = getLastFourChars(property._id);
  const [isLiked, setIsLiked] = useState(likedProperties.includes(property._id));

const toggleLike = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
    
    // Optimistically update the UI
    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);
    
    // Update local liked properties array
    let updatedLikes;
    if (newLikedStatus) {
      updatedLikes = [...likedProperties, property._id];
    } else {
      updatedLikes = likedProperties.filter(id => id !== property._id);
    }
    setLikedProperties(updatedLikes);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem("likedProperties", JSON.stringify(updatedLikes));
    
    // Send API request
    const response = await fetch(`${API_URL}/properties/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token || "",
      },
      body: JSON.stringify({
        propertyId: property._id,
        like: newLikedStatus,
        userName: userDetails?.FullName || details?.FullName || "User",
        mobileNumber: userDetails?.MobileNumber || details?.MobileNumber || "",
      }),
    });

    if (!response.ok) {
      // Revert changes if API call fails
      setIsLiked(!newLikedStatus);
      const storedLikes = await AsyncStorage.getItem("likedProperties");
      if (storedLikes) {
        setLikedProperties(JSON.parse(storedLikes));
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
};

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

        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={(e) => {
            e.stopPropagation();
            toggleLike();
          }}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#D81B60" : "#fff"} 
          />
        </TouchableOpacity>

        <Text style={styles.cardTitle}>{property.propertyType}</Text>
        <Text style={styles.cardSubtitle}>Location: {property.location}</Text>
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
  const RequestedPropertyCard = ({ item }) => {
    const propertyTag = getPropertyTag(item.createdAt);
    const propertyId = getLastFourCharss(item.id);

    return (
      <View style={styles.requestedCard}>
        <Image source={item.image} style={styles.requestedImage} />
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
            handleIHave(item);
          }}
        >
          <Text style={styles.buttonText}>I Have</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const SectionHeader = ({ title, onViewAll }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAll}>View All</Text>
      </TouchableOpacity>
    </View>
  );

  const actionButton = (
    iconName,
    label,
    bgColor,
    IconComponent = Ionicons,
    screenName
  ) => (
    <TouchableOpacity
      style={{ alignItems: "center" }}
      onPress={() => navigation.navigate(screenName)}
    >
      <View style={{ backgroundColor: bgColor, borderRadius: 50, padding: 15 }}>
        <IconComponent name={iconName} size={30} color="#fff" />
      </View>
      <Text style={{ textAlign: "center", marginTop: 5 }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.actionRow}>
          {actionButton(
            "home",
            "Post a\nProperty",
            "#D81B60",
            Ionicons,
            "postproperty"
          )}
          {actionButton(
            "home-search",
            "Request a\nProperty",
            "#009688",
            MaterialCommunityIcons,
            "requestproperty"
          )}
          {actionButton(
            "account-check",
            "Request\nExpert",
            "#3F51B5",
            MaterialCommunityIcons,
            "requestexpert"
          )}
        </View>
        <View style={styles.compactActionRow}>
  <TouchableOpacity 
  style={[styles.compactButton, {backgroundColor: "#FF9800"}]}
  onPress={() => navigation.navigate('suppliersvendors')}
>
  <MaterialIcons name="store" size={20} color="#fff" />
  <Text style={styles.compactButtonText}>Suppliers & Vendors</Text>
</TouchableOpacity>

  <TouchableOpacity 
    style={[styles.compactButton, {backgroundColor: "#607D8B"}]}
    onPress={() => navigation.navigate("skilledresources")}
  >
    <Ionicons name="people" size={20} color="#fff" />
    <Text style={styles.compactButtonText}>Skilled Resources</Text>
  </TouchableOpacity>
</View>
        {(userType === "WealthAssociate" ||
          userType === "ReferralAssociate" ||
          userType === "CoreMember") &&
          regularProperties.length > 0 && (
            <>
              <SectionHeader
                title="Regular Properties"
                onViewAll={() => navigation.navigate("regularprop")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {regularProperties.map((property, index) => (
                  <RenderPropertyCard key={index} property={property} />
                ))}
              </ScrollView>
            </>
          )}

        {approvedProperties.length > 0 && (
          <>
            <SectionHeader
              title="Approved Properties"
              onViewAll={() => navigation.navigate("approveprop")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {approvedProperties.map((property, index) => (
                <RenderPropertyCard key={index} property={property} />
              ))}
            </ScrollView>
          </>
        )}

        {wealthProperties.length > 0 && (
          <>
            <SectionHeader
              title="Wealth Properties"
              onViewAll={() => navigation.navigate("wealthprop")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {wealthProperties.map((property, index) => (
                <RenderPropertyCard key={index} property={property} />
              ))}
            </ScrollView>
          </>
        )}

        {listedProperties.length > 0 && (
          <>
            <SectionHeader
              title="Listed Properties"
              onViewAll={() => navigation.navigate("listedprop")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {listedProperties.map((property, index) => (
                <RenderPropertyCard key={index} property={property} />
              ))}
            </ScrollView>
          </>
        )}

        <SectionHeader
          title="Requested Properties"
          onViewAll={() => navigation.navigate("allreqprop")}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#D81B60" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {propertiess.map((item, index) => (
              <RequestedPropertyCard key={index} item={item} />
            ))}
          </ScrollView>
        )}

        {coreClients.length > 0 && (
          <>
            <SectionHeader title="Core Clients" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {coreClients.map((client, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.clientCard}
                  onPress={() => handleOpenLink(client.website)}
                >
                  <Image
                    source={{ uri: `${API_URL}${client.photo}` }}
                    style={styles.clientImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {coreProjects.length > 0 && (
          <>
            <SectionHeader title="Core Projects" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {coreProjects.map((project, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.projectCard}
                  onPress={() => handleOpenLink(project.website)}
                >
                  <Image
                    source={{ uri: `${API_URL}${project.photo}` }}
                    style={styles.projectImage}
                  />
                  <Text style={styles.projectTitle}>{project.city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
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
            <>
              <Image
                source={require("../../assets/man.png")}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20,
    gap: 30,
  },
   compactActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 15,
    marginTop: 5,
  },
  compactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    height: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  compactButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },

  scrollView: {
    flex: 1,
    marginBottom: 60,
  },
  horizontalScroll: {
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  viewAll: {
    color: "#2196F3",
    fontWeight: "500",
    fontSize: 14,
  },
  propertyCard: {
    width: width * 0.8,
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 15,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  propertyImage: {
    width: Dimensions.get("window").width - 30,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },

  imageScrollContainer: {
    marginBottom: 10,
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
    paddingRight: 5,
    // marginBottom: 5,
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
  likeButton: {
  position: 'absolute',
  top: 20,
  right: 20,
  backgroundColor: 'rgba(0,0,0,0.5)',
  borderRadius: 20,
  padding: 5,
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
  requestedCard: {
    width: width * 0.8,
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
    elevation: 3,
  },
  requestedImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
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
  clientCard: {
    width: 150,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  clientImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  projectCard: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 15,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  projectImage: {
    width: 120,
    height: 80,
    resizeMode: "contain",
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 12,
    textAlign: "center",
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

export default HomeScreen;
