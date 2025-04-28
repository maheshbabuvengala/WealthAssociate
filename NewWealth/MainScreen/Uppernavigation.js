import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { ActivityIndicator } from "react-native";

const Header = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState({
    details: {},
    userType: "",
    loading: true,
  });

  // Check if current screen is home screen
  const isHomeScreen = route.name === "newhome";

  // Fetch user data based on type
  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userType = await AsyncStorage.getItem("userType");

      let endpoint = "";
      switch (userType) {
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
        headers: { token: token || "" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setUserData({
        details: await response.json(),
        userType,
        loading: false,
      });
    } catch (error) {
      console.error("Header data fetch failed:", error);
      setUserData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const showReferralCode = [
    "WealthAssociate",
    "Customer",
    "CoreMember",
    "ReferralAssociate",
  ].includes(userData.userType);

  const handleProfilePress = () => {
    if (!userData.userType) {
      navigation.navigate("DefaultProfile");
      return;
    }

    switch (userData.userType) {
      case "WealthAssociate":
      case "ReferralAssociate":
        navigation.navigate("agentprofile", {
          userId: userData.details?._id,
          userType: userData.userType,
        });
        break;
      case "Customer":
        navigation.navigate("CustomerProfile", {
          userId: userData.details?._id,
          userType: userData.userType,
        });
        break;
      case "CoreMember":
        navigation.navigate("CoreProfile", {
          userId: userData.details?._id,
          userType: userData.userType,
        });
        break;
      case "Investor":
        navigation.navigate("InvestorProfile", {
          userId: userData.details?._id,
          userType: userData.userType,
        });
        break;
      case "NRI":
        navigation.navigate("NRIProfile", {
          userId: userData.details?._id,
          userType: userData.userType,
        });
        break;
      case "SkilledResource":
        navigation.navigate("SkilledProfile", {
          userId: userData.details?._id,
          userType: userData.userType,
        });
        break;
      default:
        navigation.navigate("DefaultProfile");
    }
  };

  if (userData.loading) {
    return (
      <View style={[styles.header, { justifyContent: "center" }]}>
        <ActivityIndicator size="small" color="#555" />
      </View>
    );
  }

  return (
    <SafeAreaView><View style={styles.header}>
    {/* Show back button only when not on home screen */}
    {!isHomeScreen && (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#555" />
      </TouchableOpacity>
    )}

    <TouchableOpacity onPress={() => navigation.navigate("newhome")}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
    </TouchableOpacity>

    <View style={styles.userInfo}>
      <Text style={styles.userName}>
        {userData.details?.FullName || "Welcome User"}
      </Text>
      {showReferralCode && (
        <Text style={styles.userRef}>
          Ref: {userData.details?.MyRefferalCode || "N/A"}
        </Text>
      )}
    </View>

    <TouchableOpacity
      onPress={handleProfilePress}
      style={styles.profileButton}
    >
      <Ionicons name="person-circle" size={36} color="#555" />
    </TouchableOpacity>
  </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    top:10
  },
  logo: {
    width: 55,
    height: 55,
    marginHorizontal: 10,
    bottom: 6,
  },
  userInfo: {
    flex: 1,
    marginLeft: 5,
    left: "10%",
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
  },
  userRef: {
    fontSize: 12,
    color: "#666",
  },
  profileButton: {
    padding: 5,
  },
});

export default Header;
