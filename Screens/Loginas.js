import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import logo1 from "../assets/ped.jpeg";
import logo2 from "../assets/logo.png";
import logo from "../assets/logo.png";

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      {/* Profile Image Positioned Overlapping Card */}
      <View style={styles.profileContainer}>
        <Image source={logo1} style={styles.profileImage} />
      </View>

      {/* Card Section */}
      <View style={styles.card}>
        <Image source={logo2} style={styles.logo} />
        <Image source={logo} style={styles.logo} />
        <View style={styles.buttonRow}>
          <View style={styles.buttonColumn}>
            <Text style={styles.subText}>if already registered</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonColumn}>
            <Text style={styles.subText}>New user</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    position: "absolute",
    top: "17%", // Adjusted to position profile image properly
    alignItems: "center",
    zIndex: 2, // Ensures image is above the card
  },
  profileImage: {
    width: 190,
    height: 190,
    borderRadius: 110,
    borderWidth: 5,
    borderColor: "#FF3366",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    width: "50%",
    height: "60%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginTop: 100, // Ensures proper spacing
  },
  logo: {
    width: 150,
    height: 100,
    resizeMode: "contain",
    marginTop: 105, // To ensure logo is under the profile image
    marginBottom: 5,
  },
  consultantText: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
    color: "#444",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  buttonColumn: {
    alignItems: "center",
    flex: 1,
  },
  subText: {
    fontSize: 12,
    color: "#777",
    marginBottom: 5,
    marginTop: 25,
    marginLeft: 15,
  },
  button: {
    backgroundColor: "#FF3366",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    marginTop: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
});

export default LoginScreen;
