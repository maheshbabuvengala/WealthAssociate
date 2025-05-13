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
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../../data/ApiUrl";
import logo1 from "../../../assets/man.png";

const { width } = Dimensions.get("window");

export default function ViewAgents() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editedAgent, setEditedAgent] = useState({
    FullName: "",
    District: "",
    Contituency: "",
    MobileNumber: "",
    MyRefferalCode: "",
    AadhaarNumber: "",
    PANNumber: "",
    BankAccountNumber: "",
  });
  const [photo, setPhoto] = useState(null);
  const [file, setFile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [referrerDetails, setReferrerDetails] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw error;
    }
  };

  const fetchReferrerDetails = async (referredBy) => {
    if (!referredBy || referrerDetails[referredBy]) return;

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_URL}/properties/getPropertyreffered`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({
            referredBy: referredBy,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          const details = data.referredByDetails || data.addedByDetails;
          if (details) {
            setReferrerDetails((prev) => ({
              ...prev,
              [referredBy]: {
                name:
                  details.name ||
                  details.Name ||
                  details.FullName ||
                  "Referrer",
                mobileNumber: details.Number || details.MobileNumber || "N/A",
              },
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching referrer details:", error);
    }
  };

  const fetchAssignedAgents = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const token = await getAuthToken();

      const [agentsRes, districtsRes] = await Promise.all([
        fetch(`${API_URL}/callexe/myagents`, {
          headers: {
            token: token || "",
          },
        }),
        fetch(`${API_URL}/alldiscons/alldiscons`, {
          headers: {
            token: token || "",
          },
        }),
      ]);

      if (!agentsRes.ok) throw new Error("Failed to fetch assigned agents");
      if (!districtsRes.ok) throw new Error("Failed to fetch districts");

      const agentsData = await agentsRes.json();
      const districtsData = await districtsRes.json();

      const sortedAgents = agentsData.data.sort((a, b) => {
        if (a.CallExecutiveCall === "Done" && b.CallExecutiveCall !== "Done")
          return 1;
        if (a.CallExecutiveCall !== "Done" && b.CallExecutiveCall === "Done")
          return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setAgents(sortedAgents);
      setFilteredAgents(sortedAgents);
      setDistricts(districtsData || []);

      // Fetch referrer details for each agent
      sortedAgents.forEach((agent) => {
        if (agent?.ReferredBy) {
          fetchReferrerDetails(agent.ReferredBy);
        }
      });
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", error.message || "Failed to load assigned agents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedAgents();
    const interval = setInterval(fetchAssignedAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter(
        (agent) =>
          (agent.FullName &&
            agent.FullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (agent.MobileNumber && agent.MobileNumber.includes(searchQuery)) ||
          (agent.MyRefferalCode &&
            agent.MyRefferalCode.toLowerCase().includes(
              searchQuery.toLowerCase()
            ))
      );
      setFilteredAgents(filtered);
    }
  }, [searchQuery, agents]);

  const handleRefresh = async () => {
    await fetchAssignedAgents();
  };

  const handleMarkAsDone = async (agentId) => {
    const confirm = () => {
      if (Platform.OS === "web") {
        return window.confirm(
          "Are you sure you want to mark this agent as done?"
        );
      } else {
        return new Promise((resolve) => {
          Alert.alert("Confirm", "Mark this agent as done?", [
            { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
            { text: "Confirm", onPress: () => resolve(true) },
          ]);
        });
      }
    };

    if (!(await confirm())) return;

    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/agent/markasdone/${agentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to update status");

      const result = await response.json();

      setAgents((prevAgents) => {
        const updated = prevAgents.map((agent) =>
          agent._id === agentId
            ? { ...agent, CallExecutiveCall: "Done" }
            : agent
        );
        return updated.sort((a, b) => {
          if (a.CallExecutiveCall === "Done" && b.CallExecutiveCall !== "Done")
            return 1;
          if (a.CallExecutiveCall !== "Done" && b.CallExecutiveCall === "Done")
            return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });

      setFilteredAgents((prevAgents) => {
        const updated = prevAgents.map((agent) =>
          agent._id === agentId
            ? { ...agent, CallExecutiveCall: "Done" }
            : agent
        );
        return updated.sort((a, b) => {
          if (a.CallExecutiveCall === "Done" && b.CallExecutiveCall !== "Done")
            return 1;
          if (a.CallExecutiveCall !== "Done" && b.CallExecutiveCall === "Done")
            return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });

      Alert.alert("Success", "Agent marked as done");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update agent status");
    }
  };

  const selectImageFromGallery = async () => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPhoto(imageUrl);
            setFile(file);
          }
        };
        input.click();
      } else {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.status !== "granted") {
          Alert.alert("Permission is required to upload a photo.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Error selecting image from gallery:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Camera permission is required to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setEditedAgent({
      FullName: agent.FullName,
      District: agent.District,
      Contituency: agent.Contituency,
      MobileNumber: agent.MobileNumber,
      MyRefferalCode: agent.MyRefferalCode,
      AadhaarNumber: agent.AadhaarNumber || "",
      PANNumber: agent.PANNumber || "",
      BankAccountNumber: agent.BankAccountNumber || "",
    });
    setPhoto(agent.photo ? `${API_URL}${agent.photo}` : null);

    if (agent.District) {
      const district = districts.find((d) => d.parliament === agent.District);
      setConstituencies(district?.assemblies || []);
    }
    setEditModalVisible(true);
  };

  const handleDistrictChange = (district) => {
    setEditedAgent({
      ...editedAgent,
      District: district,
      Contituency: "",
    });
    const districtData = districts.find((d) => d.parliament === district);
    setConstituencies(districtData?.assemblies || []);
  };

  const handleSaveEditedAgent = async () => {
    if (!editedAgent.FullName || !editedAgent.MobileNumber) {
      Alert.alert("Error", "Full Name and Mobile Number are required");
      return;
    }

    setIsSaving(true);
    try {
      const token = await getAuthToken();
      const formData = new FormData();

      formData.append("FullName", editedAgent.FullName);
      formData.append("District", editedAgent.District);
      formData.append("Contituency", editedAgent.Contituency);
      formData.append("MobileNumber", editedAgent.MobileNumber);
      formData.append("MyRefferalCode", editedAgent.MyRefferalCode);
      formData.append("AadhaarNumber", editedAgent.AadhaarNumber);
      formData.append("PANNumber", editedAgent.PANNumber);
      formData.append("BankAccountNumber", editedAgent.BankAccountNumber);

      if (photo) {
        if (Platform.OS === "web") {
          if (file) {
            formData.append("photo", file);
          } else if (typeof photo === "string" && photo.startsWith("blob:")) {
            const response = await fetch(photo);
            const blob = await response.blob();
            const file = new File([blob], "photo.jpg", { type: blob.type });
            formData.append("photo", file);
          }
        } else {
          const localUri = photo;
          const filename = localUri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image";

          formData.append("photo", {
            uri: localUri,
            name: filename,
            type,
          });
        }
      }

      const response = await fetch(
        `${API_URL}/agent/updateagent/${selectedAgent._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update agent");

      const updatedAgent = await response.json();

      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent._id === selectedAgent._id ? updatedAgent.data : agent
        )
      );
      setFilteredAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent._id === selectedAgent._id ? updatedAgent.data : agent
        )
      );

      setEditModalVisible(false);
      Alert.alert("Success", "Agent updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update agent");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAgent = (agentId) => {
    const confirmDelete = () => {
      if (Platform.OS === "web") {
        return window.confirm("Are you sure you want to delete this agent?");
      } else {
        return new Promise((resolve) => {
          Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this agent?",
            [
              {
                text: "Cancel",
                onPress: () => resolve(false),
                style: "cancel",
              },
              { text: "Delete", onPress: () => resolve(true) },
            ]
          );
        });
      }
    };

    confirmDelete().then(async (confirmed) => {
      if (!confirmed) return;

      try {
        const token = await getAuthToken();

        const response = await fetch(
          `${API_URL}/agent/deleteagent/${agentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to delete agent");

        setAgents((prevAgents) =>
          prevAgents.filter((agent) => agent._id !== agentId)
        );
        setFilteredAgents((prevAgents) =>
          prevAgents.filter((agent) => agent._id !== agentId)
        );
        Alert.alert("Success", "Agent deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        Alert.alert("Error", error.message || "Failed to delete agent");
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          Platform.OS !== "web" ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0000ff"]}
            />
          ) : undefined
        }
      >
        <Text style={styles.heading}>My Assigned Agents</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, mobile or referral code"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading agents...</Text>
          </View>
        ) : filteredAgents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.noAgentsText}>
              {searchQuery
                ? "No matching agents found"
                : "No agents assigned to you"}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            {filteredAgents.map((agent) => (
              <View
                key={agent._id}
                style={[
                  styles.card,
                  agent.CallExecutiveCall === "Done"
                    ? styles.doneCard
                    : styles.pendingCard,
                ]}
              >
                <Image
                  source={
                    agent.photo ? { uri: `${API_URL}${agent.photo}` } : logo1
                  }
                  style={styles.avatar}
                />
                <View style={styles.infoContainer}>
                  {agent.FullName && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Name</Text>
                      <Text style={styles.value}>: {agent.FullName}</Text>
                    </View>
                  )}
                  {agent.District && (
                    <View style={styles.row}>
                      <Text style={styles.label}>District</Text>
                      <Text style={styles.value}>: {agent.District}</Text>
                    </View>
                  )}
                  {agent.Contituency && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Constituency</Text>
                      <Text style={styles.value}>: {agent.Contituency}</Text>
                    </View>
                  )}
                  {agent.MobileNumber && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Mobile</Text>
                      <Text style={styles.value}>: {agent.MobileNumber}</Text>
                    </View>
                  )}
                  {agent.MyRefferalCode && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Referral Code</Text>
                      <Text style={styles.value}>: {agent.MyRefferalCode}</Text>
                    </View>
                  )}
                  {agent.ReferredBy && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Referred By</Text>
                      <Text style={styles.value}>
                        :{" "}
                        {referrerDetails[agent.ReferredBy]?.name ||
                          "Loading..."}
                        {referrerDetails[agent.ReferredBy]?.mobileNumber && (
                          <Text>
                            {" "}
                            ({referrerDetails[agent.ReferredBy].mobileNumber})
                          </Text>
                        )}
                      </Text>
                    </View>
                  )}
                  {agent.AadhaarNumber && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Aadhaar</Text>
                      <Text style={styles.value}>: {agent.AadhaarNumber}</Text>
                    </View>
                  )}
                  {agent.PANNumber && (
                    <View style={styles.row}>
                      <Text style={styles.label}>PAN</Text>
                      <Text style={styles.value}>: {agent.PANNumber}</Text>
                    </View>
                  )}
                  {agent.BankAccountNumber && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Bank Account</Text>
                      <Text style={styles.value}>
                        : {agent.BankAccountNumber}
                      </Text>
                    </View>
                  )}
                  <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <Text
                      style={[
                        styles.value,
                        agent.CallExecutiveCall === "Done"
                          ? styles.doneStatus
                          : styles.pendingStatus,
                      ]}
                    >
                      :{" "}
                      {agent.CallExecutiveCall === "Done" ? "Done" : "Pending"}
                    </Text>
                  </View>
                </View>
                <View style={styles.buttonContainer}>
                  {agent.CallExecutiveCall !== "Done" && (
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={() => handleMarkAsDone(agent._id)}
                    >
                      <Text style={styles.buttonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditAgent(agent)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAgent(agent._id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Agent</Text>

            <ScrollView>
              <View style={styles.uploadSection}>
                <Text style={styles.inputLabel}>Passport Size Photo</Text>
                {photo ? (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.uploadedImage}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setPhoto(null)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadOptions}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={selectImageFromGallery}
                    >
                      <MaterialIcons
                        name="photo-library"
                        size={24}
                        color="#555"
                      />
                      <Text style={styles.uploadButtonText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={takePhotoWithCamera}
                    >
                      <MaterialIcons name="camera-alt" size={24} color="#555" />
                      <Text style={styles.uploadButtonText}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={editedAgent.FullName}
                onChangeText={(text) =>
                  setEditedAgent({ ...editedAgent, FullName: text })
                }
              />

              <Text style={styles.inputLabel}>Aadhaar Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Aadhaar Number"
                value={editedAgent.AadhaarNumber}
                onChangeText={(text) =>
                  setEditedAgent({ ...editedAgent, AadhaarNumber: text })
                }
                keyboardType="numeric"
                maxLength={12}
              />

              <Text style={styles.inputLabel}>PAN Number</Text>
              <TextInput
                style={styles.input}
                placeholder="PAN Number"
                value={editedAgent.PANNumber}
                onChangeText={(text) =>
                  setEditedAgent({
                    ...editedAgent,
                    PANNumber: text.toUpperCase(),
                  })
                }
                maxLength={10}
              />

              <Text style={styles.inputLabel}>Bank Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Bank Account Number"
                value={editedAgent.BankAccountNumber}
                onChangeText={(text) =>
                  setEditedAgent({ ...editedAgent, BankAccountNumber: text })
                }
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={editedAgent.MobileNumber}
                onChangeText={(text) =>
                  setEditedAgent({ ...editedAgent, MobileNumber: text })
                }
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.inputLabel}>Referral Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Referral Code"
                value={editedAgent.MyRefferalCode}
                onChangeText={(text) =>
                  setEditedAgent({ ...editedAgent, MyRefferalCode: text })
                }
              />

              <Text style={styles.inputLabel}>District</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={editedAgent.District}
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

              <Text style={styles.inputLabel}>Constituency</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={editedAgent.Contituency}
                  onValueChange={(itemValue) => {
                    setEditedAgent({
                      ...editedAgent,
                      Contituency: itemValue,
                    });
                  }}
                  style={styles.picker}
                  dropdownIconColor="#000"
                  enabled={!!editedAgent.District}
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

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveEditedAgent}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.modalButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  scrollContainer: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 15,
    paddingLeft: 10,
    color: "#333",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noAgentsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  refreshButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
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
  doneCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  pendingCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#F44336",
    backgroundColor: "#FFEBEE",
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
    color: "#555",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  doneStatus: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  pendingStatus: {
    color: "#F44336",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width > 600 ? "50%" : "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    marginRight: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  uploadSection: {
    width: "100%",
    marginBottom: 15,
  },
  photoContainer: {
    alignItems: "center",
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  uploadButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    width: "45%",
  },
  uploadButtonText: {
    marginTop: 5,
    fontSize: 12,
    color: "#555",
  },
  removeButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
  },
});
