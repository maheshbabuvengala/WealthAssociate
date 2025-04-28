import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const Add_Agent = ({ closeModal }) => {
  const [fullname, setFullname] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [constituency, setConstituency] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [districtSearch, setDistrictSearch] = useState("");
  const [constituencySearch, setConstituencySearch] = useState("");
  const [expertiseSearch, setExpertiseSearch] = useState("");
  const [experienceSearch, setExperienceSearch] = useState("");
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [showConstituencyList, setShowConstituencyList] = useState(false);
  const [showExpertiseList, setShowExpertiseList] = useState(false);
  const [showExperienceList, setShowExperienceList] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencys] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [Details, setDetails] = useState({});

  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const districtRef = useRef(null);

  const navigation = useNavigation();

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/districts`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };
  const fetchConstituency = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/constituencys`);
      const data = await response.json();
      setConstituencys(data);
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };
  const fetchExpertise = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/expertise`);
      const data = await response.json();
      setExpertiseOptions(data);
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };
  useEffect(() => {
    fetchDistricts();
    fetchConstituency();
    fetchExpertise();
  }, []);

  const experienceOptions = [
    { name: "0-1 years", code: "01" },
    { name: "1-3 years", code: "02" },
    { name: "3-5 years", code: "03" },
    { name: "5+ years", code: "04" },
  ];

  const filteredDistricts = districts.filter((item) =>
    item.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredConstituencies = constituencies.filter((item) =>
    item.name.toLowerCase().includes(constituencySearch.toLowerCase())
  );

  const filteredExpertise = expertiseOptions.filter((item) =>
    item.name.toLowerCase().includes(expertiseSearch.toLowerCase())
  );

  const filteredExperience = experienceOptions.filter((item) =>
    item.name.toLowerCase().includes(experienceSearch.toLowerCase())
  );

  const getDetails = async () => {
    try {
      // Await the token retrieval from AsyncStorage
      const token = await AsyncStorage.getItem("authToken");

      // Make the fetch request
      const response = await fetch(`${API_URL}/nri/getnri`, {
        method: "GET",
        headers: {
          token: `${token}` || "", // Fallback to an empty string if token is null
        },
      });

      // Parse the response
      const newDetails = await response.json();

      // Update state with the details
      setDetails(newDetails);
      console.log(Details);
    } catch (error) {
      console.error("Error fetching agent details:", error);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);
  useEffect(() => {
    if (Details.MyRefferalCode) {
      setReferralCode(Details.MyRefferalCode); // Pre-fill the referralCode state
    }
  }, [Details]);

  const handleRegister = async () => {
    if (
      !fullname ||
      !mobile ||
      !email ||
      !district ||
      !constituency ||
      !location ||
      !expertise ||
      !experience
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    const selectedDistrict = districts.find((d) => d.name === district);
    const selectedConstituency = constituencies.find(
      (c) => c.name === constituency
    );

    const referenceId = `${selectedDistrict.code}${selectedConstituency.code}`;

    const userData = {
      FullName: fullname,
      MobileNumber: mobile,
      Email: email,
      District: district,
      Contituency: constituency,
      Locations: location,
      Expertise: expertise,
      Experience: experience,
      ReferredBy: referralCode || "WA0000000001", // Use referralCode if provided, else default
      Password: "Wealth",
      MyRefferalCode: referenceId,
      AgentType: "WealthAssociate",
    };

    try {
      const response = await fetch(`${API_URL}/agent/AgentRegister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      setResponseStatus(response.status);

      if (response.ok) {
        const result = await response.json();
        Alert.alert("Success", "Registration successful!");
        closeModal();
      } else if (response.status === 400) {
        const errorData = await response.json();
        Alert.alert("Error", "Mobile number already exists.");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert(
        "Error",
        "Failed to connect to the server. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.register_main}>
            <Text style={styles.register_text}>Register Wealth Associate</Text>
          </View>
          {responseStatus === 400 && (
            <Text style={styles.errorText}>Mobile number already exists.</Text>
          )}

          <View style={styles.webInputWrapper}>
            {/* Row 1 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fullname</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setFullname}
                    returnKeyType="next"
                    onSubmitEditing={() => mobileRef.current.focus()}
                  />
                  <FontAwesome
                    name="user"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={mobileRef}
                    style={styles.input}
                    placeholder="Mobile Number"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setMobile}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current.focus()}
                    onFocus={() => {
                      setShowDistrictList(false);
                      setShowConstituencyList(false);
                      setShowExpertiseList(false);
                      setShowExperienceList(false);
                    }}
                  />
                  <MaterialIcons
                    name="phone"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={emailRef}
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setEmail}
                    returnKeyType="next"
                    onSubmitEditing={() => districtRef.current.focus()}
                    onFocus={() => {
                      setShowDistrictList(false);
                      setShowConstituencyList(false);
                      setShowExpertiseList(false);
                      setShowExperienceList(false);
                    }}
                  />
                  <MaterialIcons
                    name="email"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select District</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={districtRef}
                    style={styles.input}
                    placeholder="Search District"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={districtSearch}
                    onChangeText={(text) => {
                      setDistrictSearch(text);
                      setShowDistrictList(true);
                    }}
                    onFocus={() => setShowDistrictList(true)}
                  />
                  {showDistrictList && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.scrollView}>
                        {filteredDistricts.map((item) => (
                          <TouchableOpacity
                            key={item.name}
                            style={styles.listItem}
                            onPress={() => {
                              setDistrict(item.name);
                              setDistrictSearch(item.name);
                              setShowDistrictList(false);
                            }}
                            onFocus={() => {
                              setShowExperienceList(true);
                              setShowConstituencyList(false);
                            }}
                          >
                            <Text>{item.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Constituency</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search Constituency"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={constituencySearch}
                    onChangeText={(text) => {
                      setConstituencySearch(text);
                      setShowConstituencyList(true);
                    }}
                    onFocus={() => {
                      setShowConstituencyList(true);
                      setShowDistrictList(false);
                    }}
                  />
                  {showConstituencyList && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.scrollView}>
                        {filteredConstituencies.map((item) => (
                          <TouchableOpacity
                            key={item.code}
                            style={styles.listItem}
                            onPress={() => {
                              setConstituency(item.name);
                              setConstituencySearch(item.name);
                              setShowConstituencyList(false);
                            }}
                            onFocus={() => {
                              setShowExperienceList(true);
                              setShowDistrictList(false);
                            }}
                          >
                            <Text>{item.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Experience</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Select Experience"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={experienceSearch}
                    onChangeText={(text) => {
                      setExperienceSearch(text);
                      setShowExperienceList(true);
                    }}
                    onFocus={() => {
                      setShowExperienceList(true);
                      setShowDistrictList(false);
                      setShowConstituencyList(false);
                    }}
                  />
                  {showExperienceList && (
                    <View style={styles.dropdownContainer}>
                      {filteredExperience.map((item) => (
                        <TouchableOpacity
                          key={item.code}
                          style={styles.listItem}
                          onPress={() => {
                            setExperience(item.name);
                            setExperienceSearch(item.name);
                            setShowExperienceList(false);
                          }}
                        >
                          <Text>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Row 3 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Expertise</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Select Expertise"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={expertiseSearch}
                    onChangeText={(text) => {
                      setExpertiseSearch(text);
                      setShowExpertiseList(true);
                    }}
                    onFocus={() => {
                      setShowExpertiseList(true);
                      setShowDistrictList(false);
                      setShowConstituencyList(false);
                      setShowExperienceList(false);
                    }}
                  />
                  {showExpertiseList && (
                    <View style={styles.dropdownContainer}>
                      {filteredExpertise.map((item) => (
                        <TouchableOpacity
                          key={item.code}
                          style={styles.listItem}
                          onPress={() => {
                            setExpertise(item.name);
                            setExpertiseSearch(item.name);
                            setShowExpertiseList(false);
                          }}
                        >
                          <Text>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Location"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setLocation}
                    onFocus={() => {
                      setShowDistrictList(false);
                      setShowConstituencyList(false);
                      setShowExpertiseList(false);
                      setShowExperienceList(false);
                    }}
                  />
                  <MaterialIcons
                    name="location-on"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Referral Code</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Referral Code"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setReferralCode}
                    onFocus={() => {
                      setShowDistrictList(false);
                      setShowConstituencyList(false);
                      setShowExpertiseList(false);
                      setShowExperienceList(false);
                    }}
                    // defaultValue="WA0000000001"
                    value={referralCode}
                  />
                  <MaterialIcons
                    name="card-giftcard"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              disabled={isLoading}
              onPress={closeModal}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <ActivityIndicator
              size="large"
              color="#E82E5F"
              style={styles.loadingIndicator}
            />
          )}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
  },
  register_main: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E82E5F",
    width: Platform.OS === "web" ? "100%" : 260,
    height: 40,
    borderRadius: 20,
  },
  register_text: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    fontSize: 20,
    color: "#ccc",
  },
  card: {
    display: "flex",
    justifyContent: "center",
    width: Platform.OS === "web" ? (width > 1024 ? "100%" : "100%") : "90%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
    borderWidth: Platform.OS === "web" ? 0 : 1,
    borderColor: Platform.OS === "web" ? "transparent" : "#ccc",
  },
  webInputWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: 25,
  },
  scrollView: {
    maxHeight: 200,
  },
  inputRow: {
    flexDirection: Platform.OS === "android" ? "column" : "row",
    justifyContent: "space-between",
    gap: 5,
  },
  inputContainer: {
    width: Platform.OS === "android" ? "100%" : "30%",
    position: "relative",
    zIndex: 1,
  },
  inputWrapper: {
    position: "relative",
    zIndex: 1,
  },
  input: {
    width: "100%",
    height: 47,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 13,
  },
  label: {
    fontSize: 16,
    color: "#191919",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: "#E82E5F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  cancelButton: {
    backgroundColor: "#424242",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  loginText: {
    marginTop: 20,
    fontSize: 16,
    color: "#E82E5F",
  },
  loginLink: {
    fontWeight: "bold",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  dropdownContainer: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  list: {
    maxHeight: 150,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default Add_Agent;
