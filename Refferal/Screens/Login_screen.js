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
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function RLogin_screen() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      setErrorMessage("Please enter both mobile number and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/agent/AgentLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          MobileNumber: mobileNumber,
          Password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        const token = data.token; // Assuming the token is in the 'token' field
        await AsyncStorage.setItem("authToken", token); // Store the token in AsyncStorage
        console.log("Token stored in AsyncStorage:", token);

        navigation.navigate("Home");
      } else {
        setErrorMessage(
          data.message || "Mobile number or password is incorrect."
        );
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const onBackPress = () => {
  //       Alert.alert("Exit App", "Are you sure you want to exit?", [
  //         { text: "Cancel", style: "cancel" },
  //         { text: "Exit", onPress: () => BackHandler.exitApp() },
  //       ]);
  //       return true; // Prevent navigating back
  //     };

  //     BackHandler.addEventListener("hardwareBackPress", onBackPress);

  //     return () =>
  //       BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  //   }, [])
  // );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {Platform.OS !== "android" && (
          <View style={styles.leftSection}>
            <Image
              source={require("../../assets/logo2.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}

        <View
          style={[
            styles.rightSection,
            Platform.OS === "android" ? { flex: 1 } : null,
          ]}
        >
          <Image
            source={
              Platform.OS === "android"
                ? require("../../assets/logo.png")
                : require("../../assets/logo.png")
            }
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Your Trusted Property Consultant</Text>

          <Text style={styles.welcomeText}>
            Welcome back! Log in to your account.
          </Text>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex. 9063392872"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
            <Icon
              name="call-outline"
              size={20}
              color="red"
              style={styles.icon}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Password"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
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
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  "Login"
                )}
              </Text>
            </TouchableOpacity>
            {/* {loading && } */}

            <TouchableOpacity
              onPress={() => navigation.navigate("Forgetpassword")}
            >
              <Text style={styles.forgotPassword}>Forgot your Password?</Text>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
            style={styles.signupContainer}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.signupText}>
              Don't have an account?{" "}
              <Text style={styles.signupLink}>Sign up here</Text>
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "90%",
    maxWidth: 980,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: "row",
    padding: 20,
  },
  leftSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20,
  },
  rightSection: {
    flex: 1,
    paddingLeft: 20,
  },
  logo: {
    width: 247,
    height: 169,
  },
  tagline: {
    marginTop: -35,
    marginBottom: 20,
    fontFamily: "Cairo",
    fontSize: 10,
    color: "#000000",
    textAlign: "center",
  },
  illustration: {
    width: 144,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#E82E5F",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#191919",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    fontFamily: "Cairo",
    fontSize: 16,
    padding: 15,
    height: 47,
    flex: 1,
  },
  icon: {
    marginLeft: 10,
  },
  actionContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: "#E82E5F",
    borderRadius: 15,
    width: 100,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontFamily: "Cairo",
    fontSize: 16,
    alignItems: "center",
  },
  forgotPassword: {
    color: "#E82E5F",
    fontFamily: "Cairo",
    fontSize: 16,
    marginTop: 20,
  },
  signupContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  signupText: {
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#191919",
  },
  signupLink: {
    color: "#E82E5F",
  },
  errorText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
