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
  KeyboardAvoidingView,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../data/ApiUrl";
import { Picker } from "@react-native-picker/picker";
import logo1 from "../assets/logo.png";

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
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [showConstituencyList, setShowConstituencyList] = useState(false);
  const [showExperienceList, setShowExperienceList] = useState(false);
  const [showExpertiseList, setShowExpertiseList] = useState(false);
  const [parliaments, setParliaments] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const districtRef = useRef(null);

  const navigation = useNavigation();

  const experienceOptions = [
    { name: "Beginner", code: "01" },
    { name: "1-5 years", code: "02" },
    { name: "5-10 years", code: "03" },
    { name: "10-15 years", code: "04" },
    { name: "15-20 years", code: "04" },
    { name: "20-25 years", code: "04" },
    { name: "25+ years", code: "04" },
  ];

  const filteredDistricts = parliaments.filter((item) =>
    item.parliament.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredConstituencies = assemblies.filter((item) =>
    item.name.toLowerCase().includes(constituencySearch.toLowerCase())
  );

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setParliaments(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchExpertise = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/expertise`);
      const data = await response.json();
      setExpertiseOptions(data);
    } catch (error) {
      console.error("Error fetching expertise:", error);
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

    const selectedParliament = parliaments.find(
      (item) => item.parliament === district
    );
    const selectedAssembly = assemblies.find(
      (item) => item.name === constituency
    );

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
      MyRefferalCode: `${selectedParliament.parliamentCode}${selectedAssembly.code}`,
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
    fetchData();
    fetchExpertise();
  }, []);

  useEffect(() => {
    if (district) {
      const selectedParliament = parliaments.find(
        (item) => item.parliament === district
      );
      if (selectedParliament) {
        setAssemblies(selectedParliament.assemblies);
      }
    }
  }, [district]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          nestedScrollEnabled={true}
        >
          <View style={styles.card}>
            <Image source={logo1} style={styles.logo} />
            <Text style={styles.tagline}>Your Trusted Property Consultant</Text>
            <Text style={styles.title}>REGISTER AS AN WealthAssociate</Text>

            {responseStatus === 400 && (
              <Text style={styles.errorText}>
                Mobile number already exists.
              </Text>
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
                  <Text style={styles.label}>Select parliament</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={districtRef}
                      style={styles.input}
                      placeholder="Select parliament"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={districtSearch}
                      onChangeText={(text) => {
                        setDistrictSearch(text);
                        setShowDistrictList(true);
                      }}
                      onFocus={() => {
                        setShowDistrictList(true);
                        setShowConstituencyList(false);
                      }}
                    />
                    {showDistrictList && (
                      <View style={styles.dropdownContainer}>
                        <ScrollView style={styles.scrollView}>
                          {filteredDistricts.map((item) => (
                            <TouchableOpacity
                              key={item._id}
                              style={styles.listItem}
                              onPress={() => {
                                setDistrict(item.parliament);
                                setDistrictSearch(item.parliament);
                                setShowDistrictList(false);
                              }}
                            >
                              <Text>{item.parliament}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Assemblies</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Select Assemblie"
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
                          {filteredConstituencies.map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.listItem}
                              onPress={() => {
                                setConstituency(item.name);
                                setConstituencySearch(item.name);
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
                  <Text style={styles.label}>Select Experience</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Search Experience"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={experience}
                      onChangeText={(text) => {
                        setExperience(text);
                        setShowExperienceList(true);
                      }}
                      onFocus={() => {
                        setShowExperienceList(true);
                        setShowExpertiseList(false);
                        setShowDistrictList(false);
                        setShowConstituencyList(false);
                      }}
                    />
                    {showExperienceList && (
                      <View style={styles.dropdownContainer}>
                        <ScrollView style={styles.scrollView}>
                          {experienceOptions.map((option) => (
                            <TouchableOpacity
                              key={option.code}
                              style={styles.listItem}
                              onPress={() => {
                                setExperience(option.name);
                                setShowExperienceList(false);
                              }}
                            >
                              <Text>{option.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
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
                      placeholder="Search Expertise"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={expertise}
                      onChangeText={(text) => {
                        setExpertise(text);
                        setShowExpertiseList(true);
                      }}
                      onFocus={() => {
                        setShowExpertiseList(true);
                        setShowExperienceList(false);
                        setShowDistrictList(false);
                        setShowConstituencyList(false);
                      }}
                    />
                    {showExpertiseList && (
                      <View style={styles.dropdownContainer}>
                        <ScrollView style={styles.scrollView}>
                          {expertiseOptions.map((option) => (
                            <TouchableOpacity
                              key={option.code}
                              style={styles.listItem}
                              onPress={() => {
                                setExpertise(option.name);
                                setShowExpertiseList(false);
                              }}
                            >
                              <Text>{option.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
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
              <TouchableOpacity
                style={styles.cancelButton}
                disabled={isLoading}
                onPress={() => navigation.navigate("RegisterAS")}
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
      </KeyboardAvoidingView>
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
    maxHeight: 400, // Adjust this height as per your UI
  },
  inputRow: {
    flexDirection:
      Platform.OS === "android" || Platform.OS === "ios" ? "column" : "row",
    justifyContent: "space-between",
    gap: 5,
  },
  inputContainer: {
    width: Platform.OS === "android" || Platform.OS === "ios" ? "100%" : "30%",
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
  logo: {
    width: Platform.OS === "android" || Platform.OS === "ios" ? 200 : 200,
    height: Platform.OS === "android" || Platform.OS === "ios" ? 200 : 200,
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
    backgroundColor: "#e6708e",
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
  picker: {
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
});

export default Register_screen;
