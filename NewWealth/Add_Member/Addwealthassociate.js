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
  Modal,
  FlatList,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useFontsLoader from "../../assets/Hooks/useFontsLoader";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isWeb = Platform.OS === "web";

const Add_Agent = ({ closeModal }) => {
  const fontsLoaded = useFontsLoader();
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
  const [constituencies, setConstituencies] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [Details, setDetails] = useState({});
  const [userType, setUserType] = useState("");
  const [valuemember, setValuemember] = useState("");

  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const districtRef = useRef(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const storedUserType = await AsyncStorage.getItem("userType");
      console.log("Stored userType:", storedUserType);
      setUserType(storedUserType);

      if (storedUserType) {
        console.log("Fetching details for userType:", storedUserType);
        await getDetails();
      }
    };

    fetchData();
  }, []);

  const fetchDistrictsAndConstituencies = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts and constituencies:", error);
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

  const filteredDistricts = districts.filter((item) =>
    item.parliament.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredConstituencies =
    districts
      .find((item) => item.parliament === district)
      ?.assemblies.filter((assembly) =>
        assembly.name.toLowerCase().includes(constituencySearch.toLowerCase())
      ) || [];

  const filteredExpertise = expertiseOptions.filter((item) =>
    item.name.toLowerCase().includes(expertiseSearch.toLowerCase())
  );

  const filteredExperience = experienceOptions.filter((item) =>
    item.name.toLowerCase().includes(experienceSearch.toLowerCase())
  );

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      let endpoint = "";

      if (userType === "CoreMember") {
        endpoint = `${API_URL}/core/getcore`;
      } else {
        endpoint = `${API_URL}/agent/AgentDetails`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newDetails = await response.json();
      setDetails(newDetails);

      if (newDetails.valuemember) {
        setValuemember(newDetails.valuemember);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (userType) {
      getDetails();
    }
  }, [userType]);

  useEffect(() => {
    if (Details.MyRefferalCode || Details.ReferralCode) {
      setReferralCode(Details.MyRefferalCode || Details.ReferralCode);
      console.log(Details.MyRefferalCode);
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
      AgentType: "WealthAssociate",
      valuemember: referralCode || "no",
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
        navigation.goBack();
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

  const renderBottomSheet = (type) => {
    let data = [];
    let searchValue = "";
    let setSearch = () => {};
    let setSelected = () => {};
    let setShow = () => {};

    switch (type) {
      case "district":
        data = filteredDistricts;
        searchValue = districtSearch;
        setSearch = setDistrictSearch;
        setSelected = setDistrict;
        setShow = setShowDistrictList;
        break;
      case "constituency":
        data = filteredConstituencies;
        searchValue = constituencySearch;
        setSearch = setConstituencySearch;
        setSelected = setConstituency;
        setShow = setShowConstituencyList;
        break;
      case "expertise":
        data = filteredExpertise;
        searchValue = expertiseSearch;
        setSearch = setExpertiseSearch;
        setSelected = setExpertise;
        setShow = setShowExpertiseList;
        break;
      case "experience":
        data = filteredExperience;
        searchValue = experienceSearch;
        setSearch = setExperienceSearch;
        setSelected = setExperience;
        setShow = setShowExperienceList;
        break;
      default:
        return null;
    }

    return (
      <Modal
        visible={
          type === "district"
            ? showDistrictList
            : type === "constituency"
            ? showConstituencyList
            : type === "expertise"
            ? showExpertiseList
            : showExperienceList
        }
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShow(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheet}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${type}`}
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                value={searchValue}
                onChangeText={setSearch}
                autoFocus={true}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShow(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item, index) =>
                type === "district"
                  ? item.parliament
                  : type === "constituency"
                  ? index.toString()
                  : item.code
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={() => {
                    setSelected(
                      type === "district"
                        ? item.parliament
                        : type === "constituency"
                        ? item.name
                        : item.name
                    );
                    setSearch(
                      type === "district"
                        ? item.parliament
                        : type === "constituency"
                        ? item.name
                        : item.name
                    );
                    setShow(false);
                  }}
                >
                  <Text style={styles.bottomSheetItemText}>
                    {type === "district"
                      ? item.parliament
                      : type === "constituency"
                      ? item.name
                      : item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#D8E3E7",
      width: Platform.OS === "web" ? "80%" : "100%",
      paddingBottom: isWeb ? 0 : 20,
      alignSelf: "center",
      paddingBottom: Platform.OS === "android" ? 120 : 20,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: isWeb ? (width > 1024 ? 20 : 10) : 10,
    },
    register_main: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#D8E3E7",
      width: "100%",
      height: isWeb ? 60 : 70,
      paddingVertical: 10,
    },
    register_text: {
      fontSize: isWeb ? 28 : 24,
      color: "#2B2D42",
      fontWeight: "bold",
      fontFamily: "OpenSanssemibold",
    },
    card: {
      width: isWeb ? (width > 1024 ? "80%" : "90%") : "100%",
      maxWidth: 1200,
      alignSelf: "center",
      backgroundColor: "#FDFDFD",
      shadowColor: "#000",
      shadowOffset: { width: 4, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      borderRadius: 20,
      padding: isWeb ? 30 : 20,
      paddingBottom: isWeb ? 40 : 70,
      marginVertical: isWeb ? 20 : 0,
    },
    webInputWrapper: {
      width: "100%",
      flexDirection: "column",
      gap: isWeb ? 25 : 15,
      marginTop: 25,
    },
    scrollView: {
      maxHeight: 200,
      paddingBottom: Platform.OS === "android" ? 120 : 20,
    },
    inputRow: {
      flexDirection: isWeb ? "row" : "column",
      justifyContent: "space-between",
      gap: isWeb ? 20 : 15,
    },
    inputContainer: {
      width: isWeb ? (isTablet ? "32%" : "100%") : "100%",
      marginBottom: isWeb ? 0 : 10,
      position: "relative",
      zIndex: 1,
    },
    inputWrapper: {
      position: "relative",
      zIndex: 1,
    },
    input: {
      width: "100%",
      height: isWeb ? 50 : 47,
      backgroundColor: "#FFF",
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingRight: 40,
      borderWidth: 2,
      borderColor: "#E0E6ED",
      color: "#2B2D42",
      fontSize: isWeb ? 16 : 14,
      fontFamily: "OpenSanssemibold",
    },
    icon: {
      position: "absolute",
      right: 15,
      top: isWeb ? 15 : 13,
    },
    label: {
      fontSize: isWeb ? 18 : 16,
      color: "#2B2D42",
      marginBottom: 8,
      fontWeight: isWeb ? "500" : "normal",
      fontFamily: "OpenSanssemibold",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
      marginTop: 30,
    },
    registerButton: {
      backgroundColor: "#3E5C76",
      paddingVertical: isWeb ? 15 : 12,
      paddingHorizontal: isWeb ? 30 : 20,
      borderRadius: 15,
      minWidth: isWeb ? 150 : 120,
    },
    cancelButton: {
      backgroundColor: "#3E5C76",
      paddingVertical: isWeb ? 15 : 12,
      paddingHorizontal: isWeb ? 30 : 20,
      borderRadius: 15,
      minWidth: isWeb ? 150 : 120,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: isWeb ? 18 : 16,
      fontWeight: "500",
      textAlign: "center",
    },
    loadingIndicator: {
      marginTop: 20,
    },
    errorText: {
      color: "red",
      fontSize: isWeb ? 16 : 14,
      marginBottom: 10,
      textAlign: "center",
    },
    bottomSheetContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    bottomSheet: {
      backgroundColor: "#FFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: height * 0.7,
      padding: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      height: 50,
      backgroundColor: "#F5F5F5",
      borderRadius: 10,
      paddingHorizontal: 15,
      marginRight: 10,
    },
    closeButton: {
      backgroundColor: "#3E5C76",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
    },
    closeButtonText: {
      color: "#FFF",
      fontWeight: "bold",
    },
    bottomSheetItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#EEE",
    },
    bottomSheetItemText: {
      fontSize: 16,
      color: "#333",
    },
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.register_main}>
            <Text style={styles.register_text}>Register Wealth Associate</Text>
          </View>
          <View style={styles.card}>
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
                    />
                    <FontAwesome
                      name="user"
                      size={isWeb ? 22 : 20}
                      color="#3E5C76"
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
                    />
                    <MaterialIcons
                      name="phone"
                      size={isWeb ? 22 : 20}
                      color="#3E5C76"
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
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <MaterialIcons
                      name="email"
                      size={isWeb ? 22 : 20}
                      color="#3E5C76"
                      style={styles.icon}
                    />
                  </View>
                </View>
              </View>

              {/* Row 2 */}
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Parliament</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={districtRef}
                      style={styles.input}
                      placeholder="Select Parliament"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={district}
                      onFocus={() => setShowDistrictList(true)}
                      editable={false}
                    />
                    <TouchableOpacity
                      style={styles.icon}
                      onPress={() => setShowDistrictList(true)}
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={isWeb ? 28 : 24}
                        color="#3E5C76"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Assembly</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Select Assembly"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={constituency}
                      onFocus={() =>
                        district
                          ? setShowConstituencyList(true)
                          : Alert.alert(
                              "Error",
                              "Please select Parliament first"
                            )
                      }
                      editable={false}
                    />
                    <TouchableOpacity
                      style={styles.icon}
                      onPress={() =>
                        district
                          ? setShowConstituencyList(true)
                          : Alert.alert(
                              "Error",
                              "Please select Parliament first"
                            )
                      }
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={isWeb ? 28 : 24}
                        color="#3E5C76"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Experience</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Select Experience"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={experience}
                      onFocus={() => setShowExperienceList(true)}
                      editable={false}
                    />
                    <TouchableOpacity
                      style={styles.icon}
                      onPress={() => setShowExperienceList(true)}
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={isWeb ? 28 : 24}
                        color="#3E5C76"
                      />
                    </TouchableOpacity>
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
                      value={expertise}
                      onFocus={() => setShowExpertiseList(true)}
                      editable={false}
                    />
                    <TouchableOpacity
                      style={styles.icon}
                      onPress={() => setShowExpertiseList(true)}
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={isWeb ? 28 : 24}
                        color="#3E5C76"
                      />
                    </TouchableOpacity>
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
                    />
                    <MaterialIcons
                      name="location-on"
                      size={isWeb ? 22 : 20}
                      color="#3E5C76"
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
                      editable={false}
                      value={referralCode}
                    />
                    <MaterialIcons
                      name="card-giftcard"
                      size={isWeb ? 22 : 20}
                      color="#3E5C76"
                      style={styles.icon}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  disabled={isLoading}
                  onPress={() => navigation.navigate("addmember")}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Sheets */}
      {renderBottomSheet("district")}
      {renderBottomSheet("constituency")}
      {renderBottomSheet("expertise")}
      {renderBottomSheet("experience")}
    </View>
  );
};

export default Add_Agent;
