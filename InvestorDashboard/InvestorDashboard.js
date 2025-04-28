import React, { useEffect, useState } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import Login_screen from "./Screens/Login_screen";
import Register_Screen from "./Screens/Register_screen";
import Admin_panel from "./Screens/Admin_panel";
import ForgotPassword from "./Screens/ForgetPassword";
import OTPVerification from "./Screens/OtpVerification";
import New_Password from "./Screens/New_Password";
import Agent_Profile from "./Screens/Agent/Agent_Profile";
import PrivacyPolicy from "./Screens/PrivacyPolicy";
import StartingScreen from "../StartingScreen";
import { NavigationIndependentTree } from "@react-navigation/native";
import App from "../App";
// import CustomerDashboard from "./CustomerDashboard/CustomerDashboard";

const Stack = createStackNavigator();

export default function CustomerDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // Track login state
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Check login status on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken"); // Replace "userToken" with your key
        setIsLoggedIn(token !== null); // Set login state based on token presence
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    checkLoginStatus();
  }, []);

  // Show a loading indicator while checking login status
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isLoggedIn ? "Home" : "Login"} // Set initial route based on login status
        >
          <Stack.Screen
            name="Login"
            component={Login_screen}
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
            name="Starting Screen"
            component={StartingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Admin_panel}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicy}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="App"
            component={App}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
});
