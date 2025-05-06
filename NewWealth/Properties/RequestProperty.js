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
      requestData.CustomerId = Details.MobileNumber;
    } else if (userType === "CoreMember") {
      requestData.CoreMemberId = Details.MobileNumber;
    } else if (userType === "Investor") {
      requestData.InvestorId = Details.MobileNumber;
    } else if (userType === "NRI") {
      requestData.NRIId = Details.MobileIN;
    } else if (userType === "SkilledResource") {
      requestData.SkilledId = Details.MobileNumber;
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
        closeModal();
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
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer} ref={modalRef}>
            <ScrollView contentContainerStyle={styles.container}>
              <Text style={styles.header}>Requested Property</Text>

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
                        <Text>{item.name}</Text>
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
                            <Text>{item.name}</Text>
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
                  placeholder="BhavaniPurama"
                  value={islocation}
                  onChangeText={setlocation}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Budget</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your budget"
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
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 10,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: "black",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    backgroundColor: "#e91e63",
    padding: 12,
    width: "100%",
  },
  inputContainer: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: "#bbb",
    padding: 10,
    borderRadius: 25,
    fontSize: 14,
    backgroundColor: "#fff",
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  postButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  placeholderText: {
    color: "rgba(0, 0, 0, 0.5)",
  },
 
});

export default RequestedPropertyForm;
