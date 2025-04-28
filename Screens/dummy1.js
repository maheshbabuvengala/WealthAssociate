import { useState } from "react";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  TextInput,
  StatusBar,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Agent_Right from "./Agent_Right";
import Add_Agent from "./Add_Agent";
import logo1 from "../assets/logo.png";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const menuItems = [
  {
    title: "Agents",
    icon: "person-add-outline",
    subItems: ["Register Agent", "View Agents"],
  },
  {
    title: "Customers",
    icon: "people-outline",
    subItems: ["Add Customer", "View Customers"],
  },
  {
    title: "Properties",
    icon: "home-outline",
    subItems: ["Add Property", "View Properties"],
  },
  { title: "Expert Panel", icon: "cog-outline", subItems: ["Consult Experts"] },
  {
    title: "Referrals",
    icon: "share-social-outline",
    subItems: ["Send Referral", "View Referrals"],
  },
  {
    title: "NRI Club",
    icon: "people-circle-outline",
    subItems: ["Join Club", "Club Events"],
  },
  {
    title: "Core Clients",
    icon: "business-outline",
    subItems: ["VIP Clients"],
  },
  {
    title: "Skilled Club",
    icon: "trophy-outline",
    subItems: ["Skilled Members"],
  },
  {
    title: "Master Data",
    icon: "folder-outline",
    subItems: ["Data Management"],
  },
];

const Admin_panel = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(
    Platform.OS !== "android"
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedSubItem, setSelectedSubItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  };

  const handleSubItemClick = (subItem) => {
    setSelectedSubItem(subItem);
    if (subItem === "Register Agent") {
      setIsModalVisible(true);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Status Bar Adjustment for Android */}
      {Platform.OS === "android" && (
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      )}

      {/* Top Navbar */}
      <View style={styles.navbar}>
        <Image source={logo1} style={styles.logo} />
        <View style={styles.sear_icons}>
          <View style={styles.rightIcons}>
            <Image source={logo1} style={styles.icon} />
            <Text style={styles.language}>English</Text>
            <Ionicons name="moon-outline" size={24} color="#000" />
            <Ionicons name="notifications-outline" size={24} color="#000" />
            <Ionicons name="person-circle-outline" size={30} color="#000" />
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
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.title}
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
                  {isSidebarExpanded && (
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
                      onPress={() => handleSubItemClick(sub)}
                    >
                      <Text style={styles.subMenuText}>{sub}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          />
          <Text style={styles.lastUpdated}>Last Updated: 30.01.2025</Text>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          <View style={styles.container}>
            <ScrollView>
              <Agent_Right />
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

      {/* Modal for Register Agent */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Add_Agent closeModal={closeModal} />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={() => {
                  closeModal();
                }}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginLeft: Platform.OS === "web" ? "0px" : "17%",
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
    gap: Platform.OS === "web" ? "10px" : 0,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: Platform.OS === "web" ? "65%" : "90%", // Adjusted for Android
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: Platform.OS === "web" ? "80%" : "90%", // Adjusted for Android
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  submitButton: {
    backgroundColor: "#E91E63",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Admin_panel;
