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
import { API_URL } from "../../data/ApiUrl";
import logo2 from "../../assets/logo.png"

const { width } = Dimensions.get("window");

const Register_screen = () => {
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
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const districtRef = useRef(null);

  const navigation = useNavigation();

  // const expertiseOptions = [
  //   { name: "Residential", code: "01" },
  //   { name: "Commercial", code: "02" },
  //   { name: "Industrial", code: "03" },
  //   { name: "Agricultural", code: "04" },
  // ];

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

  const handleRegister = async () => {
    if (
      !fullname ||
      !mobile ||
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
      Email: email || "wealthassociate.com@gmail.com",
      District: district,
      Contituency: constituency,
      Locations: location,
      Expertise: expertise,
      Experience: experience,
      ReferredBy: referralCode || "WA0000000001",
      Password: "Wealth",
      MyRefferalCode: referenceId,
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
        navigation.navigate("Login");
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

  useEffect(() => {
    fetchDistricts();
    fetchConstituency();
    fetchExpertise();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        nestedScrollEnabled={true}
      >
        <View style={styles.card}>
          <Image source={logo2} style={styles.logo} />
          <Text style={styles.tagline}>Your Trusted Property Consultant</Text>
          <Text style={styles.title}>REGISTER AS AN AGENT</Text>

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
                    onFocus={() => {
                      setShowDistrictList(false);
                      setShowConstituencyList(false);
                      setShowExpertiseList(false);
                      setShowExperienceList(false);
                    }}
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
                      setShowConstituencyList(false);
                      setShowDistrictList(true);
                    }}
                    onFocus={() => {
                      setShowDistrictList(true);
                      setShowConstituencyList(false);
                      setShowExpertiseList(false);
                      setShowExperienceList(false);
                    }}
                  />
                  {showDistrictList && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={styles.scrollView}
                        scrollEnabled={true}
                      >
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
                      setShowDistrictList(false);
                      // setShowConstituencyList(false);
                      setShowExpertiseList(false);
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
                    defaultValue="WA0000000001"
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
            <TouchableOpacity style={styles.cancelButton} disabled={isLoading}>
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

          <TouchableOpacity
            style={styles.loginText}
            onPress={() => navigation.navigate("Login")}
          >
            <Text>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Login here</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 5 }}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <Text style={{ color: "blue", textDecorationLine: "underline" }}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    display: "flex",
    justifyContent: "center",
    width: Platform.OS === "web" ? (width > 1024 ? "60%" : "80%") : "90%",
    marginTop: Platform.OS === "web" ? "3%" : 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
    margin: 20,
    marginTop: 20,
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
    maxHeight: 200, // Adjust this height as per your UI
  },

  inputRow: {
    flexDirection: Platform.OS === "android" ? "column" : "row",
    justifyContent: "space-between",
    gap: 5,
  },
  inputContainer: {
    width: Platform.OS === "android" ? "100%" : "30%",
    position: "relative",
    zIndex: 1, // Ensure the input container has a zIndex
  },
  inputWrapper: {
    position: "relative",
    zIndex: 1, // Ensure the input wrapper has a zIndex
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
  logo: {
    width: Platform.OS === "android" ? 200 : 200,
    height: Platform.OS === "android" ? 200 : 200,
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
    color: "#e82e5f",
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
    bottom: "100%", // Position the dropdown above the input
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5, // Add space between the dropdown and input
  },

  list: {
    flex: 1,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tagline: {
    marginTop: -30,
    marginBottom: 15,
  },
  title: {
    fontWeight: 700,
    fontSize: 23,
    marginBottom: -10,
  },
});

export default Register_screen;
