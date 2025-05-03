import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  useEffect(() => {
    const loadActiveTab = async () => {
      const storedTab = await AsyncStorage.getItem("activeTab");
      if (storedTab && storedTab !== route.name) {
        navigation.navigate("Main", { screen: storedTab });
        setActiveTab(storedTab);
      }
    };
    loadActiveTab();
  }, []);

  const handleTabPress = async (screenName) => {
    await AsyncStorage.setItem("activeTab", screenName);
    setActiveTab(screenName);
    navigation.navigate("Main", { screen: screenName });
  };

  const isActive = (screenName) => {
    return activeTab === screenName || route.name === screenName;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", async () => {
      const currentRoute = navigation.getState()?.routes?.find(r => r.name === "Main")?.state?.routes?.[navigation.getState().routes.find(r => r.name === "Main")?.state?.index]?.name;
  
      if (currentRoute) {
        setActiveTab(currentRoute);
        await AsyncStorage.setItem("activeTab", currentRoute);
      }
    });
  
    return unsubscribe;
  }, [navigation]);
  

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
