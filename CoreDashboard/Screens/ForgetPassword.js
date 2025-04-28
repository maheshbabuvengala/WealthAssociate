import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../../assets/logo.png";
import illustrations from "../../assets/forgot_password.png";

export default function ForgotPassword() {
  const [mobileNo, setMobileNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setErrorMessage(""); // Clear previous error message
    setLoading(true); // Show loader

    try {
      const response = await fetch(`${API_URL}/agent/ForgetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ MobileNo: mobileNo }),
      });

      const data = await response.json();
      setLoading(false); // Hide loader

      if (response.status === 400) {
        setErrorMessage("Mobile number not found.");
      } else {
        await AsyncStorage.setItem("MobileNumber", mobileNo);
        navigation.navigate("otpscreen");
        alert("OTP Sent Successfully!");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled" // Ensures taps are handled properly
      >
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View
            style={
              Platform.OS === "web"
                ? styles.webContentContainer
                : styles.contentContainer
            }
          >
            <Image
              source={illustrations}
              style={styles.illustration}
              resizeMode="contain"
            />

            <View style={styles.formContainer}>
              <Text style={styles.title}>Forgot Password</Text>

              <View style={styles.inputGroup}>
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
                <Text style={styles.label}>Mobile Number</Text>

                {/* Wrapped TextInput inside a View */}
                <View style={{ width: "100%" }}>
                  <TextInput
                    style={[styles.input, { textAlignVertical: "center" }]}
                    keyboardType="phone-pad"
                    placeholder="Ex: 9063392872"
                    value={mobileNo}
                    onChangeText={setMobileNumber}
                    returnKeyType="done"
                  />
                </View>
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.getOtpButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.getOtpButtonText}>Get OTP</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                  style={styles.cancelButton}
                  // onPress={navigation.navigate("Login")}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity> */}
              </View>

              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#ee3b7b"
                  style={styles.loading}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 800,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    elevation: 5,
    height: Platform.OS === "web" ? "80%" : "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 150,
    height: 150,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  webContentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  illustration: {
    width: Platform.OS === "web" ? 350 : 300,
    height: Platform.OS === "web" ? 400 : 150,
    marginBottom: Platform.OS === "web" ? 0 : 16,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    height: "auto",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  getOtpButton: {
    backgroundColor: "#ee3b7b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  getOtpButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#ced4da",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#495057",
    fontWeight: "600",
  },
  loading: {
    marginTop: 10,
  },
});
