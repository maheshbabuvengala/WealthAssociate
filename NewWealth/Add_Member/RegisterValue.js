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
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
// import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

const RegisterValue = ({ closeModal }) => {
  const [fullname, setFullname] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
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
  const [constituencies, setConstituencies] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [Details, setDetails] = useState({});
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors] = useState({});

  const companyNameRef = useRef(null);
  const fullnameRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const districtRef = useRef(null);

  const navigation = useNavigation();

  // Fetch all districts and constituencies from the API
  const fetchDistrictsAndConstituencies = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setDistricts(data); // Set the fetched data to districts
    } catch (error) {
      console.error("Error fetching districts and constituencies:", error);
    }
  };

  // Fetch expertise
  const fetchExpertise = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/expertise`);
      const data = await response.json();
      setExpertiseOptions(data);
    } catch (error) {
      console.error("Error fetching expertise:", error);
    }
  };

  useEffect(() => {
    fetchDistrictsAndConstituencies();
    fetchExpertise();
  }, []);

  const experienceOptions = [
    { name: "0-1 years", code: "01" },
    { name: "1-3 years", code: "02" },
    { name: "3-5 years", code: "03" },
    { name: "5-10 years", code: "04" },
    { name: "10-15 years", code: "05" },
    { name: "15-20 years", code: "06" },
    { name: "20-25 years", code: "07" },
    { name: "25+ years", code: "08" },
  ];

  // Filter districts based on search input
  const filteredDistricts = districts.filter((item) =>
    item.parliament.toLowerCase().includes(districtSearch.toLowerCase())
  );

  // Filter constituencies based on the selected district
  const filteredConstituencies =
    districts
      .find((item) => item.parliament === district)
      ?.assemblies.filter((assembly) =>
        assembly.name.toLowerCase().includes(constituencySearch.toLowerCase())
      ) || [];

  // Filter expertise and experience
  const filteredExpertise = expertiseOptions.filter((item) =>
    item.name.toLowerCase().includes(expertiseSearch.toLowerCase())
  );

  const filteredExperience = experienceOptions.filter((item) =>
    item.name.toLowerCase().includes(experienceSearch.toLowerCase())
  );

  // Fetch agent details
  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/core/getcore`, {
        method: "GET",
        headers: {
          token: ` ${token}` || "",
        },
      });
      const newDetails = await response.json();
      setDetails(newDetails);
    } catch (error) {
      console.error("Error fetching agent details:", error);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  useEffect(() => {
    if (Details.MyRefferalCode) {
      setReferralCode(Details.MyRefferalCode);
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

    const selectedDistrict = districts.find((d) => d.parliament === district);
    const selectedAssembly = selectedDistrict?.assemblies.find(
      (a) => a.name === constituency
    );

    if (!selectedDistrict || !selectedAssembly) {
      Alert.alert("Error", "Invalid district or constituency selected.");
      setIsLoading(false);
      return;
    }

    const referenceId = `${selectedDistrict.parliamentCode}${selectedAssembly.code}`;

    const userData = {
      FullName: fullname,
      MobileNumber: mobile,
      Email: email,
      District: district,
      Contituency: constituency,
      Locations: location,
      Expertise: expertise,
      Experience: experience,
      ReferredBy: referralCode || "WA0000000001",
      Password: "Wealth",
      MyRefferalCode: referenceId,
      AgentType: "ValueAssociate",
    };

    try {
      const response = await fetch(`${API_URL}/agent/AgentRegister`, {
        method: "POST",
        body: formData,
      });

      setResponseStatus(response.status);

      const responseText = await response.text();

      try {
        // Try to parse it as JSON only if there's content
        const result = responseText ? JSON.parse(responseText) : {};

        if (response.ok) {
          Alert.alert("Success", "Registration successful!");
          navigation.goBack();
        } else if (response.status === 400) {
          Alert.alert(
            "Error",
            result.message || "Mobile number already exists."
          );
        } else {
          Alert.alert("Error", result.message || "Something went wrong.");
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        // Handle non-JSON responses here
        if (response.ok) {
          Alert.alert("Success", "Registration successful (non-JSON response)");
          closeModal();
        } else {
          Alert.alert(
            "Error",
            responseText || "Server returned an invalid response"
          );
        }
      }
    } catch (error) {
      console.error("Network error:", error);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.register_main}>
              <Text style={styles.register_text}>
                Register Value Wealth Associate
              </Text>
            </View>
            {responseStatus === 400 && (
              <Text style={styles.errorText}>
                Mobile number already exists.
              </Text>
            )}

            <View style={styles.webInputWrapper}>
              {/* Row 1 */}
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Company Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={companyNameRef}
                      style={styles.input}
                      placeholder="Company Name"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      onChangeText={setCompanyName}
                      value={companyName}
                      returnKeyType="next"
                      onSubmitEditing={() => fullnameRef.current.focus()}
                    />
                    <MaterialIcons
                      name="business"
                      size={20}
                      color="#E82E5F"
                      style={styles.icon}
                    />
                  </View>
                  {errors.companyName && (
                    <Text style={styles.errorText}>{errors.companyName}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Fullname</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={fullnameRef}
                      style={styles.input}
                      placeholder="Full name"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      onChangeText={setFullname}
                      value={fullname}
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
                  {errors.fullname && (
                    <Text style={styles.errorText}>{errors.fullname}</Text>
                  )}
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
                      value={mobile}
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
                  {errors.mobile && (
                    <Text style={styles.errorText}>{errors.mobile}</Text>
                  )}
                </View>
              </View>

              {/* Row 2 */}
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={emailRef}
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      onChangeText={setEmail}
                      value={email}
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
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Parliament</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={districtRef}
                      style={styles.input}
                      placeholder="Search Parliament"
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
                              key={item.parliament}
                              style={styles.listItem}
                              onPress={() => {
                                setDistrict(item.parliament);
                                setDistrictSearch(item.parliament);
                                setShowDistrictList(false);
                                setConstituencySearch(""); // Reset constituency search
                                setConstituency(""); // Reset selected constituency
                              }}
                            >
                              <Text>{item.parliament}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  {errors.district && (
                    <Text style={styles.errorText}>{errors.district}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Assembly</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Search Assembly"
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
                  {errors.constituency && (
                    <Text style={styles.errorText}>{errors.constituency}</Text>
                  )}
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
                  {errors.expertise && (
                    <Text style={styles.errorText}>{errors.expertise}</Text>
                  )}
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
                  {errors.experience && (
                    <Text style={styles.errorText}>{errors.experience}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Location"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      onChangeText={setLocation}
                      value={location}
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
                  {errors.location && (
                    <Text style={styles.errorText}>{errors.location}</Text>
                  )}
                </View>
              </View>

              {/* Row 4 */}
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Referral Code</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Referral Code"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      onChangeText={setReferralCode}
                      editable={false}
                      onFocus={() => {
                        setShowDistrictList(false);
                        setShowConstituencyList(false);
                        setShowExpertiseList(false);
                        setShowExperienceList(false);
                      }}
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
                onPress={() => navigation.goBack()}
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
      </KeyboardAvoidingView>
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
    width: Platform.OS === "web" ? "100%" : "100%",
    height: 50,
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
    top: -20,
    display: "flex",
    justifyContent: "center",
    width: Platform.OS === "web" ? (width > 1024 ? "100%" : "100%") : "100%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
    borderWidth: Platform.OS === "web" ? 0 : 1,
    borderColor: Platform.OS === "web" ? "transparent" : "#ccc",
    paddingBottom: 30,
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
  icon: {
    position: "absolute",
    right: 10,
    top: 13,
  },
  label: {
    fontSize: 16,
    color: "#191919",
    marginBottom: 5,
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
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
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
  // Logo upload styles
  logoUploadContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
});

export default RegisterValue;