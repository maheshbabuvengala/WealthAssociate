import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { NavigationIndependentTree } from "@react-navigation/native";

// Screens
import MainScreen from "./Screens/MainScreen";
import RegisterAsScreen from "./Screens/Register_change";
import ForgotPassword from "./Screens/ForgetPassword";
import OTPVerification from "./Screens/OtpVerification";
import RegisterScreen from "./Screens/Register_screen";
import RegisterCustomer from "./Screens/Customer_Register";
import Login_screen from "./Screens/Login_screen";
import Admin_panel from "./Screens/Admin_panel";
import CustomerDashboard from "./CustomerDashboard/CustomerDashboard";
import CoreDashboard from "./CoreDashboard/CoreDashboard";
import RLogin_screen from "./Refferal/Screens/Login_screen";
import PrivacyPolicy from "./Screens/PrivacyPolicy";
import Admin from "./Admin_Pan/AdminDashboard";
import SkillDasboard from "./SkillDashboard/SkillDashboard";
import NriDashboard from "./NriDashboard/NriDashboard";
import InvestorDashboard from "./InvestorDashboard/InvestorDashboard";
import StartingScreen from "./StartingScreen";
import CallCenterDashboard from "./CallCenterDash/CallCenterDashboard";
import CallCenterLogin from "./CallCenterDash/Login_screen";
import New_Password from "./Screens/New_Password";
import NriRegister from "./Screens/AddNri";
import InvestorRegister from "./Screens/AddInvestors";
import SkilledRegister from "./Screens/Rskill";
import HomeScreen from "./NewWealth/MainScreen/Home";
import Add_Member from "./NewWealth/Add_Member/Add_Member";
import Agent_Profile from "./NewWealth/UsersProfiles/AgentProfile";
import PersistentLayout from "./NewWealth/MainScreen/MainNavigation";
import PropertyHome from "./NewWealth/Properties/PropertyHome";
import ExpertPanel from "./NewWealth/ExpertPanel/ExpertRoute";
import Coreclipro from "./NewWealth/CoreProCli/CoreClientsPro";
import PostProperty from "./NewWealth/Properties/PostProperty";
import RequestedProperty from "./NewWealth/Properties/RequestProperty";
import RequestedExpert from "./NewWealth/ExpertPanel/Requested_expert";
import Add_Agent from "./NewWealth/Add_Member/Add_Agent";

import { API_URL } from "./data/ApiUrl";

const Stack = createStackNavigator();
const APP_VERSION = "1.2.1";
const EXPO_PROJECT_ID = "38b6a11f-476f-46f4-8263-95fe96a6d8ca";

