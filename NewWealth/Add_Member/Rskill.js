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

const Rskill = ({ closeModal }) => {
  const [fullName, setFullName] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Details, setDetails] = useState(null);
  const [loadingSkills, setLoadingSkills] = useState(true);
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
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_URL}/discons/skills`);
        const data = await response.json();
        setSkills(data.skills);
        setFilteredSkills(data.skills);
      } catch (error) {
        alert("Error fetching skills: " + error.message);
      } finally {
        setLoadingSkills(false);
      }
    };

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

    fetchSkills();
    fetchConstituencies();
  }, []);

  // Filter skills based on search input
  useEffect(() => {
    if (skillSearch) {
      const filtered = skills.filter((skillItem) =>
        skillItem.toLowerCase().includes(skillSearch.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skills);
    }
  }, [skillSearch, skills]);

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

      // Determine the RegisteredBy value based on user type
      const registeredByValue = [
        "WealthAssociate",
        "ReferralAssociate",
      ].includes(userType)
        ? userType
        : "WealthAssociate";

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
            {loadingSkills ? (
              <ActivityIndicator size="small" color="#E91E63" />
            ) : (
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
                          key={item}
                          style={styles.listItem}
                          onPress={() => {
                            setSkill(item);
                            setSkillSearch("");
                            setShowSkillDropdown(false);
                          }}
                        >
                          <Text>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

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
    // borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    // marginTop: "40%",
    // alignItems:"center",justifyContent:"center",
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
