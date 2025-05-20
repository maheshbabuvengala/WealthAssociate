import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { useNavigation } from "@react-navigation/native";

// Add the skilledCategories array from SkilledResources
const skilledCategories = [
  { id: 1, name: "Drilling & Boring", category: "Heavy Equipment" },
  { id: 2, name: "Masons", category: "Construction" },
  { id: 3, name: "Carpenters", category: "Woodwork" },
  { id: 5, name: "Concrete Workers", category: "Construction" },
  { id: 6, name: "Scaffolders", category: "Safety" },
  { id: 7, name: "Plasterers", category: "Finishing" },
  { id: 8, name: "Tilers", category: "Flooring" },
  { id: 9, name: "Painters", category: "Finishing" },
  { id: 10, name: "Roofers", category: "Construction" },
  { id: 11, name: "Welders", category: "Metalwork" },
  { id: 12, name: "Electricians", category: "Electrical" },
  { id: 13, name: "Plumbers", category: "Plumbing" },
  { id: 14, name: "HVAC Techs", category: "Mechanical" },
  { id: 16, name: "Waterproofing", category: "Finishing" },
  { id: 17, name: "Insulators", category: "Finishing" },
  { id: 18, name: "Glaziers", category: "Glasswork" },
  { id: 19, name: "Granite Workers", category: "Stonework" },
  { id: 20, name: "False Ceiling", category: "Interior" },
  { id: 21, name: "Drywall Installers", category: "Interior" },
  { id: 22, name: "Surveyors", category: "Planning" },
  { id: 24, name: "Road Marking", category: "Civil" },
  { id: 25, name: "Pipe Layers", category: "Plumbing" },
  { id: 26, name: "Cable Pullers", category: "Electrical" },
  { id: 27, name: "Drainage Workers", category: "Civil" },
  { id: 28, name: "Concrete Finishers", category: "Construction" },
  { id: 29, name: "Tunnel Workers", category: "Heavy Construction" },
  { id: 30, name: "Fabricators", category: "Metalwork" },
  { id: 31, name: "Solar Installers", category: "Electrical" },
];

const Rskill = ({ closeModal }) => {
  const [fullName, setFullName] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [Details, setDetails] = useState(null);
  const [constituencies, setConstituencies] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState([]);
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
  }, []);

  useEffect(() => {
    const fetchConstituencies = async () => {
      try {
        const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
        const data = await response.json();
        setConstituencies(data);
        setFilteredConstituencies(data.flatMap((item) => item.assemblies));
      } catch (error) {
        console.error("Error fetching constituencies:", error);
      }
    };

    fetchConstituencies();
  }, []);

  // Filter skills based on search input
  useEffect(() => {
    if (skillSearch) {
      const filtered = skilledCategories.filter((category) =>
        category.name.toLowerCase().includes(skillSearch.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skilledCategories);
    }
  }, [skillSearch]);

  // Filter constituencies based on search input
  useEffect(() => {
    if (locationSearch) {
      const filtered = constituencies.flatMap((item) =>
        item.assemblies.filter((assembly) =>
          assembly.name.toLowerCase().includes(locationSearch.toLowerCase())
        )
      );
      setFilteredConstituencies(filtered);
    } else {
      setFilteredConstituencies(
        constituencies.flatMap((item) => item.assemblies)
      );
    }
  }, [locationSearch, constituencies]);

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

      // Use the actual userType or default to "WealthAssociate" if not available
      const registeredByValue = userType || "WealthAssociate";

      const response = await fetch(`${API_URL}/skillLabour/register`, {
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
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Register Skilled Resource</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder="Enter full name"
            />

            <Text style={styles.label}>Select Skill</Text>
            <View style={styles.inputContainer}>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search and select skill"
                  value={showSkillDropdown ? skillSearch : skill}
                  onChangeText={(text) => {
                    if (showSkillDropdown) {
                      setSkillSearch(text);
                    } else {
                      setSkill(text);
                      setSkillSearch(text);
                      setShowSkillDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    setShowSkillDropdown(true);
                    setSkillSearch("");
                  }}
                />
                {showSkillDropdown && (
                  <TouchableOpacity
                    onPress={() => setShowSkillDropdown(false)}
                    style={styles.dropdownToggle}
                  >
                    <Text style={styles.dropdownToggleText}>▲</Text>
                  </TouchableOpacity>
                )}
                {!showSkillDropdown && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowSkillDropdown(true);
                      setSkillSearch("");
                    }}
                    style={styles.dropdownToggle}
                  >
                    <Text style={styles.dropdownToggleText}>▼</Text>
                  </TouchableOpacity>
                )}
              </View>
              {showSkillDropdown && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.scrollContainer}>
                    {filteredSkills.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.listItem}
                        onPress={() => {
                          setSkill(item.name);
                          setSkillSearch("");
                          setShowSkillDropdown(false);
                        }}
                      >
                        <Text>{item.name}</Text>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={styles.label}>Location</Text>
            <View style={styles.inputContainer}>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search and select location"
                  value={showLocationList ? locationSearch : location}
                  onChangeText={(text) => {
                    if (showLocationList) {
                      setLocationSearch(text);
                    } else {
                      setLocation(text);
                      setLocationSearch(text);
                      setShowLocationList(true);
                    }
                  }}
                  onFocus={() => {
                    setShowLocationList(true);
                    setLocationSearch("");
                  }}
                />
                {showLocationList && (
                  <TouchableOpacity
                    onPress={() => setShowLocationList(false)}
                    style={styles.dropdownToggle}
                  >
                    <Text style={styles.dropdownToggleText}>▲</Text>
                  </TouchableOpacity>
                )}
                {!showLocationList && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowLocationList(true);
                      setLocationSearch("");
                    }}
                    style={styles.dropdownToggle}
                  >
                    <Text style={styles.dropdownToggleText}>▼</Text>
                  </TouchableOpacity>
                )}
              </View>
              {showLocationList && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.scrollContainer}>
                    {filteredConstituencies.map((item) => (
                      <TouchableOpacity
                        key={`${item.code}-${item.name}`}
                        style={styles.listItem}
                        onPress={() => {
                          setLocation(item.name);
                          setLocationSearch("");
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

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Enter mobile number"
              maxLength={10}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  loading && styles.disabledButton,
                ]}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    backgroundColor: "#fff",
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
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    padding: 12,
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
    maxHeight: 200, // Increased from 150
    backgroundColor: "#fff",
  },
  scrollContainer: {
    maxHeight: 200, // Increased from 150
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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

export default Rskill;
