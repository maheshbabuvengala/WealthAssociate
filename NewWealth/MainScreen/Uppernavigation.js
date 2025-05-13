import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";

// Cache for user data
let userDataCache = null;
let lastFetchTime = 0;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

export const clearHeaderCache = () => {
  userDataCache = null;
  lastFetchTime = 0;
};

const Header = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [showBackButton, setShowBackButton] = useState(false);
  const [userData, setUserData] = useState({
    details: {},
    userType: "",
    loading: true,
  });

  useFocusEffect(
    useCallback(() => {
      // List of screens where back button should never appear
      const noBackScreens = [
        "newhome",
        "Main Screen",
        "Starting Screen",
        "Home", // Admin panel
        "Admin",
        "CallCenterDashboard",
      ];

      // Check if current screen is in the noBackScreens list
      const shouldHideBackButton = noBackScreens.includes(route.name);

      // Also hide back button if we're at the initial route of a navigator
      const state = navigation.getState();
      const isInitialRoute =
        state?.routes[state?.index || 0]?.name === route.name;

      setShowBackButton(!shouldHideBackButton && !isInitialRoute);
    }, [route.name, navigation])
  );

  const fetchReferredDetails = useCallback(async (referredBy, addedBy) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const identifier = referredBy || addedBy;
      if (!identifier) return;

      const response = await fetch(
        `${API_URL}/properties/getPropertyreffered`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({
            referredBy: referredBy || addedBy,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          const details = data.referredByDetails || data.addedByDetails;
          if (details) {
            await AsyncStorage.setItem(
              "referredAddedByInfo",
              JSON.stringify({
                name: details.name || details.Name,
                mobileNumber: details.Number,
              })
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching referred/added by info:", error);
    }
  }, []);

  const fetchUserDetails = useCallback(async () => {
    const now = Date.now();
    if (userDataCache && now - lastFetchTime < CACHE_EXPIRY_TIME) {
      setUserData({
        details: userDataCache.details,
        userType: userDataCache.userType,
        loading: false,
      });
      return;
    }

    try {
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

      const response = await fetch(endpoint, { headers: { token } });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const details = await response.json();
      userDataCache = { details, userType };
      lastFetchTime = now;

      setUserData({ details, userType, loading: false });

      if (
        [
          "WealthAssociate",
          "Customer",
          "CoreMember",
          "ReferralAssociate",
        ].includes(userType)
      ) {
        if (details.ReferredBy)
          await fetchReferredDetails(details.ReferredBy, null);
      } else if (details.AddedBy) {
        await fetchReferredDetails(null, details.AddedBy);
      }
    } catch (error) {
      console.error("Header data fetch failed:", error);
      setUserData((prev) => ({ ...prev, loading: false }));
    }
  }, [fetchReferredDetails]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleProfilePress = useCallback(() => {
    if (!userData.userType) {
      navigation.navigate("Main", {
        screen: "DefaultProfile",
      });
      return;
    }

    const profileRoutes = {
      WealthAssociate: "agentprofile",
      ReferralAssociate: "agentprofile",
      Customer: "CustomerProfile",
      CoreMember: "CoreProfile",
      Investor: "InvestorProfile",
      NRI: "nriprofile",
      SkilledResource: "SkilledProfile",
    };

    navigation.navigate("Main", {
      screen: profileRoutes[userData.userType] || "DefaultProfile",
      params: {
        userId: userData.details?._id,
        userType: userData.userType,
      },
    });
  }, [userData.details?._id, userData.userType, navigation]);

  const getUserInitials = () => {
    const name = userData.details?.FullName || userData.details?.Name || "User";
    const nameParts = name.split(" ");
    let initials = "";

    if (nameParts.length === 1) {
      initials = nameParts[0].charAt(0).toUpperCase();
    } else {
      initials =
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }

    return initials;
  };

  const showReferralCode = [
    "WealthAssociate",
    "Customer",
    "CoreMember",
    "ReferralAssociate",
  ].includes(userData.userType);

  if (userData.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#555" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // Fallback to home screen if can't go back
              navigation.navigate("Main", {
                screen: "newhome",
                params: { setActiveTab: "newhome" },
              });
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#555" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => navigation.navigate("Main", { screen: "newhome" })}
        style={styles.logoContainer}
      >
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.userInfoContainer}>
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
        <View style={styles.profileInitialsContainer}>
          <Text style={styles.profileInitials}>{getUserInitials()}</Text>
        </View>
      </TouchableOpacity>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 70,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop:Platform.OS=="ios"?"10%":"auto"
  },
  loadingContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  backButton: {
    paddingRight: 10,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  userRef: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  profileButton: {
    padding: 5,
    marginLeft: 10,
  },
  profileInitialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Header;
