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
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

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
  const [countrySearch, setCountrySearch] = useState("");
  const [senduserType, setsenduserType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);

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
      const [token, userType] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("userType"),
      ]);

      if (!token) return;
      const senduserType = userType;

      let endpoint = "";
      switch (userType) {
        case "WealthAssociate":
        case "ReferralAssociate":
          endpoint = `${API_URL}/agent/AgentDetails`;
          setsenduserType("WealthAssociate");
          break;
        case "Customer":
          endpoint = `${API_URL}/customer/getcustomer`;
          setsenduserType("customer");
          break;
        case "CoreMember":
          endpoint = `${API_URL}/core/getcore`;
          setsenduserType("core");
          break;
        case "Investor":
          endpoint = `${API_URL}/investors/getinvestor`;
          setsenduserType("investor");
          break;
        case "NRI":
          endpoint = `${API_URL}/nri/getnri`;
          setsenduserType("nri");
          break;
        case "SkilledResource":
          endpoint = `${API_URL}/skillLabour/getskilled`;
          setsenduserType("skilled");
          break;
        case "CallCenter":
          endpoint = `${API_URL}/callcenter/getcallcenter`;
          break;
        default:
          endpoint = `${API_URL}/agent/AgentDetails`;
          setsenduserType("WealthAssociate");
      }

      const response = await fetch(endpoint, {
        headers: { token },
      });

      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
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

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModalHandler = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleItemSelect = (item) => {
    if (modalType === "country") {
      setCountry(item.label);
      setCountrySearch(item.label);
    } else {
      setIndianLocation(item.name);
      setLocationSearch(item.name);
    }
    closeModalHandler();
  };

  const getFilteredData = () => {
    if (modalType === "country") {
      return countries.filter((item) =>
        item.label.toLowerCase().includes(countrySearch.toLowerCase())
      );
    } else {
      return constituencies.flatMap((item) =>
        item.assemblies.filter((assembly) =>
          assembly.name.toLowerCase().includes(locationSearch.toLowerCase())
        )
      );
    }
  };

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
      const addedByValue =
        Details.MobileNumber ||
        Details.MobileIN ||
        Details.Number ||
        "Wealthassociate";

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
          AddedBy: addedByValue,
          RegisteredBy: "Wealth",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message);
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server");
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={{ flex: 1, backgroundColor: "#D3E7E8" }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text style={styles.header}>Add NRI Member</Text>
          <View style={styles.container}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Country</Text>
            <TouchableOpacity onPress={() => openModal("country")}>
              <TextInput
                style={styles.input}
                placeholder="Search country..."
                value={countrySearch}
                onChangeText={setCountrySearch}
                editable={false}
                onPressIn={() => openModal("country")}
              />
            </TouchableOpacity>

            <Text style={styles.label}>Locality (Abroad)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. Dallas"
              value={locality}
              onChangeText={setLocality}
            />

            <Text style={styles.label}>Location in India</Text>
            <TouchableOpacity onPress={() => openModal("location")}>
              <TextInput
                style={styles.input}
                placeholder="Ex. Vijayawada"
                value={locationSearch}
                onChangeText={setLocationSearch}
                editable={false}
                onPressIn={() => openModal("location")}
              />
            </TouchableOpacity>

            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. Software Engineer"
              value={occupation}
              onChangeText={setOccupation}
            />

            <Text style={styles.label}>Mobile IN (WhatsApp No.)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. 9063392872"
              keyboardType="phone-pad"
              value={mobileIN}
              onChangeText={setMobileIN}
            />

            <Text style={styles.label}>Mobile Country No (WhatsApp No.)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. 9063392872"
              keyboardType="phone-pad"
              value={mobileCountryNo}
              onChangeText={setMobileCountryNo}
            />

            <View style={styles.buttonContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#E91E63" />
              ) : (
                <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Modal for dropdown selection */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModalHandler}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder={`Search ${modalType === "country" ? "country" : "location"}...`}
                value={modalType === "country" ? countrySearch : locationSearch}
                onChangeText={(text) => {
                  if (modalType === "country") {
                    setCountrySearch(text);
                  } else {
                    setLocationSearch(text);
                  }
                }}
              />
              <ScrollView style={styles.modalScrollView}>
                {getFilteredData().map((item) => (
                  <TouchableOpacity
                    key={modalType === "country" ? item.value : `${item.code}-${item.name}`}
                    style={styles.modalItem}
                    onPress={() => handleItemSelect(item)}
                  >
                    <Text>{modalType === "country" ? item.label : item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeModalHandler}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FDFDFD",
    borderRadius: 25,
    borderColor: "black",
    width: Platform.OS === "android" || Platform.OS === "ios" ? "90%" : "30%",
    alignSelf: "center",
    elevation: 5,
    top: Platform.OS === "android" || Platform.OS === "ios" ? 30 : 20,
    padding: Platform.OS === "android" || Platform.OS === "ios" ? "10%" : "3%",
    marginBottom: Platform.OS === "android" || Platform.OS === "ios" ? "3%" : "5%",
    paddingLeft: Platform.OS === "android" || Platform.OS === "ios" ? "5%" : "2%",
    paddingRight: Platform.OS === "android" || Platform.OS === "ios" ? "10%" : "2%",
    paddingBottom: Platform.OS === "android" || Platform.OS === "ios" ? "100" : "0%"
  },
  header: {
    color: "#2B2D42",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
    marginTop: Platform.OS === "android" || Platform.OS === "ios" ? "5" : "0%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B2D42",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E6ED",
    borderRadius: 25,
    padding: 10,
    fontSize: 14,
    color: "#E0E6ED",
    width: "100%",
    height: 45,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: Platform.OS === "android" || Platform.OS === "ios" ? "10" : "0%",
    height: Platform.OS === "android" || Platform.OS === "ios" ? "60" : "100",
    width: Platform.OS === "android" || Platform.OS === "ios" ? "280" : "0%",   
  },
  addButton: {
    backgroundColor: "#3E5C76",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: Platform.OS === "android" || Platform.OS === "ios" ? "120" : "0%",
  },
  cancelButton: {
    backgroundColor: "#3E5C76",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: Platform.OS === "android" || Platform.OS === "ios" ? "120" : "0%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: Platform.OS === "android" || Platform.OS === "ios" ? "5" : "0%",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalSearchInput: {
    borderWidth: 1,
    borderColor: "#E0E6ED",
    borderRadius: 25,
    padding: 10,
    fontSize: 14,
    color: "#2B2D42",
    marginBottom: 10,
  },
  modalScrollView: {
    maxHeight: "70%",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalCloseButton: {
    backgroundColor: "#3E5C76",
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AddNRIMember;