import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Modify_Deatils from "./InvestorUpdateProfile";
import CustomModal from "../../Components/CustomModal";
import { useNavigation } from "@react-navigation/native";
import { clearHeaderCache } from "../MainScreen/Uppernavigation";

const { width } = Dimensions.get("window");

const InvestorProfile = ({ onDetailsUpdates }) => {
  const [Details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    getDetails();
    loadProfileImage();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
      }
    }
  };

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem("@profileImage");
      if (savedImage !== null) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  const handleImagePicker = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            saveImage(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert("Select Image", "Choose an option", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Gallery",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });

            if (!result.canceled) {
              saveImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Camera",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });

            if (!result.canceled) {
              saveImage(result.assets[0].uri);
            }
          },
        },
      ]);
    }
  };

  const saveImage = async (uri) => {
    try {
      await AsyncStorage.setItem("@profileImage", uri);
      setProfileImage(uri);
    } catch (error) {
      console.error("Error saving profile image:", error);
    }
  };

  const deleteProfileImage = async () => {
    Alert.alert(
      "Delete Profile Image",
      "Are you sure you want to remove your profile image?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@profileImage");
              setProfileImage(null);
            } catch (error) {
              console.error("Error deleting profile image:", error);
              Alert.alert("Error", "Failed to remove profile image");
            }
          },
        },
      ]
    );
  };

  const handleDetailsUpdate = () => {
    getDetails();
  };

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/investors/getinvestor`, {
        method: "GET",
        headers: {
          token: token || "",
        },
      });
      const newDetails = await response.json();
      setDetails(newDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching agent details:", error);
      setLoading(false);
    }
  };

  const LogOut = async () => {
    try {
      // Clear all user-related data from AsyncStorage
      await AsyncStorage.multiRemove([
        "authToken",
        "userType",
        "userData",
        "referredAddedByInfo",
        "@profileImage",
      ]);

      // Clear the in-memory header cache
      clearHeaderCache();

      // Navigate to main screen
      navigation.navigate("Main Screen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const LogOuts = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            Alert.alert(
              "Your delete account request is successfuly submited our executive will reach  you out soon to confirm"
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.agentProfileText}>Investor Profile</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#3E5C76"
            style={styles.loader}
          />
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={{ position: "relative" }}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require("../../assets/man2.png")
                  }
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleImagePicker}
                >
                  <FontAwesome name="camera" size={20} color="white" />
                </TouchableOpacity>

                {profileImage && (
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={deleteProfileImage}
                  >
                    <MaterialIcons name="delete" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.profileCard}>
              <View style={styles.profileForm}>
                {profileFields.map(({ label, icon, key }) => (
                  <CustomInput
                    key={key}
                    label={label}
                    icon={icon}
                    value={Details[key]}
                    labelStyle={styles.label}
                  />
                ))}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={LogOut}>
                  <Text style={styles.buttonTexts}>Logout </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
                onPress={LogOuts}
              >
                <Text style={styles.buttonTexts}>Delete Your Account </Text>
              </TouchableOpacity>
            </View>

            <CustomModal
              isVisible={modalVisible}
              closeModal={() => setModalVisible(false)}
            >
              <Modify_Deatils
                closeModal={() => setModalVisible(false)}
                onDetailsUpdate={handleDetailsUpdate}
              />
            </CustomModal>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const profileFields = [
  { label: "Full Name", icon: "user", key: "FullName" },
  { label: "Mobile Number", icon: "phone", key: "MobileNumber" },
  { label: "Location", icon: "map", key: "Location" },
  { label: "Select Skill", icon: "briefcase", key: "SelectSkill" },
];

const CustomInput = ({ label, icon, value }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value || "-"}
        editable={false}
        pointerEvents="none"
      />
      <FontAwesome name={icon} size={20} color="#3E5C76" style={styles.icon} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  agentProfileText: {
    fontWeight: "Bold",
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "OpenSanssemibold",
  },
  scrollContainer: {
    flexGrow: 1,
    // paddingBottom:"12%"
  },
  container: {
    flex: 1,
    backgroundColor: "#D8E3E7",
    alignItems: "center",
    padding: 20,
    alignSelf: "center",
    width: Platform.OS === "web" ? "80%" : "100%",
  },
  profileForm: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
    justifyContent: Platform.OS === "web" ? "space-between" : "flex-start",
    width: "100%",
    fontWeight: "600",
    fontSize: 16,
  },
  inputWrapper: {
    width: Platform.OS === "web" ? "30%" : "100%",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    width: Platform.OS === "web" ? "100%" : 240,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    width: Platform.OS === "web" ? "100%" : 200,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "#3E5C76",
    padding: 10,
    borderRadius: 15,
  },
  buttonTexts: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "#3E5C76",
    padding: 10,
    borderRadius: 15,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  label: {
    fontSize: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  loader: {
    marginTop: 50,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileCard: {
    width: Platform.OS === "web" ? "80%" : "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cameraButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#3E5C76",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteImageButton: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "#3E5C76",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default InvestorProfile;
