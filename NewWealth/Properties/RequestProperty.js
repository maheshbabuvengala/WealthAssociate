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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useFontsLoader from "../../assets/Hooks/useFontsLoader";

const { width } = Dimensions.get("window");
const RequestedPropertyForm = ({ closeModal }) => {
  const fontsLoaded = useFontsLoader();
  const [propertyTitle, setPropertyTitle] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [islocation, setlocation] = useState("");
  const [Details, setDetails] = useState({});
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [propertyTypeSearch, setPropertyTypeSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownModalVisible, setDropdownModalVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  // Fetch user details and user type
  const getDetails = async () => {
    try {
      const [token, storedUserType] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("userType"),
      ]);

      setUserType(storedUserType);

      if (!token) return;

      let endpoint = "";
      switch (storedUserType) {
        case "WealthAssociate":
        case "ReferralAssociate":
          endpoint = `${API_URL}/agent/AgentDetails`;
          break;
        case "Customer":
          endpoint = `${API_URL}/customer/getcustomer`;
          break;
        case "CoreMember":
          endpoint = `${API_URL}/core/getcore`;
          break;
        case "Investor":
          endpoint = `${API_URL}/investors/getinvestor`;
          break;
        case "NRI":
          endpoint = `${API_URL}/nri/getnri`;
          break;
        case "SkilledResource":
          endpoint = `${API_URL}/skillLabour/getskilled`;
          break;
        default:
          endpoint = `${API_URL}/agent/AgentDetails`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });

      const newDetails = await response.json();
      setDetails(newDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch property types from backend
  const fetchPropertyTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/propertytype`);
      const data = await response.json();
      setPropertyTypes(data);
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };

  // Fetch constituencies data
  const fetchConstituencies = async () => {
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
    fetchConstituencies();
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

  // Handle form submission with user type specific logic
  const handleSubmit = async () => {
    if (!propertyTitle || !propertyType || !location || !budget) {
      Alert.alert("Error", "Please fill all the fields.");
      return;
    }

    const requestData = {
      propertyTitle,
      propertyType,
      location,
      islocation,
      Budget: budget,
      userType,
    };

    // Add user identifier based on user type
    if (userType === "WealthAssociate" || userType === "ReferralAssociate") {
      requestData.PostedBy = Details.MobileNumber;
    } else if (userType === "Customer") {
      requestData.PostedBy = Details.MobileNumber;
    } else if (userType === "CoreMember") {
      requestData.PostedBy = Details.MobileNumber;
    } else if (userType === "Investor") {
      requestData.PostedBy = Details.MobileNumber;
    } else if (userType === "NRI") {
      requestData.PostedBy = Details.MobileIN;
    } else if (userType === "SkilledResource") {
      requestData.PostedBy = Details.MobileNumber;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/requestProperty/requestProperty`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", result.message);
        navigation.goBack();
      } else {
        Alert.alert("Error", result.message || "Failed to request property.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

  // Dropdown modal handlers
  const handlePropertyTypePress = () => {
    setActiveDropdown("propertyType");
    setDropdownModalVisible(true);
  };

  const handleLocationPress = () => {
    setActiveDropdown("location");
    setDropdownModalVisible(true);
  };

  const handleDropdownClose = () => {
    setDropdownModalVisible(false);
    setActiveDropdown(null);
  };

  const handlePropertyTypeSelect = (item) => {
    setPropertyType(item.name);
    setPropertyTypeSearch(item.name);
    handleDropdownClose();
  };

  const handleLocationSelect = (item) => {
    setLocation(item.name);
    setLocationSearch(item.name);
    handleDropdownClose();
  };

  // Render dropdown content
  const renderDropdownContent = () => {
    if (activeDropdown === "propertyType") {
      return (
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownTitle}>Select Property Type</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search property types..."
            value={propertyTypeSearch}
            onChangeText={setPropertyTypeSearch}
            autoFocus={true}
          />
          <ScrollView style={styles.dropdownScrollView}>
            {filteredPropertyTypes.map((item) => (
              <TouchableOpacity
                key={`${item.code}-${item.name}`}
                style={styles.dropdownItem}
                onPress={() => handlePropertyTypeSelect(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    } else if (activeDropdown === "location") {
      return (
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownTitle}>Select Location</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={locationSearch}
            onChangeText={setLocationSearch}
            autoFocus={true}
          />
          <ScrollView style={styles.dropdownScrollView}>
            {filteredConstituencies.map((item) => (
              <TouchableOpacity
                key={`${item.code}-${item.name}`}
                style={styles.dropdownItem}
                onPress={() => handleLocationSelect(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Request a Property</Text>
        <View style={styles.formContainer}>
          {/* Property Type Input */}
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
                }}
                onFocus={handlePropertyTypePress}
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
          </View>

          {/* Location Input */}
          <Text style={styles.label}>Location (Constituency)</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex. Vijayawada"
                value={location || locationSearch}
                onChangeText={(text) => {
                  setLocationSearch(text);
                  setLocation("");
                }}
                onFocus={handleLocationPress}
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
          </View>

          {/* Property Location Input */}
          <Text style={styles.label}>Property Location (Area/Landmark)</Text>
          <TextInput
            style={styles.input}
            placeholder="BhavaniPuram"
            placeholderTextColor="rgba(25, 25, 25, 0.5)"
            value={islocation}
            onChangeText={setlocation}
          />

          {/* Budget Input */}
          <Text style={styles.label}>Budget</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your budget"
            placeholderTextColor="rgba(25, 25, 25, 0.5)"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />

          {/* Property Title Input */}
          <Text style={styles.label}>Property Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex. Need 10 acres land"
            placeholderTextColor="rgba(25, 25, 25, 0.5)"
            value={propertyTitle}
            onChangeText={setPropertyTitle}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.postButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Request</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDropdownClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContainer}>
            {renderDropdownContent()}
            <TouchableOpacity
              style={styles.closeDropdownButton}
              onPress={handleDropdownClose}
            >
              <Text style={styles.closeDropdownButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Platform.OS === "android" || Platform.OS === "ios" ? "100%" : "40%",
    borderRadius: 5,
    paddingBottom: 40,
    padding: 30,
    paddingRight: 30,
    backgroundColor: "#D8E3E7",
    alignSelf: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: "10%",
    height: "100vh",
  },
  title: {
    fontSize: 21,
    fontWeight: "400",
    textAlign: "center",
    color: "#2B2D42",
    backgroundColor: "#D8E3E7",
    width: "115%",
    left: -21,
    height: 45,
    top: 0,
    borderRadius: 20,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    fontFamily: "OpenSanssemibold",
  },
  formContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    width: "100%",
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    color: "#2B2D42",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E0E6ED",
    marginBottom: 8,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
  },
  postButton: {
    flex: 1,
    marginRight: 14,
    backgroundColor: "#3E5C76",
    borderRadius: 25,
    paddingVertical: 14,
    elevation: 2,
  },
  postButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#3E5C76",
    borderRadius: 25,
    paddingVertical: 14,
    elevation: 2,
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#B8C2CC",
  },
  // Dropdown modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
    height: "80%",
  },
  dropdownContent: {
    flex: 1,
    width: "100%",
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  dropdownScrollView: {
    flex: 1,
    width: "100%",
    marginBottom: 15,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeDropdownButton: {
    backgroundColor: "#3E5C76",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
  },
  closeDropdownButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RequestedPropertyForm;