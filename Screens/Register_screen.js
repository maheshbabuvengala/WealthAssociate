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
import { API_URL } from "../data/ApiUrl";
import logo1 from "../assets/logosub.png";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

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
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showConstituencyModal, setShowConstituencyModal] = useState(false);
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
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
    { name: "15-20 years", code: "05" },
    { name: "20-25 years", code: "06" },
    { name: "25+ years", code: "07" },
  ];

  const filteredDistricts = parliaments.filter((item) =>
    item.parliament.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredConstituencies = assemblies.filter((item) =>
    item.name.toLowerCase().includes(constituencySearch.toLowerCase())
  );

  const filteredExpertise = expertiseOptions.filter((item) =>
    item.name.toLowerCase().includes(expertiseSearch.toLowerCase())
  );

  const filteredExperience = experienceOptions.filter((item) =>
    item.name.toLowerCase().includes(experienceSearch.toLowerCase())
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

  const renderDistrictItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setDistrict(item.parliament);
        setShowDistrictModal(false);
        setDistrictSearch("");
      }}
    >
      <Text style={styles.listItemText}>{item.parliament}</Text>
    </TouchableOpacity>
  );

  const renderConstituencyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setConstituency(item.name);
        setShowConstituencyModal(false);
        setConstituencySearch("");
      }}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderExpertiseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setExpertise(item.name);
        setShowExpertiseModal(false);
        setExpertiseSearch("");
      }}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderExperienceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setExperience(item.name);
        setShowExperienceModal(false);
        setExperienceSearch("");
      }}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            (width < 450 || Platform.OS === "android") &&
              styles.smallScreenScrollContainer,
          ]}
          style={styles.scrollView}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#2B2D42" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.screenTitle}>
                REGISTER AS A {"\n"} WEALTH ASSOCIATE
              </Text>
            </View>
            <Image source={logo1} style={styles.logo} />
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
                      onSubmitEditing={() => emailRef.current.focus()}
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
                      value={email}
                      returnKeyType="next"
                      onSubmitEditing={() => districtRef.current.focus()}
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
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowDistrictModal(true)}
                  >
                    <TextInput
                      ref={districtRef}
                      style={styles.input}
                      placeholder="Select parliament"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={district}
                      editable={false}
                      pointerEvents="none"
                    />
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#E82E5F"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Assemblies</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowConstituencyModal(true)}
                    disabled={!district}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder={
                        district
                          ? "Select Assemblie"
                          : "Select parliament first"
                      }
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={constituency}
                      editable={false}
                      pointerEvents="none"
                    />
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#E82E5F"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Experience</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowExperienceModal(true)}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Select Experience"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={experience}
                      editable={false}
                      pointerEvents="none"
                    />
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#E82E5F"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 3 */}
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Select Expertise</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowExpertiseModal(true)}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Select Expertise"
                      placeholderTextColor="rgba(25, 25, 25, 0.5)"
                      value={expertise}
                      editable={false}
                      pointerEvents="none"
                    />
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#E82E5F"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
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
                      value={"WA0000000001"}
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

      {/* District Modal */}
      <Modal
        visible={showDistrictModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOuterContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Parliament</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search parliament..."
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setDistrictSearch}
                    value={districtSearch}
                    autoFocus={true}
                  />
                  <MaterialIcons
                    name="search"
                    size={24}
                    color="#E82E5F"
                    style={styles.searchIcon}
                  />
                </View>
                <FlatList
                  data={filteredDistricts}
                  renderItem={renderDistrictItem}
                  keyExtractor={(item) => item._id}
                  style={styles.modalList}
                  keyboardShouldPersistTaps="handled"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowDistrictModal(false);
                    setDistrictSearch("");
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Constituency Modal */}
      <Modal
        visible={showConstituencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConstituencyModal(false)}
      >
        <View style={styles.modalOuterContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Assemblies</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search assemblies..."
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setConstituencySearch}
                    value={constituencySearch}
                    autoFocus={true}
                  />
                  <MaterialIcons
                    name="search"
                    size={24}
                    color="#E82E5F"
                    style={styles.searchIcon}
                  />
                </View>
                <FlatList
                  data={filteredConstituencies}
                  renderItem={renderConstituencyItem}
                  keyExtractor={(item, index) => index.toString()}
                  style={styles.modalList}
                  keyboardShouldPersistTaps="handled"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowConstituencyModal(false);
                    setConstituencySearch("");
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Expertise Modal */}
      <Modal
        visible={showExpertiseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExpertiseModal(false)}
      >
        <View style={styles.modalOuterContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Expertise</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search expertise..."
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setExpertiseSearch}
                    value={expertiseSearch}
                    autoFocus={true}
                  />
                  <MaterialIcons
                    name="search"
                    size={24}
                    color="#E82E5F"
                    style={styles.searchIcon}
                  />
                </View>
                <FlatList
                  data={filteredExpertise}
                  renderItem={renderExpertiseItem}
                  keyExtractor={(item) => item.code}
                  style={styles.modalList}
                  keyboardShouldPersistTaps="handled"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowExpertiseModal(false);
                    setExpertiseSearch("");
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Experience Modal */}
      <Modal
        visible={showExperienceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExperienceModal(false)}
      >
        <View style={styles.modalOuterContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Experience</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search experience..."
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    onChangeText={setExperienceSearch}
                    value={experienceSearch}
                    autoFocus={true}
                  />
                  <MaterialIcons
                    name="search"
                    size={24}
                    color="#E82E5F"
                    style={styles.searchIcon}
                  />
                </View>
                <FlatList
                  data={filteredExperience}
                  renderItem={renderExperienceItem}
                  keyExtractor={(item) => item.code}
                  style={styles.modalList}
                  keyboardShouldPersistTaps="handled"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowExperienceModal(false);
                    setExperienceSearch("");
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8E3E7",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  smallScreenScrollContainer: {
    paddingHorizontal: 10,
    paddingTop: width < 450 && Platform.OS === "web" ? 470 : 0,
    height: "100vh",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    top: Platform.OS === "ios" ? "1%" : "undefined",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? "4%" : 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  card: {
    display: "flex",
    justifyContent: "center",
    width:
      width < 450
        ? "95%"
        : Platform.OS === "web"
        ? width > 1024
          ? "60%"
          : "80%"
        : "90%",
    backgroundColor: "#FDFDFD",
    padding: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignItems: "center",
    margin: 20,
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
  inputRow: {
    flexDirection: width < 450 || Platform.OS === "android" ? "column" : "row",
    justifyContent: "space-between",
    gap: 15,
  },
  inputContainer: {
    width: width < 450 || Platform.OS === "android" ? "100%" : "30%",
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
    fontFamily: "Roboto-Regular",
  },
  logo: {
    width: width < 450 ? 105 : 100,
    height: width < 450 ? 105 : 100,
    resizeMode: "contain",
    top: Platform.OS === "ios" ? "20%" : "undefined",
    marginRight: 7,
    marginBottom: Platform.OS === "ios" ? "30%" : 40,
    left:
      Platform.OS === "ios"
        ? "-34%"
        : "undefined" && width < 450
        ? -111
        : "-45%",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 13,
    color: "#3E5C76",
  },
  label: {
    fontSize: 14,
    color: "#191919",
    marginBottom: 8,
    fontFamily: "Roboto-Medium",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 20,
    gap: 15,
  },
  registerButton: {
    backgroundColor: "#3E5C76",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#3E5C76",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    flex: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Roboto-Medium",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Roboto-Regular",
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "Roboto-Italic",
  },
  title: {
    fontWeight: "700",
    fontSize: 22,
    color: "#E82E5F",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Roboto-Bold",
  },
  screenTitle: {
    fontWeight: "700",
    fontSize: 17,
    color: "#2B2D42",
    top: Platform.OS === "ios" ? "30%" : 50,
    left: Platform.OS === "ios" ? "20%" : 50,
    textAlign: "center",
    fontFamily: "Roboto-Bold",
  },
  // Modal styles
  modalOuterContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalKeyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
    marginTop: Platform.OS === "ios" ? 200 : 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2B2D42",
    fontFamily: "Roboto-Bold",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 15,
  },
  searchInput: {
    width: "100%",
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    fontFamily: "Roboto-Regular",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 8,
    color: "#3E5C76",
  },
  modalList: {
    marginBottom: 15,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemText: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
  },
  closeButton: {
    backgroundColor: "#3E5C76",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
  },
});

export default Register_screen;
