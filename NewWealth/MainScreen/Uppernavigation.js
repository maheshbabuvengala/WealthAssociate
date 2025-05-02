import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { ActivityIndicator } from "react-native";

// Cache for user data
let userDataCache = null;
let lastFetchTime = 0;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes cache

const Header = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState({
    details: {},
    userType: "",
    loading: true,
  });

  const isHomeScreen = route.name === "newhome";

  // Memoized fetch function
  const fetchUserDetails = useCallback(async () => {
    // Return cached data if it's fresh enough
    if (userDataCache && Date.now() - lastFetchTime < CACHE_EXPIRY_TIME) {
      setUserData({
        details: userDataCache.details,
        userType: userDataCache.userType,
        loading: false,
      });
      return;
    }

    try {
      // Get both token and userType in one AsyncStorage call
      const [token, userType] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("userType"),
      ]);

      if (!token || !userType) {
        setUserData((prev) => ({ ...prev, loading: false }));
        return;
      }

      let endpoint = "";
      switch (userType) {
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
        headers: { token },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const details = await response.json();

      // Update cache
      userDataCache = { details, userType };
      lastFetchTime = Date.now();

      setUserData({
        details,
        userType,
        loading: false,
      });
    } catch (error) {
      console.error("Header data fetch failed:", error);
      setUserData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleProfilePress = useCallback(() => {
    if (!userData.userType) {
      navigation.navigate("DefaultProfile");
      return;
    }

    const profileRoutes = {
      WealthAssociate: "agentprofile",
      ReferralAssociate: "agentprofile",
      Customer: "CustomerProfile",
      CoreMember: "CoreProfile",
      Investor: "InvestorProfile",
      NRI: "NRIProfile",
      SkilledResource: "SkilledProfile",
    };

    const routeName = profileRoutes[userData.userType] || "DefaultProfile";

    navigation.navigate(routeName, {
      userId: userData.details?._id,
      userType: userData.userType,
    });
  }, [userData.details?._id, userData.userType, navigation]);

  const showReferralCode = [
    "WealthAssociate",
    "Customer",
    "CoreMember",
    "ReferralAssociate",
  ].includes(userData.userType);

  if (userData.loading) {
    return (
      <View style={[styles.header, { justifyContent: "center" }]}>
        <ActivityIndicator size="small" color="#555" />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.header}>
        {!isHomeScreen && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#555" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("newhome")}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {userData.details?.FullName ||
              userData.details?.Name ||
              "Welcome User"}
          </Text>
          {showReferralCode && (
            <Text style={styles.userRef} numberOfLines={1} ellipsizeMode="tail">
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
    top: 10,
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
