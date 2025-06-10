import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import { API_URL } from "../../data/ApiUrl";
import LoadingScreen from "../../assets/animations/home[1].json";
import ActionButtons from "../components/home/ActionButtons";
import PropertyCard from "../components/home/PropertyCard";
import RequestedPropertyCard from "../components/home/RequestedPropertyCard";
import SectionHeader from "../components/home/SectionHeader";
import PropertyModal from "../components/home/PropertyModal";
import LazyImage from "../components/home/LazyImage";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [properties, setProperties] = useState([]);
  const [propertiess, setPropertiess] = useState([]);
  const [coreClients, setCoreClients] = useState([]);
  const [coreProjects, setCoreProjects] = useState([]);
  const [valueprojects, setValueProjects] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalVisible, setPropertyModalVisible] = useState(false);
  const [likedProperties, setLikedProperties] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [referredInfo, setReferredInfo] = useState({
    name: "",
    mobileNumber: "",
  });

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  // Animation effect
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

  // Helper functions
  const getPropertyTag = (createdAt) => {
    const currentDate = new Date();
    const propertyDate = new Date(createdAt);
    const timeDifference = currentDate - propertyDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference <= 3) return "Regular Property";
    if (daysDifference >= 4 && daysDifference <= 17) return "Approved Property";
    if (daysDifference >= 18 && daysDifference <= 25) return "Wealth Property";
    return "Listed Property";
  };

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

  // Data fetching functions
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
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralCount = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));

      if (!userDetails?.MyRefferalCode) return;

      const response = await fetch(`${API_URL}/agent/valueagents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
        body: JSON.stringify({
          referralCode: userDetails.MyRefferalCode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setReferralCount(data.length);
      } else if (data.count !== undefined) {
        setReferralCount(data.count);
      } else if (Array.isArray(data.valueAgents)) {
        setReferralCount(data.valueAgents.length);
      } else {
        setReferralCount(0);
      }
    } catch (error) {
      console.error("Error fetching referral count:", error);
      setReferralCount(0);
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

  const fetchValueProjects = async () => {
    try {
      const response = await fetch(
        `${API_URL}/coreproject/getallValueprojects`
      );
      const data = await response.json();
      setValueProjects(data);
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
        images: item.images
          ? Array.isArray(item.images)
            ? item.images
            : [item.images]
          : [getImageByPropertyType(item.propertyType)],
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

  // Handlers
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

  const handleIHave = (property) => {
    setSelectedProperty(property);
    setPropertyModalVisible(true);
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

  useEffect(() => {
    getDetails();
    fetchCoreClients();
    fetchCoreProjects();
    fetchValueProjects();
    fetchProperties();
    fetchPropertiess();
    loadReferredInfoFromStorage();
  }, []);

  useEffect(() => {
    if (details?.MyRefferalCode) {
      fetchReferralCount();
    }
  }, [details?.MyRefferalCode]);

  useEffect(() => {
    if (isPropertyModalVisible) {
      loadReferredInfoFromStorage();
    }
  }, [isPropertyModalVisible]);

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

  const RenderPropertyCard = ({ property }) => {
    const [isLiked, setIsLiked] = useState(
      likedProperties.includes(property._id)
    );

    const toggleLike = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userDetails = JSON.parse(
          await AsyncStorage.getItem("userDetails")
        );

        const newLikedStatus = !isLiked;
        setIsLiked(newLikedStatus);

        let updatedLikes;
        if (newLikedStatus) {
          updatedLikes = [...likedProperties, property._id];
        } else {
          updatedLikes = likedProperties.filter((id) => id !== property._id);
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
            propertyId: property._id,
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

    return (
      <PropertyCard
        property={property}
        onPress={() => handlePropertyPress(property)}
        onEnquiryPress={() => handleEnquiryNow(property)}
        onSharePress={() => handleShare(property)}
        isLiked={isLiked}
        onLikePress={toggleLike}
      />
    );
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

  const getImageSource = (item) => {
    if (!item) return require("../../assets/logo.png");

    // First try newImageUrl
    if (item.newImageUrl && typeof item.newImageUrl === "string") {
      return { uri: item.newImageUrl };
    }

    // Then try imageUrl
    if (item.imageUrl && typeof item.imageUrl === "string") {
      return { uri: item.imageUrl };
    }

    // Default fallback
    return require("../../assets/logo.png");
  };

  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Minimum 3 seconds loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        showsHorizontalScrollIndicator={false}
      >
        {(userType === "WealthAssociate" || userType === "ReferralAssociate") &&
          details?.AgentType === "ValueAssociate" &&
          details?.photo && (
            <Animated.View style={styles.agentPhotoContainer}>
              <LazyImage
                source={{ uri: details.photo }}
                style={styles.agentPhoto}
                cacheKey={`agent_${details._id}`}
                resizeMode="cover"
              />
              <Text
                style={styles.agentName}
                numberOfLines={5}
                ellipsizeMode="tail"
              >
                {details.CompanyName || "Value Associate"}
                {"\n"}
                <Text style={{ color: "#0495CA", fontSize: 14 }}>
                  Value Associate
                </Text>
                {"\n"}
                <TouchableOpacity
                  onPress={() => navigation.navigate("myagents")}
                >
                  <View style={styles.skillTag}>
                    <Text style={styles.skillText}>
                      YourAgents:{referralCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Text>
            </Animated.View>
          )}

        <ActionButtons navigation={navigation} />

        {regularProperties.length > 0 && (
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
              {regularProperties.slice(0, 10).map((property, index) => (
                <View
                  key={`regular-${property._id || index}`}
                  style={{ marginHorizontal: 5 }}
                >
                  <RenderPropertyCard property={property} />
                </View>
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
              {approvedProperties.slice(0, 10).map((property, index) => (
                <View
                  key={`approved-${property._id || index}`}
                  style={{ marginHorizontal: 5 }}
                >
                  <RenderPropertyCard property={property} />
                </View>
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
              {wealthProperties.slice(0, 10).map((property, index) => (
                <View
                  key={`wealth-${property._id || index}`}
                  style={{ marginHorizontal: 5 }}
                >
                  <RenderPropertyCard property={property} />
                </View>
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
              {listedProperties.slice(0, 10).map((property, index) => (
                <View
                  key={`listed-${property._id || index}`}
                  style={{ marginHorizontal: 5 }}
                >
                  <RenderPropertyCard property={property} />
                </View>
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
              <RequestedPropertyCard
                key={`requested-${item.id || index}`}
                item={item}
                onIHavePress={() => handleIHave(item)}
              />
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
                  key={`client-${client._id || index}`}
                  style={styles.clientCard}
                  onPress={() => handleOpenLink(client.website)}
                >
                  <LazyImage
                    source={getImageSource(client)}
                    style={styles.clientImage}
                    cacheKey={`client_${client._id}`}
                    resizeMode="contain"
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
                  key={`core-project-${project._id || index}`}
                  style={styles.projectCard}
                  onPress={() => handleOpenLink(project.website)}
                >
                  <LazyImage
                    source={getImageSource(project)}
                    style={styles.projectImage}
                    cacheKey={`project_${project._id}`}
                    resizeMode="cover"
                  />
                  <Text style={styles.projectTitle}>{project.city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {valueprojects.length > 0 && (
          <>
            <SectionHeader title="Value Projects" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {valueprojects.map((project, index) => (
                <TouchableOpacity
                  key={`value-project-${project._id || index}`}
                  style={styles.projectCard}
                  onPress={() => handleOpenLink(project.website)}
                >
                  <LazyImage
                    source={getImageSource(project)}
                    style={styles.projectImage}
                    cacheKey={`valueproject_${project._id}`}
                    resizeMode="cover"
                  />
                  <Text style={styles.projectTitle}>{project.city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </Animated.ScrollView>

      <PropertyModal
        visible={isPropertyModalVisible}
        onClose={() => setPropertyModalVisible(false)}
        referredInfo={referredInfo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8E3E7",
    paddingHorizontal: 15,
    top: 10,
    // paddingBottom:"20%"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#D8E3E7",
  },
  scrollView: {
    flex: 1,
    // paddingBottom:"40%"
    marginBottom: Platform.OS === "web" ? "0" : "25%",
  },
  horizontalScroll: {
    paddingVertical: 10,
    // paddingHorizontal: 10,
  },
  agentPhotoContainer: {
    alignItems: "flex-start",
    marginVertical: 15,
    display: "flex",
    flexDirection: "row",
  },
  agentPhoto: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#D81B60",
  },
  agentName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    alignItems: "flex-end",
    marginLeft: 20,
    flex: 1,
    flexShrink: 1,
  },
  skillTag: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
  },
  skillText: {
    fontSize: 10,
    color: "#2c3e50",
    fontWeight: "600",
  },
  clientCard: {
    width: 150,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 10,
  },
  clientImage: {
    width: "100%",
    height: "100%",
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
    // paddingBottom:"20%"
  },
  projectImage: {
    width: 130,
    height: 80,
    marginBottom: 10,
    borderRadius: 8,
  },
  projectTitle: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default HomeScreen;
