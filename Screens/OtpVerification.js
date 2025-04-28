import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../data/ApiUrl";
import { useNavigation } from "@react-navigation/native";

const OTP = () => {
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [timer, setTimer] = useState(30);
  const [otpSubmitted, setOtpSubmitted] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const inputRefs = useRef([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMobileNumber = async () => {
      try {
        const storedMobileNumber = await AsyncStorage.getItem("MobileNumber");
        if (storedMobileNumber) {
          setMobileNumber(storedMobileNumber);
        }
      } catch (error) {
        console.error("Error fetching mobile number from AsyncStorage:", error);
      }
    };
    fetchMobileNumber();
  }, []);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("").replace(/\D/g, "").trim();

    if (
      otp.every((digit) => digit.trim() !== "") &&
      otpCode.length === 4 &&
      mobileNumber
    ) {
      try {
        const response = await fetch(`${API_URL}/agent/VerifyOtp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mobileNumber, otp: otpCode }),
        });

        const data = await response.json();
        if (response.ok) {
          Alert.alert("OTP Verified", "Your OTP is correct.");
          navigation.navigate("newpassword");
          setOtpSubmitted(true);
        } else {
          Alert.alert("Invalid OTP", "Please enter the correct OTP.");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        Alert.alert("Error", "An error occurred while verifying OTP.");
      }
    } else {
      Alert.alert("Invalid OTP", "Please enter a 4-digit OTP.");
    }
  };

  const resendOTP = () => {
    setOtp(Array(4).fill(""));
    setTimer(30);
    setOtpSubmitted(false);
    Alert.alert("OTP Resent", "A new OTP has been sent to your mobile.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
            <View style={styles.main}>
              <View>
                <Image
                  source={require("../assets/forgot_password.png")}
                  style={styles.logos}
                />
              </View>
              <View>
                <Text style={styles.header}>Verification</Text>
                <Text style={styles.subHeader}>Enter OTP</Text>

                <View style={styles.otpInputContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      style={styles.otpBox}
                      maxLength={1}
                      keyboardType="number-pad"
                      onChangeText={(text) => handleOtpChange(text, index)}
                      value={digit}
                      autoFocus={index === 0}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                  ))}
                </View>

                <Text style={styles.timerText}>
                  {timer > 0
                    ? `00:${timer < 10 ? `0${timer}` : timer} seconds`
                    : "Time expired!"}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    otpSubmitted || otp.some((digit) => !digit)
                      ? styles.disabledButton
                      : {},
                  ]}
                  onPress={verifyOTP}
                  disabled={otpSubmitted || otp.some((digit) => !digit)}
                >
                  <Text style={styles.buttonText}>Verify</Text>
                </TouchableOpacity>

                <Text style={styles.resendText}>
                  If you don't receive the code?{" "}
                  <Text style={styles.resendLink} onPress={resendOTP}>
                    Resend
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 50,
    width: Platform.OS === "web" ? "60%" : "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  logos: {
    width: Platform.OS === "web" ? "300px" : 250,
    height: Platform.OS === "web" ? "400px" : 200,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 8,
    backgroundColor: "#f3f3f3",
  },
  timerText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "bold",
    marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: "#e6005c",
    padding: 12,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    alignSelf: "center",
  },
  disabledButton: {
    backgroundColor: "#f3a0c0",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendText: {
    marginTop: 15,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  resendLink: {
    color: "#e6005c",
    fontWeight: "bold",
  },
  main: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 30,
  },
});

export default OTP;
