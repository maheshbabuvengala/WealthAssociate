import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const RequestedPropertyForm = ({ closeModal }) => {
  const [propertyTitle, setPropertyTitle] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [Details, setDetails] = useState({});
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [islocation, setlocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] =
    useState(false);
  const [userType, setUserType] = useState("");

  const navigation = useNavigation();
  const modalRef = useRef();

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

  // Filter constituencies based on search input
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

  // Handle click outside modal
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={closeModal}>
            <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.modalOverlay}>
        <Text style={styles.header}>Request Property</Text>
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer} ref={modalRef}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Property Type</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() =>
                    setShowPropertyTypeDropdown(!showPropertyTypeDropdown)
                  }
                >
                  <Text style={propertyType ? {} : styles.placeholderText}>
                    {propertyType || "Select Property Type"}
                  </Text>
                </TouchableOpacity>
                {showPropertyTypeDropdown && (
                  <View style={styles.dropdownContainer}>
                    {propertyTypes.map((item) => (
                      <TouchableOpacity
                        key={`${item.code}-${item.name}`}
                        style={styles.listItem}
                        onPress={() => {
                          setPropertyType(item.name);
                          setShowPropertyTypeDropdown(false);
                        }}
                      >
                        <Text style={styles.listItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <ScrollView>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Constituency</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex. Vijayawada"
                    placeholderTextColor="#888"
                    value={locationSearch}
                    onChangeText={(text) => {
                      setLocationSearch(text);
                      setShowLocationList(true);
                    }}
                    onFocus={() => setShowLocationList(true)}
                  />
                  {showLocationList && (
                    <ScrollView>
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
                            <Text style={styles.listItemText}>{item.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>
              </ScrollView>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Property Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="BhavaniPuram"
                  placeholderTextColor="#888"
                  value={islocation}
                  onChangeText={setlocation}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Budget</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your budget"
                  placeholderTextColor="#888"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Property Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex. Need 10 acres land"
                  placeholderTextColor="#888"
                  value={propertyTitle}
                  onChangeText={setPropertyTitle}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.postButton, loading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.postButtonText}>Post</Text>
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
        </TouchableWithoutFeedback>
      </View>
            </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "#D8E3E7",
    justifyContent: "center",
    alignItems: "center",
  paddingBottom:"30%"
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "90%",
    backgroundColor: "#FDFDFD",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2B2D42",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2B2D42",
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E6ED",
    padding: 12,
    borderRadius: 25,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#3E5C76",
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    backgroundColor: "#FDFDFD",
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D8E3E7",
  },
  listItemText: {
    color: "#3E5C76",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  postButton: {
    backgroundColor: "#3E5C76",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  postButtonText: {
    color: "#FDFDFD",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#3E5C76",
    borderWidth: 1,
    borderColor: "#3E5C76",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cancelButtonText: {
    color: "#FDFDFD",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#888",
  },
  placeholderText: {
    color: "#888",
  },
});

export default RequestedPropertyForm;
