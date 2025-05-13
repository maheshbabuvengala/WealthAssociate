import React, { useState, useEffect } from "react";
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
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import logo1 from "../assets/logo2.png";
import logo2 from "../assets/logo.png";
// import { useNavigation } from "@react-navigation/native";

export default function Login_screen() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState("");
  const navigation = useNavigation();
  const [adminData, setAdminData] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  // const navigation = useNavigation();

  useEffect(() => {
    if (clickCount === 5) {
      setClickCount(0); // Reset count
      Alert.alert("Welcome to call center dashboard");
      navigation.navigate("CallCenterLogin"); // Replace with your actual screen name
    }
  }, [clickCount]);

  const handleLogoPress = () => {
    setClickCount((prev) => prev + 1);
  };

  useEffect(() => {
    fetchAdminData();
    getLoginType();
  }, []);

  const getLoginType = async () => {
    try {
      const type = await AsyncStorage.getItem("loginType");
      if (type) {
        setLoginType(type);
      }
    } catch (error) {
      console.error("Error getting login type:", error);
    }
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${API_URL}/admindata`);
      if (!response.ok) {
        throw new Error("Failed to fetch admin data");
      }
      const data = await response.json();
      setAdminData(data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      Alert.alert("Error", "Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Admin login check
    if (
      mobileNumber === `${adminData?.UserName}` &&
      password === `${adminData?.Password}`
    ) {
      navigation.navigate("Admin");
      return;
    }

    if (!mobileNumber || !password) {
      setErrorMessage("Please enter both mobile number and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      let endpoint = "";
      let userType = "";

      // Determine API endpoint based on login type
      switch (loginType) {
        case "WealthAssociate":
          endpoint = `${API_URL}/agent/AgentLogin`;
          userType = "WealthAssociate";
          break;
        case "Customer":
          endpoint = `${API_URL}/customer/CustomerLogin`;
          userType = "Customer";
          break;
        case "CoreMember":
          endpoint = `${API_URL}/core/coreLogin`;
          userType = "CoreMember";
          break;
        case "ReferralAssociate":
          endpoint = `${API_URL}/agent/AgentLogin`;
          userType = "WealthAssociate";
          break;
        case "Investor":
          endpoint = `${API_URL}/investors/investorlogin`;
          userType = "Investor";
          break;
        case "NRI":
          endpoint = `${API_URL}/nri/nrilogin`;
          userType = "NRI";
          break;
        case "SkilledResource":
          endpoint = `${API_URL}/skillLabour/skilllogin`;
          userType = "SkilledResource";
          break;
        case "CallCenter":
          endpoint = `${API_URL}/callexe/logincall-executives`;
          userType = "CallCenter";
          break;
        default:
          endpoint = `${API_URL}/agent/AgentLogin`;
          userType = "WealthAssociate";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          MobileNumber: mobileNumber,
          Password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        const token = data.token;
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userType", userType);
        console.log("Token stored in AsyncStorage:", token);

        if (userType === "CallCenter") {
          navigation.navigate("CallCenterDashboard");
        } else {
          navigation.navigate("Main");
        }
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            {Platform.OS !== "android" && Platform.OS !== "ios" && (
              <View style={styles.leftSection}>
                <TouchableOpacity onPress={handleLogoPress}>
                  <Image
                    source={logo1}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={[
                styles.rightSection,
                Platform.OS === "android" || Platform.OS === "ios"
                  ? { flex: 1 }
                  : null,
              ]}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color="#E82E5F" />
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={handleLogoPress}> */}
                <Image
                  source={
                    Platform.OS === "android" || Platform.OS === "ios"
                      ? logo2
                      : logo2
                  }
                  style={styles.illustration}
                  resizeMode="contain"
                />
              {/* </TouchableOpacity> */}
              <Text style={styles.tagline}>
                Your Trusted Property Consultant
              </Text>
              <TouchableOpacity onPress={handleLogoPress}>
                <Text style={styles.welcomeText}>
                  Welcome back! Log in to your {loginType} account.
                </Text>
              </TouchableOpacity>

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
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
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

                <TouchableOpacity
                  onPress={() => navigation.navigate("Forgetpassword")}
                >
                  <Text style={styles.forgotPassword}>
                    Forgot your Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: 10,
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
