import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../../data/ApiUrl";

const AddSupplier = ({ navigation }) => {
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [logo, setLogo] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Location state
  const [constituencies, setConstituencies] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [exactLocation, setExactLocation] = useState("");

  // Vendor categories
  const vendorTypes = [
    { id: 1, name: "Building Materials Suppliers" },
    { id: 2, name: "Equipment and Tool Suppliers" },
    { id: 3, name: "Plumbing and Electrical Suppliers" },
    { id: 4, name: "Paint and Finishing Suppliers" },
    { id: 5, name: "HVAC Suppliers" },
    { id: 6, name: "Landscaping Suppliers" },
    { id: 7, name: "Prefabricated Construction Materials" },
    { id: 8, name: "Waste Management and Disposal" },
    { id: 9, name: "Logistics and Transport" },
    { id: 10, name: "Architectural and Design Suppliers" },
  ];

  // Fetch constituencies on component mount
  useEffect(() => {
    fetchConstituencies();
  }, []);

  const fetchConstituencies = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setConstituencies(data);
    } catch (error) {
      console.error("Error fetching constituencies:", error);
    }
  };

  const filteredConstituencies = constituencies.flatMap((item) =>
    item.assemblies.filter((assembly) =>
      assembly.name.toLowerCase().includes(locationSearch.toLowerCase())
    )
  );

  const clearLocationSelection = () => {
    setLocation("");
    setLocationSearch("");
  };

  // Image handling
  const selectLogoFromGallery = async () => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            setFile(file);
            setLogo(URL.createObjectURL(file));
          }
        };
        input.click();
      } else {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.status !== "granted") {
          alert("Permission is required to upload photos.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setLogo(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Error selecting logo:", error);
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!companyName) newErrors.companyName = "Company name is required";
    if (!ownerName) newErrors.ownerName = "Owner name is required";
    if (!phone) newErrors.phone = "Phone number is required";
    if (!selectedCategory) newErrors.category = "Category is required";
    if (!location) newErrors.location = "Location is required";
    if (!logo) newErrors.logo = "Company logo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("companyName", companyName);
        formData.append("ownerName", ownerName);
        formData.append("phone", phone);
        formData.append("category", selectedCategory);
        formData.append("location", location);
        formData.append("exactLocation", exactLocation);

        // Append logo
        if (Platform.OS === "web") {
          formData.append("logo", file);
        } else if (logo) {
          formData.append("logo", {
            uri: logo,
            name: `logo_${Date.now()}.jpg`,
            type: "image/jpeg",
          });
        }

        // Replace with your actual API endpoint
        const response = await fetch(`${API_URL}/suppliersvendors/addsupplier`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (response.ok) {
          alert("Supplier added successfully!");
          navigation.goBack();
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error("Error adding supplier:", error);
        alert("An error occurred while adding the supplier.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Supplier</Text>

      {/* Logo Upload */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Company Logo</Text>
        {logo ? (
          <View style={styles.logoContainer}>
            <Image source={{ uri: logo }} style={styles.logoImage} />
            <TouchableOpacity
              style={styles.removeLogoButton}
              onPress={() => setLogo(null)}
            >
              <MaterialIcons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={styles.uploadPlaceholder}
              onPress={selectLogoFromGallery}
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
        {errors.logo && <Text style={styles.errorText}>{errors.logo}</Text>}
      </View>

      {/* Company Details */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., ABC Construction Supplies"
          value={companyName}
          onChangeText={setCompanyName}
        />
        {errors.companyName && (
          <Text style={styles.errorText}>{errors.companyName}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Owner Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., John Doe"
          value={ownerName}
          onChangeText={setOwnerName}
        />
        {errors.ownerName && (
          <Text style={styles.errorText}>{errors.ownerName}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., +1234567890"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      {/* Working Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Working Category</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a category" value="" />
          {vendorTypes.map((category) => (
            <Picker.Item
              key={category.id}
              label={category.name}
              value={category.name}
            />
          ))}
        </Picker>
        {errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}
      </View>

      {/* Location */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search location"
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
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Exact Location (Address)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 123 Main Street, Industrial Area"
          value={exactLocation}
          onChangeText={setExactLocation}
          multiline
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitText}>Save Supplier</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
    paddingBottom:"30%"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    width:"100%"
  },
  picker: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#D81B60",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  // Logo upload styles
  logoContainer: {
    position: "relative",
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 10,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "contain",
    backgroundColor: "#f0f0f0",
  },
  removeLogoButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
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
  // Location dropdown styles
  inputWrapper: {
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 8,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 200,
    overflow: "scroll",
    backgroundColor: "#e6708e",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default AddSupplier;
