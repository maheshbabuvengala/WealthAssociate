// utils/notifications.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../data/ApiUrl";

const EXPO_PROJECT_ID = "a7b41893-8484-4ca0-aef0-a61ae92fe285";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Android channel configuration (matches your app.json)
const configureAndroidChannel = async () => {
  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C", // Matches your app.json color
    sound: "default",
    showBadge: true,
  });
};

// Main registration function
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.warn("Must use physical device for Push Notifications");
    return null;
  }

  // Check permissions
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    ({ status } = await Notifications.requestPermissionsAsync());
  }

  if (status !== "granted") {
    Alert.alert(
      "Permission Required",
      "Enable notifications to receive important updates.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return null;
  }

  // Get token
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    })
  ).data;

  // Android-specific configuration
  if (Platform.OS === "android") {
    await configureAndroidChannel();
  }

  return token;
};

// Send token to your backend
export const sendPushTokenToBackend = async (token) => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const authToken = await AsyncStorage.getItem("authToken");

    if (!authToken) {
      await AsyncStorage.setItem("pendingPushToken", token);
      return false;
    }

    const response = await fetch(`${API_URL}/noti/register-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token,
        deviceType: Platform.OS,
        userId: userId || null,
      }),
    });

    if (!response.ok) throw new Error("Failed to register token");

    await AsyncStorage.removeItem("pendingPushToken");
    return true;
  } catch (error) {
    console.error("Error sending token:", error);
    return false;
  }
};

// Handle notification received
export const setupNotificationHandlers = () => {
  // Foreground notifications
  Notifications.addNotificationReceivedListener((notification) => {
    Alert.alert(
      notification.request.content.title || "New Notification",
      notification.request.content.body
    );
  });

  // Notification taps
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.url) {
      Linking.canOpenURL(data.url).then((supported) => {
        if (supported) Linking.openURL(data.url);
      });
    }
  });
};
