import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../data/ApiUrl";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropertyCard from "./PropertyCard";

const { width } = Dimensions.get("window");

const PostProperty = ({ closeModal }) => {
  // State declarations
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [Details, setDetails] = useState({});
  const [PostedBy, setPostedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyTypeSearch, setPropertyTypeSearch] = useState("");
  const [showPropertyTypeList, setShowPropertyTypeList] = useState(false);
  const [postedProperty, setPostedProperty] = useState(null);
  const [constituencies, setConstituencies] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Data fetching functions
  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/agent/AgentDetails`, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });
      const newDetails = await response.json();
      setPostedBy(newDetails.MobileNumber);
      setDetails(newDetails);
    } catch (error) {
      console.error("Error fetching agent details:", error);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/propertytype`);
      const data = await response.json();
      setPropertyTypes(data);
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setConstituencies(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getDetails();
    fetchPropertyTypes();
    fetchData();
  }, []);

  // Filter functions for dropdowns
  const filteredPropertyTypes = propertyTypes.filter((item) =>
    item.name.toLowerCase().includes(propertyTypeSearch.toLowerCase())
  );

  const filteredConstituencies = constituencies.flatMap((item) =>
    item.assemblies.filter((assembly) =>
      assembly.name.toLowerCase().includes(locationSearch.toLowerCase())
    )
  );

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!propertyType) newErrors.propertyType = "Please select a property type";
    if (!location) newErrors.location = "Location is required";
    if (!price) newErrors.price = "Price is required";
    if (!photo) newErrors.photo = "Please upload a photo";
    if (!propertyDetails) newErrors.propertyDetails = "Details are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handlePost = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("propertyType", propertyType);
        formData.append("location", location);
        formData.append("price", price);
        formData.append("PostedBy", PostedBy);
        formData.append("fullName", Details.FullName || Details.Name);
        formData.append("mobile", Details.MobileNumber || PostedBy);
        formData.append("Constituency", constituencies);
        formData.append("propertyDetails", propertyDetails);

        if (photo) {
          if (Platform.OS === "web") {
            if (file) {
              formData.append("photo", file);
            } else if (typeof photo === "string" && photo.startsWith("blob:")) {
              const response = await fetch(photo);
              const blob = await response.blob();
              const file = new File([blob], "photo.jpg", { type: blob.type });
              formData.append("photo", file);
            }
          } else {
            formData.append("photo", {
              uri: photo,
              name: "photo.jpg",
              type: "image/jpeg",
            });
          }
        }

        const response = await fetch(`${API_URL}/properties/addProperty`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (response.ok) {
          setPostedProperty({
            photo: result.photo || photo,
            location,
            price,
            propertyType,
            PostedBy: Details.MobileNumber || PostedBy,
            fullName: Details.FullName || Details.Name,
            mobile: Details.MobileNumber || PostedBy,
            propertyDetails,
          });
          setModalVisible(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error("Error posting property:", error);
        alert("An error occurred while posting the property.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Image handling functions
  const selectImageFromGallery = async () => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPhoto(imageUrl);
            setFile(file);
          }
        };
        input.click();
      } else {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.status !== "granted") {
          alert("Permission is required to upload a photo.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        alert("Camera permission is required to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
    }
  };

  // Helper functions
  const getPropertyDetailsPlaceholder = () => {
    switch (propertyType.toLowerCase()) {
      case "land":
        return "Enter area in acres";
      case "apartment":
        return "Enter area in square feet";
      case "house":
        return "Enter number of bedrooms";
      default:
        return "Enter property details";
    }
  };

  const handleClosePropertyModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setPostedProperty(null);
      setTimeout(() => {
        alert("property posted successfully");
        closeModal();
      }, 100);
    });
  };

  // Clear dropdown selection
  const clearPropertyTypeSelection = () => {
    setPropertyType("");
    setPropertyTypeSearch("");
  };

  const clearLocationSelection = () => {
    setLocation("");
    setLocationSearch("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Post a Property</Text>
        <View style={styles.formContainer}>
          {/* Photo Upload Section */}
          <Text style={styles.label}>Upload Photo</Text>
          <View style={styles.uploadSection}>
            {photo ? (
              <View>
                <Image source={{ uri: photo }} style={styles.uploadedImage} />
                <Button
                  mode="outlined"
                  style={styles.removeButton}
                  onPress={() => setPhoto(null)}
                >
                  Remove
                </Button>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={styles.uploadPlaceholder}
                  onPress={selectImageFromGallery}
                >
                  <MaterialIcons name="photo-library" size={24} color="#555" />
                  <Text style={styles.uploadPlaceholderText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadPlaceholder}
                  onPress={takePhotoWithCamera}
                >
                  <MaterialIcons name="camera-alt" size={24} color="#555" />
                  <Text style={styles.uploadPlaceholderText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}

          {/* Property Type Dropdown */}
          <Text style={styles.label}>Property Type</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search Property Type"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                value={propertyType || propertyTypeSearch}
                onChangeText={(text) => {
                  setPropertyTypeSearch(text);
                  setPropertyType("");
                  setShowPropertyTypeList(true);
                }}
                onFocus={() => setShowPropertyTypeList(true)}
              />
              {propertyType && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearPropertyTypeSelection}
                >
                  <MaterialIcons name="clear" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            {showPropertyTypeList && (
              <View style={styles.dropdownContainer}>
                {filteredPropertyTypes.map((item) => (
                  <TouchableOpacity
                    key={`${item.code}-${item.name}`}
                    style={styles.listItem}
                    onPress={() => {
                      setPropertyType(item.name);
                      setPropertyTypeSearch(item.name);
                      setShowPropertyTypeList(false);
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {errors.propertyType && (
            <Text style={styles.errorText}>{errors.propertyType}</Text>
          )}

          {/* Property Details */}
          {propertyType && (
            <>
              <Text style={styles.label}>Property Details</Text>
              <TextInput
                style={styles.input}
                placeholder={getPropertyDetailsPlaceholder()}
                value={propertyDetails}
                onChangeText={setPropertyDetails}
              />
              {errors.propertyDetails && (
                <Text style={styles.errorText}>{errors.propertyDetails}</Text>
              )}
            </>
          )}

          {/* Location Dropdown */}
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex. Vijayawada"
                value={location || locationSearch}
                onChangeText={(text) => {
                  setLocationSearch(text);
                  setLocation("");
                  setShowLocationList(true);
                }}
                onFocus={() => setShowLocationList(true)}
              />
              {location && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearLocationSelection}
                >
                  <MaterialIcons name="clear" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            {showLocationList && (
              <View style={styles.dropdownContainer}>
                {filteredConstituencies.map((item) => (
                  <TouchableOpacity
                    key={`${item.code}-${item.name}`}
                    style={styles.listItem}
                    onPress={() => {
                      setLocation(item.name);
                      setLocationSearch(item.name);
                      setShowLocationList(false);
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {errors.location && (
            <Text style={styles.errorText}>{errors.location}</Text>
          )}

          {/* Price Input */}
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.postButton, loading && styles.disabledButton]}
              onPress={handlePost}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Post Property</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClosePropertyModal}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          {postedProperty && (
            <PropertyCard
              property={postedProperty}
              closeModal={handleClosePropertyModal}
            />
          )}
        </Animated.View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "ios" ? 90 : 0,
    flex: 1,
    backgroundColor: "#fff",
    width: Platform.OS === "android" || Platform.OS === "ios" ? "100%" : "40%",
    borderRadius: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
    backgroundColor: "#D81B60",
    width: "100%",
    borderRadius: 20,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  formContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#bbb",
    borderRadius: 25,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 8,
  },
  inputWrapper: {
    position: "relative",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 300,
    overflow: "scroll",
    backgroundColor: "#e6708e",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  uploadSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  uploadedImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  uploadPlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  removeButton: {
    marginTop: 10,
    borderColor: "#D81B60",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  postButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#D81B60",
    borderRadius: 8,
    paddingVertical: 14,
    elevation: 2,
  },
  postButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 14,
    elevation: 2,
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default PostProperty;
