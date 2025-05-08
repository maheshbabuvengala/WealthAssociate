import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const screenHeight = Dimensions.get("window").height;
const { width } = Dimensions.get("window");
const isSmallScreen = width < 600;

const RegisterExecute = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    mobile: "",
    email: "",
    district: "",
    constituency: "",
    occupation: "",
    location: "",
  });
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    district: "",
    constituency: "",
    occupation: "",
  });
  const [dropdownVisibility, setDropdownVisibility] = useState({
    district: false,
    constituency: false,
    occupation: false,
  });
  const [districts, setDistricts] = useState([]);
  const [occupationOptions, setOccupationOptions] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [userType, setUserType] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchUserDetails = async () => {
    try {
      const [token, storedUserType] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("userType"),
      ]);

      if (!token || !storedUserType) return;

      setUserType(storedUserType);

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
      setUserDetails(data);

      // Set referral code or fallback to mobile number
      if (data.MyRefferalCode) {
        setReferralCode(data.MyRefferalCode);
      } else {
        // Fallback to MobileNumber or MobileIN based on user type
        const mobileFallback =
          data.MobileNumber || data.MobileIN || "WA0000000001";
        setReferralCode(mobileFallback);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setReferralCode("WA0000000001"); // Default fallback
    }
  };

  // Updated handleRegister function
  const handleRegister = async () => {
    const { fullname, mobile, district, constituency, location, occupation } =
      formData;

    if (
      !fullname ||
      !mobile ||
      !district ||
      !constituency ||
      !location ||
      !occupation
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

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
    const registeredBy = getRegisteredByValue();

    // Determine the ReferredBy value
    const referredByValue =
      referralCode ||
      userDetails.MobileNumber ||
      userDetails.MobileIN ||
      "WA0000000001";

    const userData = {
      FullName: fullname,
      MobileNumber: mobile,
      District: district,
      Contituency: constituency,
      Locations: location,
      Occupation: occupation,
      ReferredBy: referredByValue, // Updated to use fallback values
      Password: "Wealth",
      MyRefferalCode: referenceId,
      RegisteredBY: registeredBy,
    };

    try {
      const response = await fetch(`${API_URL}/customer/CustomerRegister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registration successful!");
        closeModal();
      } else {
        setErrorMessage(
          result.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch all districts and constituencies
  const fetchDistrictsAndConstituencies = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  // Fetch occupations
  const fetchOccupations = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/occupations`);
      const data = await response.json();
      setOccupationOptions(data);
    } catch (error) {
      console.error("Error fetching occupations:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchDistrictsAndConstituencies();
    fetchOccupations();
  }, []);

  // Filter functions
  const filteredDistricts = districts.filter((item) =>
    item.parliament.toLowerCase().includes(searchTerms.district.toLowerCase())
  );

  const filteredConstituencies =
    districts
      .find((item) => item.parliament === formData.district)
      ?.assemblies.filter((assembly) =>
        assembly.name
          .toLowerCase()
          .includes(searchTerms.constituency.toLowerCase())
      ) || [];

  const filteredOccupations = occupationOptions.filter((item) =>
    item.name.toLowerCase().includes(searchTerms.occupation.toLowerCase())
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (field, value) => {
    setSearchTerms((prev) => ({ ...prev, [field]: value }));
    setDropdownVisibility((prev) => ({ ...prev, [field]: true }));
  };

  const closeAllDropdowns = () => {
    setDropdownVisibility({
      district: false,
      constituency: false,
      occupation: false,
    });
  };

  const handleSelectItem = (field, value) => {
    handleInputChange(field, value);
    setSearchTerms((prev) => ({ ...prev, [field]: value }));
    closeAllDropdowns();
  };

  const getRegisteredByValue = () => {
    switch (userType) {
      case "WealthAssociate":
        return "WealthAssociate";
      case "ReferralAssociate":
        return "ReferralAssociate";
      case "CallCenter":
        return "CallCenter";
      case "CoreMember":
        return "CoreMember";
      default:
        return "WealthAssociate";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Register Customer</Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. John Doe"
                value={formData.fullname}
                onChangeText={(text) => handleInputChange("fullname", text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. 9063 392872"
                keyboardType="phone-pad"
                value={formData.mobile}
                onChangeText={(text) => handleInputChange("mobile", text)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Parliament</Text>
              <TextInput
                style={styles.input}
                placeholder="Search Parliament"
                value={searchTerms.district}
                onChangeText={(text) => handleSearchChange("district", text)}
                onFocus={() =>
                  setDropdownVisibility({
                    ...dropdownVisibility,
                    district: true,
                    constituency: false,
                    occupation: false,
                  })
                }
              />
              {dropdownVisibility.district && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.scrollView}>
                    {filteredDistricts.map((item) => (
                      <TouchableOpacity
                        key={item.parliament}
                        style={styles.listItem}
                        onPress={() =>
                          handleSelectItem("district", item.parliament)
                        }
                      >
                        <Text>{item.parliament}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Assembly</Text>
              <TextInput
                style={styles.input}
                placeholder="Search Assembly"
                value={searchTerms.constituency}
                onChangeText={(text) =>
                  handleSearchChange("constituency", text)
                }
                onFocus={() =>
                  setDropdownVisibility({
                    ...dropdownVisibility,
                    constituency: true,
                    district: false,
                    occupation: false,
                  })
                }
                editable={!!formData.district}
              />
              {dropdownVisibility.constituency && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.scrollView}>
                    {filteredConstituencies.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.listItem}
                        onPress={() =>
                          handleSelectItem("constituency", item.name)
                        }
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Occupation</Text>
              <TextInput
                style={styles.input}
                placeholder="Select Occupation"
                value={searchTerms.occupation}
                onChangeText={(text) => handleSearchChange("occupation", text)}
                onFocus={() =>
                  setDropdownVisibility({
                    ...dropdownVisibility,
                    occupation: true,
                    district: false,
                    constituency: false,
                  })
                }
              />
              {dropdownVisibility.occupation && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.scrollView}>
                    {filteredOccupations.map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={styles.listItem}
                        onPress={() =>
                          handleSelectItem("occupation", item.name)
                        }
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. Vijayawada"
                value={formData.location}
                onChangeText={(text) => handleInputChange("location", text)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Referral Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Referral Code"
                value={referralCode}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    // left:10
  },
  errorText: {
    color: "red",
    fontSize: 20,
  },
  container: {
    backgroundColor: "white",
    elevation: 5,
    width: Platform.OS === "android" || Platform.OS === "ios" ? "100%" : "100%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
  },
  smallScreenContainer: {
    // width: 300,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#e91e63",
    textAlign: "center",
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  row: {
    flexDirection:
      Platform.OS === "android" || Platform.OS === "ios" ? "column" : "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  inputContainer: {
    width: Platform.OS === "android" || Platform.OS === "ios" ? "100%" : "48%",
    marginBottom: 10,
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    padding: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Platform.OS === "android" || Platform.OS === "ios" ? "auto" : 20,
  },
  registerButton: {
    backgroundColor: "#e91e63",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  dropdownContainer: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#e6708e",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  scrollView: {
    maxHeight: 200,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default RegisterExecute;
