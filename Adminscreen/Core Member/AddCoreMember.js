import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const AddCoreMember = ({ closeModal }) => {
  const [fullname, setFullname] = useState("");
  const [mobile, setMobile] = useState("");
  const [district, setDistrict] = useState("");
  const [constituency, setConstituency] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [districtSearch, setDistrictSearch] = useState("");
  const [constituencySearch, setConstituencySearch] = useState("");
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [showConstituencyList, setShowConstituencyList] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [Details, setDetails] = useState({});

  const mobileRef = useRef(null);
  const districtRef = useRef(null);
  const constituencyRef = useRef(null);
  const locationRef = useRef(null);
  const occupationRef = useRef(null);
  const referredByRef = useRef(null);
  const referralCodeRef = useRef(null);

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

  useEffect(() => {
    fetchDistrictsAndConstituencies();
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

  const handleRegister = async () => {
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
      District: district,
      Contituency: constituency,
      Locations: location,
      Occupation: occupation,
      ReferredBy: referredBy || "WA0000000001",
      MyRefferalCode: referenceId,
    };

    try {
      const response = await fetch(`${API_URL}/core/CoreRegister`, {
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
            <Text style={styles.register_text}>Register Core Member</Text>
          </View>
          {responseStatus === 400 && (
            <Text style={styles.errorText}>Mobile number already exists.</Text>
          )}

          <View style={styles.webInputWrapper}>
            {/* Row 1 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
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
                    onSubmitEditing={() => districtRef.current.focus()}
                  />
                  <MaterialIcons
                    name="phone"
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
                <Text style={styles.label}>Select MP Constituency</Text>
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
                            key={item.parliament}
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
                <Text style={styles.label}>Select MLA Constituency</Text>
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
            </View>

            {/* Row 3 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={locationRef}
                    style={styles.input}
                    placeholder="Location"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setLocation}
                    value={location}
                    returnKeyType="next"
                    onSubmitEditing={() => occupationRef.current.focus()}
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
                <Text style={styles.label}>Occupation</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={occupationRef}
                    style={styles.input}
                    placeholder="Occupation"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setOccupation}
                    value={occupation}
                    returnKeyType="next"
                    onSubmitEditing={() => referredByRef.current.focus()}
                  />
                  <MaterialIcons
                    name="work"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
            </View>

            {/* Row 4 */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Referred By</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={referredByRef}
                    style={styles.input}
                    placeholder="Referred By"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setReferredBy}
                    value={referredBy}
                    returnKeyType="next"
                    onSubmitEditing={() => referralCodeRef.current.focus()}
                  />
                  <MaterialIcons
                    name="card-giftcard"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View>
              {/* <View style={styles.inputContainer}>
                <Text style={styles.label}>Referral Code</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={referralCodeRef}
                    style={styles.input}
                    placeholder="Referral Code"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setReferralCode}
                    value={referralCode}
                  />
                  <MaterialIcons
                    name="card-giftcard"
                    size={20}
                    color="#E82E5F"
                    style={styles.icon}
                  />
                </View>
              </View> */}
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
    width: "50%",
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
  scrollView: {
    maxHeight: 200,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  webInputWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    marginTop: 25,
  },
  inputRow: {
    flexDirection: Platform.OS === "android" ? "column" : "row",
    justifyContent: "space-evenly",
    gap: 5,
  },
  inputContainer: {
    width: Platform.OS === "android" ? "100%" : "50%",
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
  loadingIndicator: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
});
export default AddCoreMember;
