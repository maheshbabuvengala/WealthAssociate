import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { useNavigation } from "@react-navigation/native";

const AddInvestor = ({ closeModal }) => {
  const [fullName, setFullName] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [Details, setDetails] = useState(null);
  const [skills, setSkills] = useState(["Land Lord", "Investor"]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [constituencies, setConstituencies] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [userType, setUserType] = useState("");

  const navigation = useNavigation();
  const getDetails = async () => {
    try {
      const [token, storedUserType] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("userType"),
      ]);

      if (!token) return;

      setUserType(storedUserType || "");

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
        case "CallCenter":
          endpoint = `${API_URL}/callcenter/getcallcenter`;
          break;
        default:
          endpoint = `${API_URL}/agent/AgentDetails`;
      }

      const response = await fetch(endpoint, {
        headers: { token },
      });

      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    getDetails();
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

  const handleRegister = async () => {
    if (!fullName || !skill || !location || !mobileNumber) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);
    try {
      // Determine the AddedBy value with fallbacks
      const addedByValue =
        Details?.MobileNumber ||
        Details?.MobileIN ||
        Details?.Number ||
        "Wealthassociate";

      // Determine the RegisteredBy value based on user type
      const registeredByValue = [
        "WealthAssociate",
        "ReferralAssociate",
      ].includes(userType)
        ? userType
        : "WealthAssociate";

      const response = await fetch(`${API_URL}/investors/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FullName: fullName,
          SelectSkill: skill,
          Location: location,
          MobileNumber: mobileNumber,
          AddedBy: addedByValue,
          RegisteredBy: registeredByValue,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Registration successful");
        setFullName("");
        setSkill("");
        setLocation("");
        setMobileNumber("");
        closeModal();
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = () => {
    return (
      <View style={styles.dropdownContainer}>
        <ScrollView style={styles.scrollContainer}>
          {skills.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.listItem}
              onPress={() => {
                setSkill(item);
                setShowDropdown(false);
              }}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    // <KeyboardAvoidingView>
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Register Investor</Text>
        </View>

        <View style={styles.form}>
          {/* Full Name Input */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
          />

          {/* Category Select */}
          <Text style={styles.label}>Select Category</Text>
          <View style={styles.inputContainer}>
            <View style={styles.searchInputContainer}>
              <TouchableOpacity
                style={[styles.searchInput, { justifyContent: "center" }]}
                onPress={() => {
                  setShowDropdown(!showDropdown);
                  setShowLocationList(false);
                }}
              >
                <Text style={skill ? {} : styles.placeholderText}>
                  {skill || "-- Select Category --"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDropdown(!showDropdown)}
                style={styles.dropdownToggle}
              >
                <Text style={styles.dropdownToggleText}>
                  {showDropdown ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>
            {showDropdown && renderDropdown()}
          </View>

          {/* Location Input */}
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ex. Vijayawada"
                placeholderTextColor="#999"
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  setLocationSearch(text);
                  setShowLocationList(text.length > 0);
                }}
                onFocus={() => {
                  setShowLocationList(true);
                  setShowDropdown(false);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowLocationList(!showLocationList)}
                style={styles.dropdownToggle}
              >
                <Text style={styles.dropdownToggleText}>
                  {showLocationList ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>
            {showLocationList && filteredConstituencies.length > 0 && (
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.scrollContainer}>
                  {filteredConstituencies.map((item) => (
                    <TouchableOpacity
                      key={`${item.code}-${item.name}`}
                      style={styles.listItem}
                      onPress={() => {
                        setLocation(item.name);
                        setShowLocationList(false);
                      }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Mobile Number Input */}
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            value={mobileNumber}
            onChangeText={(text) =>
              setMobileNumber(text.replace(/[^0-9]/g, ""))
            }
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#999"
            maxLength={10}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    backgroundColor: "#E91E63",
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    padding: 12,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
  },
  dropdownToggle: {
    padding: 5,
  },
  dropdownToggleText: {
    fontSize: 12,
    color: "#666",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 200,
    backgroundColor: "#e6708e",
  },
  scrollContainer: {
    maxHeight: 150,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  registerButton: {
    backgroundColor: "#E91E63",
    padding: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 25,
    flex: 1,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeholderText: {
    color: "rgba(0, 0, 0, 0.5)",
  },
});

export default AddInvestor;
