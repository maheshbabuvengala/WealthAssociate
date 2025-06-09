import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { API_URL } from "../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import logo1 from "../assets/logosub.png";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const AddNRIMember = ({ closeModal }) => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [locality, setLocality] = useState("");
  const [indianLocation, setIndianLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [mobileIN, setMobileIN] = useState("");
  const [mobileCountryNo, setMobileCountryNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [Details, setDetails] = useState({});
  const [constituencies, setConstituencies] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const navigation = useNavigation();
  
  const countries = [
    { label: "United Arab Emirates", value: "uae" },
    { label: "United States of America", value: "usa" },
    { label: "Saudi Arabia", value: "saudi_arabia" },
    { label: "Canada", value: "canada" },
    { label: "United Kingdom", value: "uk" },
    { label: "Australia", value: "australia" },
    { label: "Kuwait", value: "kuwait" },
    { label: "Qatar", value: "qatar" },
    { label: "Oman", value: "oman" },
    { label: "Singapore", value: "singapore" },
  ];

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
    fetchConstituencies();
  }, []);

  const fetchConstituencies = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setConstituencies(data);
    } catch (error) {
      console.error("Error fetching constituencies:", error);
    }
  };

  const filteredConstituencies = constituencies.flatMap((item) =>
    item.assemblies.filter((assembly) =>
      assembly.name.toLowerCase().includes(locationSearch.toLowerCase())
    )
  );

  const filteredCountries = countries.filter((item) =>
    item.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setCountry(item.label);
        setShowCountryModal(false);
        setCountrySearch("");
      }}
    >
      <Text style={styles.listItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setIndianLocation(item.name);
        setShowLocationModal(false);
        setLocationSearch("");
      }}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleAddMember = async () => {
    if (
      !name ||
      !country ||
      !locality ||
      !indianLocation ||
      !occupation ||
      !mobileIN ||
      !mobileCountryNo
    ) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/nri/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: name,
          Country: country,
          Locality: locality,
          IndianLocation: indianLocation,
          Occupation: occupation,
          MobileIN: mobileIN,
          MobileCountryNo: mobileCountryNo,
          AddedBy: "WA0000000001",
          RegisteredBy: "WealthAssociate",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message);
        setName("");
        setCountry("");
        setLocality("");
        setIndianLocation("");
        setOccupation("");
        setMobileIN("");
        setMobileCountryNo("");
        navigation.navigate("Starting Screen");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server");
    }
    setLoading(false);
  };

  // Render web layout with 3 fields per row
  const renderWebLayout = () => (
    <View style={styles.webContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.screenTitle}>ADD NRI MEMBER</Text>
        </View>
        <Image source={logo1} style={styles.logo} />
      </View>

      <View style={styles.card}>
        {/* Row 1 */}
        <View style={styles.webRow}>
          {/* Name */}
          <View style={styles.webInputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                onChangeText={setName}
                value={name}
              />
              <FontAwesome
                name="user"
                size={20}
                color="#3E5C76"
                style={styles.icon}
              />
            </View>
          </View>

          {/* Country */}
          <View style={styles.webInputContainer}>
            <Text style={styles.label}>Country</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowCountryModal(true)}
            >
              <TextInput
                style={styles.input}
                placeholder="Select Country"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                value={country}
                editable={false}
                pointerEvents="none"
              />
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color="#3E5C76"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          {/* Locality */}
          <View style={styles.webInputContainer}>
            <Text style={styles.label}>Locality (Abroad)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex. Dallas"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                onChangeText={setLocality}
                value={locality}
              />
              <MaterialIcons
                name="location-on"
                size={20}
                color="#3E5C76"
                style={styles.icon}
              />
            </View>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.webRow}>
          {/* Indian Location */}
          <View style={styles.webInputContainer}>
            <Text style={styles.label}>Location in India</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowLocationModal(true)}
            >
              <TextInput
                style={styles.input}
                placeholder="Select Location"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                value={indianLocation}
                editable={false}
                pointerEvents="none"
              />
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color="#3E5C76"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          {/* Occupation */}
          <View style={styles.webInputContainer}>
            <Text style={styles.label}>Occupation</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex. Software Engineer"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                onChangeText={setOccupation}
                value={occupation}
              />
              <MaterialIcons
                name="work"
                size={20}
                color="#3E5C76"
                style={styles.icon}
              />
            </View>
          </View>

          {/* Mobile IN */}
          <View style={styles.webInputContainer}>
            <Text style={styles.label}>Mobile IN (WhatsApp No.)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex. 9063392872"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                onChangeText={(text) =>
                  setMobileIN(text.replace(/[^0-9]/g, ""))
                }
                value={mobileIN}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <MaterialIcons
                name="phone"
                size={20}
                color="#3E5C76"
                style={styles.icon}
              />
            </View>
          </View>
        </View>

        {/* Row 3 - Single field spanning full width */}
        <View style={styles.webRow}>
          {/* Mobile Country No */}
          <View style={[styles.webInputContainer]}>
            <Text style={styles.label}>Mobile Country No (WhatsApp No.)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex. 9063392872"
                placeholderTextColor="rgba(25, 25, 25, 0.5)"
                onChangeText={(text) =>
                  setMobileCountryNo(text.replace(/[^0-9]/g, ""))
                }
                value={mobileCountryNo}
                keyboardType="phone-pad"
                maxLength={15}
              />
              <MaterialIcons
                name="phone"
                size={20}
                color="#3E5C76"
                style={styles.icon}
              />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleAddMember}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate("RegisterAS")}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#3E5C76"
            style={styles.loadingIndicator}
          />
        )}
      </View>
    </View>
  );

  // Render mobile layout (original)
  const renderMobileLayout = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#2B2D42" />
  </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.screenTitle}>ADD NRI MEMBER</Text>
        </View>
        <Image source={logo1} style={styles.logo} />
      </View>

      <View style={styles.card}>
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              onChangeText={setName}
              value={name}
            />
            <FontAwesome
              name="user"
              size={20}
              color="#3E5C76"
              style={styles.icon}
            />
          </View>
        </View>

        {/* Country Select */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowCountryModal(true)}
          >
            <TextInput
              style={styles.input}
              placeholder="Select Country"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              value={country}
              editable={false}
              pointerEvents="none"
            />
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color="#3E5C76"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Locality Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Locality (Abroad)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ex. Dallas"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              onChangeText={setLocality}
              value={locality}
            />
            <MaterialIcons
              name="location-on"
              size={20}
              color="#3E5C76"
              style={styles.icon}
            />
          </View>
        </View>

        {/* Location in India Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location in India</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowLocationModal(true)}
          >
            <TextInput
              style={styles.input}
              placeholder="Select Location"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              value={indianLocation}
              editable={false}
              pointerEvents="none"
            />
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color="#3E5C76"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Occupation Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Occupation</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ex. Software Engineer"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              onChangeText={setOccupation}
              value={occupation}
            />
            <MaterialIcons
              name="work"
              size={20}
              color="#3E5C76"
              style={styles.icon}
            />
          </View>
        </View>

        {/* Mobile IN Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile IN (WhatsApp No.)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ex. 9063392872"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              onChangeText={(text) =>
                setMobileIN(text.replace(/[^0-9]/g, ""))
              }
              value={mobileIN}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <MaterialIcons
              name="phone"
              size={20}
              color="#3E5C76"
              style={styles.icon}
            />
          </View>
        </View>

        {/* Mobile Country No Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Country No (WhatsApp No.)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ex. 9063392872"
              placeholderTextColor="rgba(25, 25, 25, 0.5)"
              onChangeText={(text) =>
                setMobileCountryNo(text.replace(/[^0-9]/g, ""))
              }
              value={mobileCountryNo}
              keyboardType="phone-pad"
              maxLength={15}
            />
            <MaterialIcons
              name="phone"
              size={20}
              color="#3E5C76"
              style={styles.icon}
            />
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleAddMember}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate("RegisterAS")}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#3E5C76"
            style={styles.loadingIndicator}
          />
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {Platform.OS === 'web' ? renderWebLayout() : renderMobileLayout()}

        {/* Country Modal */}
        <Modal
          visible={showCountryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search country..."
                  placeholderTextColor="rgba(25, 25, 25, 0.5)"
                  onChangeText={setCountrySearch}
                  value={countrySearch}
                  autoFocus={true}
                />
                <MaterialIcons
                  name="search"
                  size={24}
                  color="#3E5C76"
                  style={styles.searchIcon}
                />
              </View>
              <FlatList
                data={filteredCountries}
                renderItem={renderCountryItem}
                keyExtractor={(item) => item.value}
                style={styles.modalList}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowCountryModal(false);
                  setCountrySearch("");
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Location Modal */}
        <Modal
          visible={showLocationModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search location..."
                  placeholderTextColor="rgba(25, 25, 25, 0.5)"
                  onChangeText={setLocationSearch}
                  value={locationSearch}
                  autoFocus={true}
                />
                <MaterialIcons
                  name="search"
                  size={24}
                  color="#3E5C76"
                  style={styles.searchIcon}
                />
              </View>
              <FlatList
                data={filteredConstituencies}
                renderItem={renderLocationItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.modalList}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowLocationModal(false);
                  setLocationSearch("");
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8E3E7",
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    display: "flex",
    justifyContent: "center",
    width: Platform.OS === "web" ? (width > 1024 ? "80%" : "90%") : "90%",
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
  inputContainer: {
    width: "100%",
    position: "relative",
    zIndex: 1,
    marginBottom: 15,
  },
  webInputContainer: {
    width: Platform.OS === 'web' ? '30%' : '100%',
    position: "relative",
    zIndex: 1,
    marginBottom: 15,
    marginHorizontal: Platform.OS === 'web' ? 10 : 0,
  },
  webRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
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
    width: Platform.OS === "android" ? 105 : 100,
    height: Platform.OS === "android" ? 105 : 100,
    resizeMode: "contain",
    marginRight: 7,
    marginBottom: 20,
    left: Platform.OS === "android" ? -102 : -700
  },
  icon: {
    position: "absolute",
    left: Platform.OS === "web" ? '85%' : 245,
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
  screenTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#2B2D42",
    top: 50,
    left: 50,
    textAlign: "center",
    fontFamily: "Roboto-Bold",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
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

export default AddNRIMember;