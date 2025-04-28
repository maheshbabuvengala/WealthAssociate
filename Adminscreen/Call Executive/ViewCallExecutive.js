import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../../data/ApiUrl";

const ViewCallExecutives = () => {
  const [executives, setExecutives] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentExecutive, setCurrentExecutive] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    phone: "",
    location: "",
    password: "",
    assignedType: "Property",
  });

  const fetchExecutives = () => {
    setRefreshing(true);
    fetch(`${API_URL}/callexe/call-executives`)
      .then((response) => response.json())
      .then((data) => setExecutives(data))
      .catch((error) => {
        console.error("Error fetching executives:", error);
        showAlert("Error", "Failed to fetch executives");
      })
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchExecutives();
  }, []);

  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleEditPress = (executive) => {
    setCurrentExecutive(executive);
    setEditedData({
      name: executive.name,
      phone: executive.phone,
      location: executive.location,
      password: "", // Don't show current password for security
      assignedType: executive.assignedType || "Property",
    });
    setEditModalVisible(true);
  };

  const handleDelete = (executive) => {
    const deleteConfirmation = () => {
      const confirmMessage = `Are you sure you want to delete ${executive.name}?`;
      if (Platform.OS === "web") {
        const confirmDelete = window.confirm(confirmMessage);
        if (confirmDelete) {
          deleteExecutive(executive._id);
        }
      } else {
        Alert.alert(
          "Delete Executive",
          confirmMessage,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              onPress: () => deleteExecutive(executive._id),
              style: "destructive",
            },
          ],
          { cancelable: true }
        );
      }
    };

    deleteConfirmation();
  };

  const deleteExecutive = (id) => {
    fetch(`${API_URL}/callexe/call-executives/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to delete executive");
        return response.json();
      })
      .then(() => {
        fetchExecutives();
        showAlert("Success", "Executive deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting executive:", error);
        showAlert("Error", error.message || "Failed to delete executive");
      });
  };

  const handleUpdate = () => {
    if (!editedData.name || !editedData.phone || !editedData.location) {
      showAlert("Error", "Please fill all required fields");
      return;
    }

    fetch(`${API_URL}/callexe/call-executives/${currentExecutive._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editedData.name,
        phone: editedData.phone,
        location: editedData.location,
        assignedType: editedData.assignedType,
        // Only send password if it was changed
        password: editedData.password || undefined,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update executive");
        return response.json();
      })
      .then(() => {
        fetchExecutives();
        setEditModalVisible(false);
        showAlert("Success", "Executive updated successfully");
      })
      .catch((error) => {
        console.error("Error updating executive:", error);
        showAlert("Error", error.message || "Failed to update executive");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registered Call Executives</Text>
      <FlatList
        data={executives}
        refreshing={refreshing}
        onRefresh={fetchExecutives}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>Phone: {item.phone}</Text>
              <Text style={styles.detail}>Location: {item.location}</Text>
              <Text style={styles.detail}>
                Type: {item.assignedType || "Property"}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => handleEditPress(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Executive</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={editedData.name}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, name: text })
                }
                placeholder="e.g. Aravind"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editedData.phone}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, phone: text })
                }
                keyboardType="phone-pad"
                placeholder="e.g. 7981663360"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={editedData.location}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, location: text })
                }
                placeholder="e.g. Gudivada"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assigned Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editedData.assignedType}
                  onValueChange={(itemValue) =>
                    setEditedData({ ...editedData, assignedType: itemValue })
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Customers" value="Customers" />
                  <Picker.Item label="Property" value="Property" />
                  <Picker.Item label="ExpertPanel" value="ExpertPanel" />
                  <Picker.Item label="ALL" value="ALL" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                New Password (leave blank to keep current)
              </Text>
              <TextInput
                style={styles.input}
                value={editedData.password}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, password: text })
                }
                secureTextEntry
                placeholder="e.g. 1234"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  button: {
    padding: 10,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#34495e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
  },
  picker: {
    width: "100%",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  saveButton: {
    backgroundColor: "#27ae60",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ViewCallExecutives;
