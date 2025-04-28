import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  BackHandler,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function LoginAdmin() {
  const [mobileNumber, setMobileNumber] = useState(""); // User input for mobile number
  const [password, setPassword] = useState(""); // User input for password
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation(); // Hook to handle navigation

  const handleLogin = async () => {

    if (!mobileNumber || !password) {
      setErrorMessage("Please enter both mobile number and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Simulating API Response
      if (mobileNumber === "12345678" && password === "1234") {
        await AsyncStorage.setItem("authToken", "dummy_token");
        navigation.navigate("Admin"); // Redirects to Dashboard after login
      } else {
        setErrorMessage("Mobile number or password is incorrect.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Exit App", "Are you sure you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.rightSection}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Your Trusted Property Consultant</Text>
          <Text style={styles.welcomeText}>Welcome back! Log in to your account.</Text>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
            <Icon name="call-outline" size={20} color="red" style={styles.icon} />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="red"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : "Login"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Forgetpassword")}>
              <Text style={styles.forgotPassword}>Forgot your Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Define the Dashboard screen
export function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the Dashboard!</Text>
    </SafeAreaView>
  );
}

// Add this to your navigation stack
// Inside App.js or where your navigator is defined
// import { createStackNavigator } from "@react-navigation/stack";
// import { NavigationContainer } from "@react-navigation/native";
// import LoginAdmin, { Dashboard } from "./path-to-this-file";

// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Login" component={LoginAdmin} />
//         <Stack.Screen name="Dashboard" component={Dashboard} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      width: Platform.OS === "web" ? "60%" : "90%", // Reduced width for web
      backgroundColor: "#FFFFFF",
      borderRadius: 15,
      padding: 25,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    welcomeText: {
      fontSize: 18,
      color: "#D81B60",
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: 15,
    },
    tagline: {
      fontSize: 14,
      color: "#757575",
      textAlign: "center",
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      color: "#333",
      fontWeight: "500",
      marginBottom: 5,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#D1D1D1",
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 15,
      backgroundColor: "#FAFAFA",
    },
    input: {
      flex: 1,
      height: 45,
      fontSize: 14,
      color: "#333",
    },
    icon: {
      marginLeft: 10,
    },
    actionContainer: {
      alignItems: "center",
      marginTop: 10,
    },
    loginButton: {
      backgroundColor: "#D81B60",
      borderRadius: 10,
      width: "100%",
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },
    forgotPassword: {
      fontSize: 14,
      color: "#D81B60",
      textAlign: "center",
      marginTop: 10,
    },
    errorText: {
      color: "#D32F2F",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 10,
    },
    illustration: {
      width: 100,
      height: 100,
      alignSelf: "center",
      marginBottom: 10,
    },
  });  