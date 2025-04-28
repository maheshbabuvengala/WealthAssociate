import { useState, useEffect } from "react";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { API_URL } from "../data/ApiUrl";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomModal from "../Components/CustomModal";
import ViewApprovedProperties from "./Screens/Properties/ViewApprovedProperties";
import Viewallagents from "./Screens/Agent/ViewAllAgents";
import NewExperts from "./ExpertPanel/NewExperts";

// Importing components
import Dashboard from "./Screens/Callcentre";
import ViewAgents from "./Screens/Agent/ViewAgents";
import ViewCustomers from "./Screens/Customer/View_customers";
import ViewPostedProperties from "./Screens/Properties/ViewPostedProperties";
import RequestedProperties from "./Screens/Properties/ViewRequestedProperties";
import ViewAgentsCall from "./Screens/Agent/AgentsCall";
import ViewCustomersCalls from "./Screens/Customer/ViewCustCalls";
import ExpertPanelReq from "./ExpertPanel/ExpertReq";
import ViewAllInvesters from "./Screens/View/ViewAllInvestors";
import AllSkilledLabours from "./Screens/View/AllSkilledLabours";
import ViewNri from "./Screens/View/ViewNri";
import ExpertPanel from "./ExpertPanel/ExpertRoute";

const CallCenterDashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(
    Platform.OS !== "android"
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [isViewCustVisible, setIsViewCustVisible] = useState(false);
  const [isViewAgentVisible, setIsViewAgentVisible] = useState(false);
  const [isViewPostPropVisible, setIsViewPostPropVisible] = useState(false);
  const [isViewRequestedPropVisible, setIsViewRequestedPropVisible] =
    useState(false);
  const [isViewAgentContVsible, setIsViewAgentContVisible] = useState(false);
  const [isCustCallVisible, setIsCustCallVisible] = useState(false);
  const [isViewApprovedProperties, setViewApprovedProperties] = useState(false);
  const [isExpertPanelReq, setExpertPanelReq] = useState(false);
  const [isViewInvestVisible, setIsViewInvestVisible] = useState(false);
  const [isViewSkillVisible, setIsViewSkillVisible] = useState(false);
  const [isViewNriVisible, setIsViewNriVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isViewallagents, setViewallagents] = useState(false);
  const [isExpertPanel, setExpertPanel] = useState(false);
  const [isNewExperts,setNewExperts]= useState(false)

  const toggleSidebar = () => {
    if (Platform.OS === "android") {
      setIsSidebarExpanded((prev) => !prev);
    }
  };

  const toggleMenuItem = (title) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));

    if (Platform.OS === "android" && !isSidebarExpanded) {
      setIsSidebarExpanded(true);
    }
  };

  const handleSubItemClick = (subItem) => {
    // Reset all views
    setIsViewCustVisible(false);
    setIsViewAgentVisible(false);
    setIsViewPostPropVisible(false);
    setIsViewRequestedPropVisible(false);
    setIsViewAgentContVisible(false);
    setIsCustCallVisible(false);
    setViewApprovedProperties(false);
    setExpertPanelReq(false);
    setIsViewInvestVisible(false);
    setIsViewSkillVisible(false);
    setIsViewNriVisible(false);
    setViewallagents(false);
    setExpertPanel(false);
    setNewExperts(false)

    if (Platform.OS === "android") {
      setIsSidebarExpanded(false);
    }

    switch (subItem) {
      case "Dashboard":
        // Already showing dashboard by default
        break;
      case "View Customers":
        setIsViewCustVisible(true);
        break;
      case "View Agents":
        setIsViewAgentVisible(true);
        break;
      case "View Posted Properties":
        setIsViewPostPropVisible(true);
        break;
      case "View Requested Properties":
        setIsViewRequestedPropVisible(true);
        break;
      case "View Agents Contacts":
        setIsViewAgentContVisible(true);
        break;
      case "View Customer Contacts":
        setIsCustCallVisible(true);
        break;
      case "ViewApprovedProperties":
        setViewApprovedProperties(true);
        break;
      case "Expert Panel Requests":
        setExpertPanelReq(true);
        break;
      case "View Investors":
        setIsViewInvestVisible(true);
        break;
      case "View Skilled Resource":
        setIsViewSkillVisible(true);
        break;
      case "View All Agents":
        setViewallagents(true);
        break;
      case "ExpertPanel":
        setExpertPanel(true);
        break;
      case "NewExperts":
        setNewExperts(true);
        break;
      case "View NRI Members":
        setIsViewNriVisible(true);
        break;
      default:
        break;
    }
  };

  const closeModal = () => {
    setIsViewCustVisible(false);
    setIsViewAgentVisible(false);
    setIsViewPostPropVisible(false);
    setIsViewRequestedPropVisible(false);
    setIsViewAgentContVisible(false);
    setIsCustCallVisible(false);
    setIsViewInvestVisible(false);
    setIsViewSkillVisible(false);
    setIsViewNriVisible(false);
    setViewallagents(false);
    setExpertPanel(false);
    setNewExperts(false)
  };

  const renderContent = () => {
    if (isViewAgentVisible) return <ViewAgents />;
    if (isViewCustVisible) return <ViewCustomers />;
    if (isViewPostPropVisible) return <ViewPostedProperties />;
    if (isViewRequestedPropVisible) return <RequestedProperties />;
    if (isViewAgentContVsible) return <ViewAgentsCall />;
    if (isCustCallVisible) return <ViewCustomersCalls />;
    if (isExpertPanelReq) return <ExpertPanelReq />;
    if (isViewInvestVisible) return <ViewAllInvesters />;
    if (isViewSkillVisible) return <AllSkilledLabours />;
    if (isViewNriVisible) return <ViewNri />;
    if (isViewApprovedProperties) return <ViewApprovedProperties />;
    if (isViewallagents) return <Viewallagents />;
    if (isExpertPanel) return <ExpertPanel />;
    if(isNewExperts)return<NewExperts/>
    return <Dashboard />;
  };

  const resetToDashboard = () => {
    setIsViewCustVisible(false);
    setIsViewAgentVisible(false);
    setIsViewPostPropVisible(false);
    setIsViewRequestedPropVisible(false);
    setIsViewAgentContVisible(false);
    setIsCustCallVisible(false);
    setViewApprovedProperties(false);
    setExpertPanelReq(false);
    setIsViewInvestVisible(false);
    setIsViewSkillVisible(false);
    setIsViewNriVisible(false);
    setViewallagents(false);
    setExpertPanel(false);
    setNewExperts(false)
  };

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/callexe/getcallexe`, {
        method: "GET",
        headers: {
          token: ` ${token}` || "",
        },
      });
      const userDetails = await response.json();
      setDetails(userDetails);

      // Base menu items that everyone can see
      const baseMenuItems = [
        {
          title: "View Approved Properties",
          icon: "home-outline",
          subItems: ["ViewApprovedProperties"],
        },
      ];

      // Add role-specific menu items
      switch (userDetails.assignedType) {
        case "Agent_Wealth_Associate":
          baseMenuItems.push({
            title: "Agents",
            icon: "person-outline",
            subItems: ["View Agents", "View Customers"],
          });
          break;
        case "Customers":
          baseMenuItems.push({
            title: "Customers",
            icon: "people-outline",
            subItems: ["View Customers", "View Agents"],
          });
          break;
        case "Property":
          baseMenuItems.push({
            title: "Properties",
            icon: "home-outline",
            subItems: ["View Posted Properties", "View Requested Properties"],
          });
          break;
        case "ExpertPanel":
          baseMenuItems.push({
            title: "Expert Panel",
            icon: "cog-outline",
            subItems: ["Expert Panel Requests", "ExpertPanel","NewExperts"],
          });
          break;
        default:
          // Admin or full access
          baseMenuItems.push(
            {
              title: "Agents",
              icon: "person-outline",
              subItems: ["View Agents"],
            },
            {
              title: "Customers",
              icon: "people-outline",
              subItems: ["View Customers"],
            },
            {
              title: "Properties",
              icon: "home-outline",
              subItems: ["View Posted Properties", "View Requested Properties"],
            },
            {
              title: "Expert Panel",
              icon: "cog-outline",
              subItems: ["Expert Panel Requests", "ExpertPanel","NewExperts"],
            }
          );
      }

      // Add View section that everyone can see
      baseMenuItems.push({
        title: "View",
        icon: "eye-outline",
        subItems: [
          "View Skilled Resource",
          "View NRI Members",
          "View Investors",
          "View All Agents",
        ],
      });

      setMenuItems(baseMenuItems);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  return (
    <View style={styles.container}>
      {/* Status Bar Adjustment for Android */}
      {Platform.OS === "android" && (
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      )}

      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={resetToDashboard}>
          <Image
            source={require("../CallCenterDash/assets/logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <View style={styles.sear_icons}>
          <View style={styles.rightIcons}>
            <Image
              source={require("../CallCenterDash/assets/usflag.png")}
              style={styles.icon}
            />
            <Text style={styles.language}>English</Text>
            <Ionicons name="moon-outline" size={24} color="#000" />
            <Ionicons name="notifications-outline" size={24} color="#000" />
            <Ionicons name="person-circle-outline" size={30} color="#000" />
            {details && (
              <Text style={styles.userName}>{details.name || "User"}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Main Layout */}
      <View style={styles.mainContent}>
        {/* Sidebar */}
        <View
          style={[
            styles.sidebar,
            Platform.OS === "android" &&
              (isSidebarExpanded
                ? styles.expandedSidebar
                : styles.collapsedSidebar),
          ]}
        >
          <ScrollView style={{ maxHeight: 600, minHeight: 200 }}>
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.title}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => toggleMenuItem(item.title)}
                  >
                    <Ionicons name={item.icon} size={24} color="#555" />
                    {isSidebarExpanded && (
                      <Text style={styles.menuText}>{item.title}</Text>
                    )}
                    {isSidebarExpanded &&
                      item.subItems.length > 1 && ( // Only show chevron if there are subitems
                        <Ionicons
                          name={
                            expandedItems[item.title]
                              ? "chevron-up-outline"
                              : "chevron-down-outline"
                          }
                          size={16}
                          color="#555"
                        />
                      )}
                  </TouchableOpacity>
                  {isSidebarExpanded &&
                    expandedItems[item.title] &&
                    item.subItems &&
                    item.subItems.map((sub, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.subMenuItem}
                        onPress={() => handleSubItemClick(sub)}
                      >
                        <Text style={styles.subMenuText}>{sub}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            />
            <Text style={styles.lastUpdated}>
              Last Updated: {new Date().toLocaleDateString()}
            </Text>
          </ScrollView>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          <View style={styles.container}>
            <ScrollView>
              <View style={styles.userContent}>
                {details && (
                  <>
                    <Text style={styles.usersContentText}>
                      Welcome Back:{" "}
                      <Text style={{ color: "#E82E5F" }}>
                        {details.name || "User"}
                      </Text>
                    </Text>
                    <Text style={styles.usersContentText}>
                      Phone number:{" "}
                      <Text style={{ color: "#E82E5F" }}>
                        {details.phone || "N/A"}
                      </Text>
                    </Text>
                    <Text style={styles.usersContentText}>
                      Role:{" "}
                      <Text style={{ color: "#E82E5F" }}>
                        {details.assignedType || "N/A"}
                      </Text>
                    </Text>
                  </>
                )}
                <ScrollView style={{ height: "auto" }}>
                  {renderContent()}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Toggle Button for Sidebar (Android Only) */}
      {Platform.OS === "android" && (
        <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
          <Ionicons
            name={isSidebarExpanded ? "close-circle-outline" : "menu-outline"}
            size={30}
            color="#000"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    width: "100%",
    paddingTop: Platform.OS === "android" ? 0 : StatusBar.currentHeight,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    justifyContent: "space-between",
  },
  logo: {
    width: 100,
    height: 60,
    resizeMode: "contain",
    marginLeft: Platform.OS === "web" ? "0px" : "25%",
  },
  sear_icons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "web" ? 0 : "10%",
    gap: Platform.OS === "web" ? 10 : 0,
  },
  icon: {
    width: 20,
    height: 15,
    marginRight: 5,
  },
  language: {
    marginRight: 10,
    color: "#555",
  },
  userName: {
    marginLeft: 10,
    fontWeight: "bold",
    color: "#555",
  },
  mainContent: {
    flexDirection: "row",
    flex: 1,
  },
  sidebar: {
    backgroundColor: "#fff",
    padding: 10,
    borderRightWidth: 1,
    borderColor: "#ddd",
    width: Platform.OS === "android" ? 300 : 250,
    ...(Platform.OS === "web" && { minHeight: "100vh" }),
  },
  expandedSidebar: {
    width: 250,
  },
  collapsedSidebar: {
    width: 70,
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  subMenuItem: {
    paddingVertical: 8,
  },
  subMenuText: {
    fontSize: 14,
    color: "#FF4081",
    paddingLeft: 35,
    paddingVertical: 5,
  },
  lastUpdated: {
    marginTop: 20,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#F0F5F5",
    ...(Platform.OS === "web" && { padding: 5 }),
    height: "100vh",
  },
  toggleButton: {
    position: "absolute",
    top: 25,
    left: 20,
    zIndex: 1000,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  userContent: {
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: Platform === "web" ? "row" : "column",
    height: "auto",
    padding: 15,
  },
  usersContentText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default CallCenterDashboard;
