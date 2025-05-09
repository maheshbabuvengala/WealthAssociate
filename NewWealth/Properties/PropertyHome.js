import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ViewAllRequestedProperties from "./AllrequestedProperties";
import ViewAllProperties from "./ViewAllProperties";
import MyProperties from "./ViewPostedProperties";
import MyRequestedProperties from "./ViewRequestedProperties";
import { useNavigation } from "@react-navigation/native";

export default function PropertiesScreen() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("all");
  const navigation=useNavigation()

  const handleMyPropertiesPress = () => {
    setViewMode("my");
    setActiveTab("myProperties");
    // if (navigation) {
    //   navigation.navigate("MyProperties");
    // }
  };

  const handleBackToAllProperties = () => {
    setViewMode("all");
    setActiveTab("all");
  };

  // Function to open modal with slide animation
  const openModal = (screenName) => {
    setViewMode("all");
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      {/* Options */}
      <View style={styles.optionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.options}>
            <Option
              icon="home"
              label="Post a Property"
              onPress={() => openModal("postproperty")}
            />
            <Option
              icon="home-outline"
              label="Request a Property"
              onPress={() => openModal("requestproperty")}
            />
            <Option
              icon="people-outline"
              label={viewMode === "my" ? "All Properties" : "My Properties"}
              onPress={
                viewMode === "my"
                  ? handleBackToAllProperties
                  : handleMyPropertiesPress
              }
            />
          </View>
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <View style={styles.row}>
          <TouchableOpacity
            style={activeTab === "all" ? styles.activeTab : styles.inactiveTab}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={
                activeTab === "all"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              All Properties
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              activeTab === "requested" ? styles.activeTab : styles.inactiveTab
            }
            onPress={() => setActiveTab("requested")}
          >
            <Text
              style={
                activeTab === "requested"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              All Requested Properties
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={
              activeTab === "myProperties"
                ? styles.activeTab
                : styles.inactiveTab
            }
            onPress={() => setActiveTab("myProperties")}
          >
            <Text
              style={
                activeTab === "myProperties"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              My Properties
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              activeTab === "myRequested"
                ? styles.activeTab
                : styles.inactiveTab
            }
            onPress={() => setActiveTab("myRequested")}
          >
            <Text
              style={
                activeTab === "myRequested"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              My Requested Properties
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render the selected tab content */}
      {activeTab === "all" ? (
        <ScrollView>
          <ViewAllProperties />
        </ScrollView>
      ) : activeTab === "requested" ? (
        <ScrollView>
          <ViewAllRequestedProperties />
        </ScrollView>
      ) : activeTab === "myProperties" ? (
        <ScrollView>
          <MyProperties />
        </ScrollView>
      ) : (
        <ScrollView>
          <MyRequestedProperties />
        </ScrollView>
      )}
    </View>
  );
}

const Option = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.optionButton} onPress={onPress}>
    <View style={styles.circleIcon}>
      <Ionicons name={icon} size={24} color="white" />
    </View>
    <Text style={styles.optionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  optionsContainer: {
    maxHeight: 130,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  optionButton: {
    alignItems: "center",
    width: 120,
    paddingHorizontal: 5,
  },
  circleIcon: {
    width: 60,
    height: 60,
    borderRadius: 25,
    backgroundColor: "#e63946",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 5,
  },
  optionText: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
    paddingHorizontal: 2,
  },
  tabs: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    display: "flex",
    // flexWrap: "wrap",
  },
  activeTab: {
    backgroundColor: "#eb4d4b",
    padding: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  inactiveTab: {
    backgroundColor: "#f1f2f6",
    padding: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  activeTabText: {
    color: "white",
    fontWeight: "600",
  },
  inactiveTabText: {
    color: "black",
    fontWeight: "600",
  },
  searchFilter: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f2f6",
    padding: 8,
    flex: 1,
    borderRadius: 8,
    marginRight: 10,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
  },
  filterButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 8,
  },
});
