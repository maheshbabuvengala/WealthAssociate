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
  ActivityIndicator,
  Image,
} from "react-native";
import { API_URL } from "../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import logo1 from "../assets/logo.png";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const RegisterCustomer = ({ closeModal }) => {
  const [fullname, setFullname] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [constituency, setConstituency] = useState("");
  const [occupation, setOccupation] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const [constituencySearch, setConstituencySearch] = useState("");
  const [occupationSearch, setOccupationSearch] = useState("");
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [showConstituencyList, setShowConstituencyList] = useState(false);
  const [showOccupationList, setShowOccupationList] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [occupationOptions, setOccupationOptions] = useState([]);
  const [Details, setDetails] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();
  // Fetch all districts and constituencies
  const fetchDistrictsAndConstituencies = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setDistricts(data); // Set the fetched data to districts
    } catch (error) {
      console.error("Error fetching districts and constituencies:", error);
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
    fetchDistrictsAndConstituencies();
    fetchOccupations();
  }, []);

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

  // Fetch agent details
  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/agent/AgentDetails`, {
        method: "GET",
        headers: {
          token: `${token}` || "",
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

  const closeAllDropdowns = () => {
    setShowDistrictList(false);
    setShowConstituencyList(false);
    setShowOccupationList(false);
  };

  const handleRegister = async () => {
    if (
      !fullname.trim() ||
      !mobile.trim() ||
      !district.trim() ||
      !constituency.trim() ||
      !location.trim() ||
      !occupation.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const selectedDistrict = districts.find((d) => d.parliament === district);
    const selectedConstituency = selectedDistrict?.assemblies.find(
      (a) => a.name === constituency
    );

    if (!selectedDistrict || !selectedConstituency) {
      Alert.alert("Error", "Invalid district or constituency selected.");
      setIsLoading(false);
      return;
    }

    const referenceId = `${selectedDistrict.parliamentCode}${selectedConstituency.code}`;

    const userData = {
      FullName: fullname,
      MobileNumber: mobile,
      District: district,
      Contituency: constituency,
      Locations: location,
      Occupation: occupation,
      ReferredBy: referralCode || "WA0000000001",
      Password: "Wealth",
      MyRefferalCode: referenceId,
      RegisteredBY: "WealthAssociate",
    };

    try {
      const response = await fetch(`${API_URL}/customer/CustomerRegister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert("Success", "Registration successful!");
        closeModal();
      } else if (response.status === 400) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Mobile number already exists.");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        nestedScrollEnabled={true}
      >
        <View style={styles.card}>
          <Image source={logo1} style={styles.logo} />
          <Text style={styles.tagline}>Your Trusted Property Consultant</Text>
          <Text style={styles.title}>REGISTER CUSTOMER</Text>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <View style={styles.webInputWrapper}>
            {/* Row 1 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={fullname}
                    onChangeText={setFullname}
                    onFocus={closeAllDropdowns}
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
                    style={styles.input}
                    placeholder="Mobile Number"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="number-pad"
                    onFocus={closeAllDropdowns}
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
                <Text style={styles.label}>Select parliament </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search parliament"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={districtSearch}
                    onChangeText={(text) => {
                      setDistrictSearch(text);
                      setShowDistrictList(true);
                    }}
                    onFocus={() => {
                      closeAllDropdowns();
                      setShowDistrictList(true);
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
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Assemblie</Text>
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
                      closeAllDropdowns();
                      setShowConstituencyList(true);
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
                <Text style={styles.label}>Select Occupation</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Select Occupation"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={occupationSearch}
                    onChangeText={(text) => {
                      setOccupationSearch(text);
                      setShowOccupationList(true);
                    }}
                    onFocus={() => {
                      closeAllDropdowns();
                      setShowOccupationList(true);
                    }}
                  />
                  {showOccupationList && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.scrollView}>
                        {occupationOptions.map((item) => (
                          <TouchableOpacity
                            key={item.code}
                            style={styles.listItem}
                            onPress={() => {
                              setOccupation(item.name);
                              setOccupationSearch(item.name);
                              setShowOccupationList(false);
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
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Location"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={location}
                    onChangeText={setLocation}
                    onFocus={closeAllDropdowns}
                  />
                  <MaterialIcons
                    name="location-on"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
            </View>

            {/* Row 3 */}
            <View
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Referral Code</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Referral Code"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    // value={referralCode}
                    onChangeText={setReferralCode}
                    onFocus={closeAllDropdowns}
                    defaultValue="WA0000000001"
                    editable={false}
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
              onPress={() => navigation.navigate("Starting Screen")}
              disabled={isLoading}
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
    fontWeight: "700",
    fontSize: 23,
    marginBottom: -10,
  },
});

export default RegisterCustomer;
