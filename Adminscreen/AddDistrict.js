import React, { useState, useEffect } from "react";
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
  ScrollView,
} from "react-native";
import { API_URL } from "../data/ApiUrl";

const { width } = Dimensions.get("window");

const AddDistrictModal = ({ closeModal }) => {
  const [districts, setDistricts] = useState([]);
  const [addingNew, setAddingNew] = useState(false);
  const [parliamentName, setParliamentName] = useState("");
  const [parliamentCode, setParliamentCode] = useState("");
  const [assemblies, setAssemblies] = useState(
    Array(7).fill({ name: "", code: "" })
  );

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load districts");
    }
  };

  const handleAssemblyChange = (index, field, value) => {
    const updated = [...assemblies];
    updated[index] = { ...updated[index], [field]: value };
    setAssemblies(updated);
  };

  const handleAddDistrict = async () => {
    if (
      !parliamentName ||
      !parliamentCode ||
      assemblies.some((a) => !a.name || !a.code)
    ) {
      Alert.alert("Error", "Please fill all fields including 7 assemblies");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/alldiscons/addDistrict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parliament: parliamentName,
          parliamentCode,
          assemblies,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert("Success", "District added successfully");
        setParliamentName("");
        setParliamentCode("");
        setAssemblies(Array(7).fill({ name: "", code: "" }));
        setAddingNew(false);
        fetchDistricts(); // Refresh list
      } else {
        Alert.alert("Error", data.message || "Failed to add district");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Districts</Text>
          </View>

          {/* List Existing Parliaments */}
          {districts.map((district) => (
            <View key={district._id} style={styles.districtCard}>
              <Text style={styles.districtTitle}>
                {district.parliament} ({district.parliamentCode})
              </Text>
              {district.assemblies?.map((assembly) => (
                <Text key={assembly._id} style={styles.assemblyText}>
                  {assembly.name} - {assembly.code}
                </Text>
              ))}
            </View>
          ))}

          {/* Add New Button */}
          {!addingNew && (
            <TouchableOpacity
              style={styles.addNewBtn}
              onPress={() => setAddingNew(true)}
            >
              <Text style={styles.addText}>+ Add New District</Text>
            </TouchableOpacity>
          )}

          {/* Add New Form */}
          {addingNew && (
            <>
              <Text style={styles.label}>Parliament</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. Srikakulam"
                value={parliamentName}
                onChangeText={setParliamentName}
              />

              <Text style={styles.label}>Parliament Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. 01"
                value={parliamentCode}
                onChangeText={setParliamentCode}
              />

              {assemblies.map((assembly, index) => (
                <View key={index} style={styles.assemblyGroup}>
                  <Text style={styles.label}>Assembly {index + 1}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={assembly.name}
                    onChangeText={(val) =>
                      handleAssemblyChange(index, "name", val)
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Code"
                    value={assembly.code}
                    onChangeText={(val) =>
                      handleAssemblyChange(index, "code", val)
                    }
                  />
                </View>
              ))}

              {/* Submit & Cancel */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddDistrict}
                >
                  <Text style={styles.addText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setAddingNew(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Close Modal */}
          <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
            <Text style={styles.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "white" : "rgba(0,0,0,0.4)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: Platform.OS === "web" ? "1000px" : "90%",
    maxWidth: 500,
    elevation: 5,
  },
  header: {
    backgroundColor: "#C73D5D",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  districtCard: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
  },
  districtTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  assemblyText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    padding: 10,
    marginBottom: 10,
  },
  assemblyGroup: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  addButton: {
    backgroundColor: "#C73D5D",
    padding: 12,
    borderRadius: 25,
  },
  cancelButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 25,
  },
  addText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
  addNewBtn: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
  },
  closeBtn: {
    backgroundColor: "#888",
    marginTop: 15,
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
  },
});

export default AddDistrictModal;