// Configure notifications globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Deep linking configuration
const linking = {
  prefixes: ["https://www.wealthassociate.in"],
  config: {
    screens: {
      "Main Screen": "",
      PrivacyPolicy: "privacy_policy",
    },
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Main Screen");
  const [expoPushToken, setExpoPushToken] = useState("");

  // Helper function to handle notification permission
  const requestNotificationPermission = async () => {
    try {
      // Skip if not a physical device
      if (!Device.isDevice) {
        console.log("Notifications not supported on simulators");
        return;
      }

      // Set up notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: null,
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permission not granted");
        return;
      }

      try {
        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: EXPO_PROJECT_ID,
          })
        ).data;

        setExpoPushToken(token);
        await sendTokenToBackend(token, Platform.OS);
        await AsyncStorage.setItem("expoPushToken", token);
      } catch (tokenError) {
        console.warn("Could not get push token:", tokenError);
      }
    } catch (error) {
      console.error("Notification setup error:", error);
    }
  };

  // Notification listeners setup
  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.url) {
          Linking.canOpenURL(data.url).then((supported) => {
            if (supported) Linking.openURL(data.url);
          });
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // App startup logic
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for updates in production
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Alert.alert("Update Available", "Restart to apply the update.", [
              {
                text: "Restart",
                onPress: async () => await Updates.reloadAsync(),
              },
            ]);
          }
        }

        // Version check and migration
        const storedVersion = await AsyncStorage.getItem("appVersion");
        if (storedVersion !== APP_VERSION) {
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("expoPushToken");
          await AsyncStorage.setItem("appVersion", APP_VERSION);

          // Request notification permission when version changes
          await requestNotificationPermission();
        } else {
          // Also request permission if we don't have a token stored
          const existingToken = await AsyncStorage.getItem("expoPushToken");
          if (!existingToken) {
            await requestNotificationPermission();
          }
        }

        // Determine initial route based on auth state
        const token = await AsyncStorage.getItem("authToken");
        const userType = await AsyncStorage.getItem("userType");

        if (token && userType) {
          switch (userType) {
            case "WealthAssociate":
            case "Referral":
              setInitialRoute("newhome");
              break;
            case "Customer":
              setInitialRoute("CustomerDashboard");
              break;
            case "Investor":
              setInitialRoute("InvestorDashboard");
              break;
            case "Coremember":
              setInitialRoute("CoreDashboard");
              break;
            case "SkilledLabour":
              setInitialRoute("SkillDashboard");
              break;
            case "CallCenter":
            case "Call center":
              setInitialRoute("CallCenterDashboard");
              break;
            case "Nri":
              setInitialRoute("NriDashboard");
              break;
            case "Admin":
              setInitialRoute("Admin");
              break;
            default:
              setInitialRoute("Main Screen");
          }
        }
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer
        linking={Platform.OS === "web" ? linking : undefined}
      >
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Main Screen"
            component={MainScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegisterAS"
            component={RegisterAsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Starting Screen"
            component={StartingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Forgetpassword"
            component={ForgotPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="otpscreen"
            component={OTPVerification}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="newpassword"
            component={New_Password}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegisterCustomer"
            component={RegisterCustomer}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login_screen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Admin_panel}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CustomerDashboard"
            component={CustomerDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CoreDashboard"
            component={CoreDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RefferalDashboard"
            component={RLogin_screen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicy}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Admin"
            component={Admin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SkillDashboard"
            component={SkillDasboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NriDashboard"
            component={NriDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="InvestorDashboard"
            component={InvestorDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CallCenterDashboard"
            component={CallCenterDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CallCenterLogin"
            component={CallCenterLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="nrireg"
            component={NriRegister}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="postproperty"
            component={PostProperty}
            options={{
              presentation: "modal",
              headerShown: false,
              cardOverlayEnabled: true,
              gestureEnabled: true,
              cardStyle: { backgroundColor: "transparent" },
            }}
          />
          <Stack.Screen
            name="requestproperty"
            component={RequestedProperty}
            options={{
              presentation: "modal",
              headerShown: false,
              cardOverlayEnabled: true,
              gestureEnabled: true,
              cardStyle: { backgroundColor: "transparent" },
            }}
          />
          <Stack.Screen
            name="requestexpert"
            component={RequestedExpert}
            options={{ presentation: "transparentModal" }}
          />
          <Stack.Screen
            name="addagent"
            component={Add_Agent}
            options={{ presentation: "transparentModal" }}
          />

          <Stack.Screen
            name="invreg"
            component={InvestorRegister}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="skillreg"
            component={SkilledRegister}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="newhome">
            {() => (
              <PersistentLayout>
                <HomeScreen />
              </PersistentLayout>
            )}
          </Stack.Screen>

          <Stack.Screen name="addmember">
            {() => (
              <PersistentLayout>
                <Add_Member />
              </PersistentLayout>
            )}
          </Stack.Screen>

          <Stack.Screen name="agentprofile">
            {() => (
              <PersistentLayout>
                <Agent_Profile />
              </PersistentLayout>
            )}
          </Stack.Screen>
          <Stack.Screen name="propertyhome">
            {() => (
              <PersistentLayout>
                <PropertyHome />
              </PersistentLayout>
            )}
          </Stack.Screen>
          <Stack.Screen name="expertpanel">
            {() => (
              <PersistentLayout>
                <ExpertPanel />
              </PersistentLayout>
            )}
          </Stack.Screen>
          <Stack.Screen name="coreclipro">
            {() => (
              <PersistentLayout>
                <Coreclipro />
              </PersistentLayout>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

// Helper function to send token to backend
async function sendTokenToBackend(token, deviceType) {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const appVersion = Constants.expoConfig.version || APP_VERSION;
    const authToken = await AsyncStorage.getItem("authToken");

    const response = await fetch(`${API_URL}/noti/register-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token,
        deviceType,
        appVersion,
        userId,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to register token:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending token:", error);
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
});
