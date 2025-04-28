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
} from "react-native";
import { API_URL } from "../../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [showLocationList, setShowLocationList] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);

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

  // Filter countries based on search input
  const filteredCountries = countries.filter((item) =>
    item.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/nri/getnri`, {
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

  // Filter constituencies based on search input
  const filteredConstituencies = constituencies.flatMap((item) =>
    item.assemblies.filter((assembly) =>
      assembly.name.toLowerCase().includes(locationSearch.toLowerCase())
    )
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
          AddedBy: Details.MobileIN ? Details.MobileIN : "Wealthassociate",
          RegisteredBy: "NRI",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message);
        closeModal();
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>Add NRI Member</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Country</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search country..."
              value={countrySearch}
              onChangeText={(text) => {
                setCountrySearch(text);
                setShowCountryList(true);
              }}
              onFocus={() => setShowCountryList(true)}
            />
            {showCountryList && (
              <View style={styles.locationListContainer}>
                <ScrollView style={styles.locationList}>
                  {filteredCountries.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.locationListItem}
                      onPress={() => {
                        setCountry(item.label);
                        setCountrySearch(item.label);
                        setShowCountryList(false);
                      }}
                    >
                      <Text>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Text style={styles.label}>Locality (Abroad)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex. Dallas"
            value={locality}
            onChangeText={setLocality}
          />

          <Text style={styles.label}>Location in India</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex. Vijayawada"
              value={locationSearch}
              onChangeText={(text) => {
                setLocationSearch(text);
                setShowLocationList(true);
              }}
              onFocus={() => setShowLocationList(true)}
            />
            {showLocationList && (
              <View style={styles.locationListContainer}>
                <ScrollView style={styles.locationList}>
                  {filteredConstituencies.map((item) => (
                    <TouchableOpacity
                      key={`${item.code}-${item.name}`}
                      style={styles.locationListItem}
                      onPress={() => {
                        setIndianLocation(item.name);
                        setLocationSearch(item.name);
                        setShowLocationList(false);
                      }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

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
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddMember}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderColor: "black",
    width: 320,
    alignSelf: "center",
    elevation: 4,
    marginTop:"30%"
  },
  header: {
    backgroundColor: "#E91E63",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 10,
    position: "relative",
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 15,
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  locationListContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    maxHeight: 200,
    marginTop: 5,
    elevation: 3,
    backgroundColor: "#e6708e",
  },
  locationList: {
    maxHeight: 200,
  },
  locationListItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#E91E63",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  cancelButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AddNRIMember;
