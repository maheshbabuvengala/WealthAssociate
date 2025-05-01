import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const expertTypes = [
  { label: "-- Select Type --", value: "" },
  { label: "LEGAL", value: "LEGAL" },
  { label: "REVENUE", value: "REVENUE" },
  { label: "ENGINEERS", value: "ENGINEERS" },
  { label: "ARCHITECTS", value: "ARCHITECTS" },
  { label: "SURVEY", value: "SURVEY" },
  { label: "VAASTU PANDITS", value: "VAASTU PANDITS" },
  { label: "LAND VALUERS", value: "LAND VALUERS" },
  { label: "BANKING", value: "BANKING" },
  { label: "AGRICULTURE", value: "AGRICULTURE" },
  {
    label: "REGISTRATION & DOCUMENTATION",
    value: "REGISTRATION & DOCUMENTATION",
  },
  { label: "AUDITING", value: "AUDITING" },
  { label: "LIAISONING", value: "LIAISONING" },
];

const RequestedExpert = ({ closeModal }) => {
  const [selectedExpert, setSelectedExpert] = useState("");
  const [reason, setReason] = useState("");
  const [Details, setDetails] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  const getDetails = async () => {
    setIsLoading(true);
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
      Alert.alert("Error", "Failed to load agent details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  const validateForm = () => {
    if (!selectedExpert) {
      Alert.alert("Error", "Please select an expert type.");
      return false;
    }
    if (!reason.trim() || reason.length < 10) {
      Alert.alert(
        "Error",
        "Please provide a detailed reason (at least 10 characters)."
      );
      return false;
    }
    return true;
  };

  const handleRequest = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const requestData = {
      expertType: selectedExpert,
      reason: reason.trim(),
      WantedBy: Details?.MobileNumber || "Unknown",
      UserType: "Agent",
    };

    try {
      const response = await fetch(`${API_URL}/direqexp/direqexp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Request submitted successfully!");
        closeModal();
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to submit request. Please try again."
        );
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Unable to connect to the server. Please check your internet connection."
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const measureDropdownPosition = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setDropdownPosition({ x, y: y + height, width });
  };

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedExpert(item.value);
        setShowDropdown(false);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.label}`}
    >
      <Text style={styles.dropdownItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderDropdown = () => {
    if (Platform.OS === "android") {
      return (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedExpert}
            onValueChange={(itemValue) => setSelectedExpert(itemValue)}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor="#007AFF"
            accessibilityLabel="Select expert type"
          >
            {expertTypes.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      );
    }

    const selectedLabel =
      expertTypes.find((item) => item.value === selectedExpert)?.label ||
      "-- Select Type --";

    return (
      <>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setShowDropdown(!showDropdown)}
          onLayout={measureDropdownPosition}
          accessibilityLabel="Select expert type"
          accessibilityRole="button"
        >
          <Text style={styles.dropdownText}>{selectedLabel}</Text>
          <Icon
            name={showDropdown ? "arrow-drop-up" : "arrow-drop-down"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>

        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
          accessibilityViewIsModal={true}
        >
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View style={styles.dropdownOverlay} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.dropdownContainer,
              {
                top: dropdownPosition.y,
                left: dropdownPosition.x,
                width: dropdownPosition.width,
              },
            ]}
            accessibilityRole="list"
          >
            <FlatList
              data={expertTypes}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.value}
              style={styles.dropdownList}
              nestedScrollEnabled={true}
            />
          </View>
        </Modal>
      </>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.modalContent, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <View style={styles.modalContent} accessibilityViewIsModal={true}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Request Expert Assistance</Text>
      </View>

      {/* Dropdown */}
      <Text style={styles.label}>Select Expert Type</Text>
      {renderDropdown()}

      {/* Reason Textbox */}
      <Text style={styles.label}>Reason (Minimum 10 characters)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Please describe why you need this expert..."
        placeholderTextColor="#999"
        multiline
        minLength={10}
        value={reason}
        onChangeText={setReason}
        accessibilityLabel="Reason for expert request"
        accessibilityHint="Enter at least 10 characters"
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.requestButton, isSubmitting && styles.disabledButton]}
          onPress={handleRequest}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Submit expert request"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Request</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Cancel expert request"
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    width: Platform.OS === "android" || Platform.OS === "ios" ? "100%" : "40%",
    // marginLeft: 20,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    top: "15%",
  },
  loadingContainer: {
    justifyContent: "center",
    height: 200,
  },
  header: {
    backgroundColor: "#E91E63",
    width: "100%",
    paddingVertical: 12,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: "center",
    position: "absolute",
    top: 0,
  },
  headerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginTop: 60,
    color: "#000",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
    marginTop: 5,
    height: 50,
    backgroundColor: "#f8f8f8",
  },
  picker: {
    height: 50,
    color: "#000",
    backgroundColor: "transparent",
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    width: "100%",
    height: 50,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    marginTop: 5,
  },
  dropdownText: {
    color: "#000",
    fontSize: 16,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dropdownContainer: {
    position: "absolute",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    maxHeight: 200,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginLeft: 600,
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    width: "100%",
    height: 120,
    textAlignVertical: "top",
    padding: 10,
    marginTop: 5,
    fontSize: 14,
    backgroundColor: "#f8f8f8",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  requestButton: {
    backgroundColor: "#E91E63",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#8e8e93",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RequestedExpert;
