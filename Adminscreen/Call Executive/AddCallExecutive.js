import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Picker,
} from "react-native";

const { width } = Dimensions.get("window");
import { API_URL } from "../../data/ApiUrl";
const isMobile = width < 600;

const AddCallExecutive = ({ closeModal, fetchCallExecutives }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [assignedType, setAssignedType] = useState("Agents");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddExecutive = async () => {
    if (!name || !phone || !location || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_URL}/callexe/addcall-executives`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          location,
          password,
          assignedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          setErrorMessage("Mobile number already exists");
        } else {
          throw new Error(data.message || "Failed to add call executive");
        }
        return;
      }

      Alert.alert("Success", "Call executive added successfully");
      setName("");
      setPhone("");
      setLocation("");
      setPassword("");
      setAssignedType("Agents");
      closeModal();
    } catch (error) {
      console.error("Error adding call executive:", error);
      Alert.alert("Error", error.message || "Failed to add call executive");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapper}
    >
      <View style={[styles.container, { width: "90%", maxWidth: 400 }]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Add Call Executive</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Assigned Type</Text>
          <Picker
            selectedValue={assignedType}
            style={styles.input}
            onValueChange={(itemValue) => setAssignedType(itemValue)}
          >
            <Picker.Item
              label="Agent_Wealth_Associate"
              value="Agent_Wealth_Associate"
            />
            <Picker.Item label="Customers" value="Customers" />
            <Picker.Item label="Property" value="Property" />
            <Picker.Item label="ExpertPanel" value="ExpertPanel" />
            <Picker.Item label="ALL" value="ALL" />
          </Picker>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setErrorMessage("");
            }}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Location"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            minLength={6}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.disabledButton]}
            onPress={handleAddExecutive}
            disabled={isLoading}
          >
            <Text style={styles.addText}>
              {isLoading ? "Adding..." : "Add"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, isLoading && styles.disabledButton]}
            onPress={closeModal}
            disabled={isLoading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  header: {
    width: "100%",
    backgroundColor: "#C73D5D",
    paddingVertical: 15,
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  formGroup: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    marginLeft: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 25,
    padding: 12,
    backgroundColor: "#FFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#C73D5D",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  addText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    width: "100%",
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default AddCallExecutive;
