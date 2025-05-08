import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route.name);

  const tabs = [
    {
      label: "Home",
      icon: "home-outline",
      screenName: "newhome",
      iconActive: "home",
    },
    {
      label: "Add Member",
      icon: "person-add-outline",
      screenName: "addmember",
      iconActive: "person-add",
    },
    {
      label: "Property",
      icon: "business-outline",
      screenName: "propertyhome",
      iconActive: "business",
    },
    {
      label: "Expert Panel",
      icon: "people-outline",
      screenName: "expertpanel",
      iconActive: "people",
    },
    {
      label: "Core Client",
      icon: "star-outline",
      screenName: "coreclipro",
      iconActive: "star",
    },
  ];

  const handleTabPress = (screenName) => {
    setActiveTab(screenName);
    navigation.navigate("Main", { screen: screenName });
  };

  const isActive = (screenName) => {
    return activeTab === screenName || route.name === screenName;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab.screenName)}
        >
          <Ionicons
            name={isActive(tab.screenName) ? tab.iconActive : tab.icon}
            size={24}
            color={isActive(tab.screenName) ? "#D81B60" : "#555"}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: isActive(tab.screenName) ? "#D81B60" : "#555" },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ... keep the rest of the file the same

const styles = StyleSheet.create({
  container: {
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
    fontWeight: "500",
  },
});

export default BottomNavigation;
