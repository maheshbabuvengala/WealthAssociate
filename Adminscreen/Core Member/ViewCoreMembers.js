import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../../data/ApiUrl";

const { width } = Dimensions.get("window");

export default function ViewCoreMembers() {
  const [coreMembers, setCoreMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editedMember, setEditedMember] = useState({
    FullName: "",
    District: "",
    Contituency: "",
    MobileNumber: "",
    MyRefferalCode: "",
  });
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch core members and districts/constituencies
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch core members
        const membersResponse = await fetch(
          `${API_URL}/core/getallcoremembers`
        );
        if (!membersResponse.ok) {
          throw new Error("Failed to fetch core members");
        }
        const membersData = await membersResponse.json();
        setCoreMembers(membersData);
        setFilteredMembers(membersData);

        // Fetch districts and constituencies
        const disConsResponse = await fetch(`${API_URL}/alldiscons/alldiscons`);
        if (!disConsResponse.ok) {
          throw new Error("Failed to fetch districts and constituencies");
        }
        const disConsData = await disConsResponse.json();
        setDistricts(disConsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter core members based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(coreMembers);
    } else {
      const filtered = coreMembers.filter(
        (member) =>
          (member.FullName &&
            member.FullName.toLowerCase().includes(
              searchQuery.toLowerCase()
            )) ||
          (member.MobileNumber && member.MobileNumber.includes(searchQuery)) ||
          (member.MyRefferalCode &&
            member.MyRefferalCode.toLowerCase().includes(
              searchQuery.toLowerCase()
            ))
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, coreMembers]);

  // Handle edit member
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditedMember({
      FullName: member.FullName,
      District: member.District,
      Contituency: member.Contituency,
      MobileNumber: member.MobileNumber,
      MyRefferalCode: member.MyRefferalCode,
    });

    // Set constituencies if district exists
    if (member.District) {
      const selectedDistrict = districts.find(
        (item) => item.parliament === member.District
      );
      if (selectedDistrict) {
        setConstituencies(selectedDistrict.assemblies);
      }
    }
    setEditModalVisible(true);
  };

  // Handle save edited member
  const handleSaveEditedMember = async () => {
    try {
      const response = await fetch(
        `${API_URL}/core/updatecore/${selectedMember._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedMember),
        }
      );
      if (!response.ok) throw new Error("Failed to update core member");

      const updatedMember = await response.json();
      setCoreMembers((prevMembers) =>
        prevMembers.map((member) =>
          member._id === selectedMember._id ? updatedMember : member
        )
      );
      // Also update filtered members
      setFilteredMembers((prevMembers) =>
        prevMembers.map((member) =>
          member._id === selectedMember._id ? updatedMember : member
        )
      );
      setEditModalVisible(false);
      Alert.alert("Success", "Core member updated successfully.");
    } catch (error) {
      console.error("Error updating core member:", error);
      Alert.alert("Error", "Failed to update core member.");
    }
  };

  // Handle delete member
  const handleDeleteMember = (memberId) => {
    if (Platform.OS === "web") {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this core member?"
      );
      if (!confirmDelete) return;
      deleteMember(memberId);
    } else {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this core member?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMember(memberId),
          },
        ]
      );
    }
  };

  const deleteMember = async (memberId) => {
    try {
      const response = await fetch(`${API_URL}/core/deleteCore/${memberId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete core member");

      setCoreMembers((prevMembers) =>
        prevMembers.filter((member) => member._id !== memberId)
      );
      // Also update filtered members
      setFilteredMembers((prevMembers) =>
        prevMembers.filter((member) => member._id !== memberId)
      );
      Alert.alert("Success", "Core member deleted successfully.");
    } catch (error) {
      console.error("Error deleting core member:", error);
      Alert.alert("Error", "Failed to delete core member.");
    }
  };

  // Update constituencies when district changes
  const handleDistrictChange = (itemValue) => {
    setEditedMember({
      ...editedMember,
      District: itemValue,
      Contituency: "", // Reset constituency when district changes
    });

    // Update constituencies when district changes
    const selectedDistrict = districts.find(
      (item) => item.parliament === itemValue
    );
    if (selectedDistrict) {
      setConstituencies(selectedDistrict.assemblies);
    } else {
      setConstituencies([]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Core Members</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, mobile or referral code"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {filteredMembers.length > 0 ? (
          <View style={styles.cardContainer}>
            {filteredMembers.map((member) => (
              <View key={member._id} style={styles.card}>
                <Image
                  source={require("../../Admin_Pan/assets/man.png")}
                  style={styles.avatar}
                />
                <View style={styles.infoContainer}>
                  {member.FullName && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Name</Text>
                      <Text style={styles.value}>: {member.FullName}</Text>
                    </View>
                  )}
                  {member.District && (
                    <View style={styles.row}>
                      <Text style={styles.label}>District</Text>
                      <Text style={styles.value}>: {member.District}</Text>
                    </View>
                  )}
                  {member.Contituency && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Constituency</Text>
                      <Text style={styles.value}>: {member.Contituency}</Text>
                    </View>
                  )}
                  {member.MobileNumber && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Mobile</Text>
                      <Text style={styles.value}>: {member.MobileNumber}</Text>
                    </View>
                  )}
                  {member.MyRefferalCode && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Referral Code</Text>
                      <Text style={styles.value}>
                        : {member.MyRefferalCode}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditMember(member)}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMember(member._id)}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noMembersText}>
            {searchQuery
              ? "No matching core members found"
              : "No core members found."}
          </Text>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Core Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={editedMember.FullName}
              onChangeText={(text) =>
                setEditedMember({ ...editedMember, FullName: text })
              }
            />

            {/* District Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>District</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editedMember.District}
                  onValueChange={handleDistrictChange}
                  style={styles.picker}
                  dropdownIconColor="#000"
                >
                  <Picker.Item label="Select District" value="" />
                  {districts.map((district) => (
                    <Picker.Item
                      key={district.parliament}
                      label={district.parliament}
                      value={district.parliament}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Constituency Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Constituency</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editedMember.Contituency}
                  onValueChange={(itemValue) => {
                    setEditedMember({
                      ...editedMember,
                      Contituency: itemValue,
                    });
                  }}
                  style={styles.picker}
                  dropdownIconColor="#000"
                  enabled={!!editedMember.District}
                >
                  <Picker.Item label="Select Constituency" value="" />
                  {constituencies.map((constituency) => (
                    <Picker.Item
                      key={constituency.name}
                      label={constituency.name}
                      value={constituency.name}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={editedMember.MobileNumber}
              onChangeText={(text) =>
                setEditedMember({ ...editedMember, MobileNumber: text })
              }
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Referral Code"
              value={editedMember.MyRefferalCode}
              onChangeText={(text) =>
                setEditedMember({ ...editedMember, MyRefferalCode: text })
              }
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEditedMember}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 20,
    marginBottom: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 15,
    paddingLeft: 10,
  },
  searchContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width > 600 ? "30%" : "100%",
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#ddd",
  },
  infoContainer: {
    width: "100%",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    width: 120,
  },
  value: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "blue",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  editText: {
    color: "white",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
  noMembersText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width > 600 ? "50%" : "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    backgroundColor: "#fff",
    height: 30,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
