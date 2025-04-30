import React, { useState, useEffect } from "react";
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
import Uppernavigation from "./Uppernavigation";
import BottomNavigation from "./BottomNavigation";

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
  const [referredInfo, setReferredInfo] = useState(null);
  const navigation = useNavigation();

  const getDetails = async () => {
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

      // Filter properties to only include those with status "Done"
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

  const getImageByPropertyType = (propertyType) => {
    switch (propertyType.toLowerCase()) {
      case "land":
        return require("../../assets/Land.jpg");
      case "residential":
        return require("../../assets/residntial.jpg");
      case "commercial":
        return require("../../assets/commercial.jpg");
      case "villa":
        return require("../../assets/villa.jpg");
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

  const handleEnquiryNow = (property) => {
    setSelectedProperty(property);
    setPropertyModalVisible(true);
  };

  const handleIHave = (property) => {
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
  }, []);

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

  const PropertyCard = ({ property }) => {
    const imageUri = property.photo
      ? { uri: `${API_URL}${property.photo}` }
      : require("../../assets/logo.png");
    const propertyTag = getPropertyTag(property.createdAt);
    const propertyId = getLastFourChars(property._id);

    return (
      <View style={styles.propertyCard}>
        <Image source={imageUri} style={styles.propertyImage} />
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
        <Text style={styles.cardSubtitle}>
          {property.propertyDetails || "20 sqft"}
        </Text>
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
          <TouchableOpacity style={styles.shareBtn}>
            <FontAwesome name="share" size={16} color="white" />
            <Text style={{ color: "white", marginLeft: 5, fontWeight: "bold" }}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
          onPress={() => handleIHave(item)}
        >
          <Text style={styles.buttonText}>I Have</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity>
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
  const bottomTab = (label, icon, screenName) => {
    return (
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate(screenName)}
      >
        <Ionicons name={icon} size={22} color="#555" />
        <Text style={styles.tabLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <Uppernavigation/> */}

      {/* Search */}
      {/* <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search a Property"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View> */}

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
        {/* Regular Properties */}
        {regularProperties.length > 0 && (
          <>
            <SectionHeader title="Regular Properties" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {regularProperties.map((property, index) => (
                <PropertyCard key={index} property={property} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Approved Properties */}
        {approvedProperties.length > 0 && (
          <>
            <SectionHeader title="Approved Properties" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {approvedProperties.map((property, index) => (
                <PropertyCard key={index} property={property} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Wealth Properties */}
        {wealthProperties.length > 0 && (
          <>
            <SectionHeader title="Wealth Properties" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {wealthProperties.map((property, index) => (
                <PropertyCard key={index} property={property} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Listed Properties */}
        {listedProperties.length > 0 && (
          <>
            <SectionHeader title="Listed Properties" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {listedProperties.map((property, index) => (
                <PropertyCard key={index} property={property} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Requested Properties */}
        <SectionHeader title="Requested Properties" />
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

        {/* Core Clients */}
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

        {/* Core Projects */}
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
      {/* <BottomNavigation/> */}

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    borderRadius: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    left: "20%",
  },
  userRef: {
    fontSize: 12,
    color: "#666",
    left: "18%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20,
    gap: 30,
  },
  actionButton: {
    alignItems: "center",
    width: "30%",
    borderRadius: "50%",
    color: "#D81B60",
  },
  actionIconContainer: {
    backgroundColor: "white",
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderRadius: "50%",
  },
  actionLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    marginBottom: 60,
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
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
    width: "100%",
    height: 150,
    borderRadius: 8,
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: "center",
    paddingHorizontal: 5,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#555",
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

export default HomeScreen;
