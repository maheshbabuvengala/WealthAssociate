import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../data/ApiUrl";

// Import modal components
import HouseUpdateModal from "./Flats";
import ApartmentUpdateModal from "./AgricultureForm";
import LandUpdateModal from "./Plotform";

const { width, height } = Dimensions.get("window");

const ViewAllProperties = () => {
  // State management
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editedDetails, setEditedDetails] = useState({
    propertyType: "",
    location: "",
    price: "",
    photo: "",
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [idSearch, setIdSearch] = useState("");
  const [currentUpdateModal, setCurrentUpdateModal] = useState(null);
  // const [refreshInterval, setRefreshInterval] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [propertiesRes, typesRes, constituenciesRes] = await Promise.all([
        fetch(`${API_URL}/properties/getallPropertys`),
        fetch(`${API_URL}/discons/propertytype`),
        fetch(`${API_URL}/alldiscons/alldiscons`),
      ]);

      const propertiesData = await propertiesRes.json();
      const typesData = await typesRes.json();
      const constituenciesData = await constituenciesRes.json();

      setProperties(propertiesData);
      setPropertyTypes(typesData);
      setConstituencies(constituenciesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    let intervalId;

    // Only set interval if modals are NOT open
    if (!isEditModalVisible && !isUpdateModalVisible) {
      intervalId = setInterval(() => {
        fetchData();
      }, 20000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isEditModalVisible, isUpdateModalVisible]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getLastFourChars = (id) => id?.slice(-4) || "N/A";

  const filteredProperties = properties
    .filter((property) =>
      idSearch
        ? getLastFourChars(property._id)
            .toLowerCase()
            .includes(idSearch.toLowerCase())
        : true
    )
    .filter((property) =>
      selectedLocationFilter
        ? property.location
            .toLowerCase()
            .includes(selectedLocationFilter.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (selectedFilter === "highToLow") {
        return parseInt(b.price) - parseInt(a.price);
      } else if (selectedFilter === "lowToHigh") {
        return parseInt(a.price) - parseInt(b.price);
      }
      return 0;
    });

  // Get unique locations for filter dropdown
  const uniqueLocations = [
    ...new Set(properties.map((p) => p.location)),
  ].filter((l) => l);

  // Modal handlers
  const handleUpdate = (property) => {
    setSelectedProperty(property);

    const type = property.propertyType.toLowerCase();

    // Handle residential properties
    if (
      type.includes("flat") ||
      type.includes("apartment") ||
      type.includes("individualhouse") ||
      type.includes("villa") ||
      type.includes("house") ||
      type.includes("commercial")
    ) {
      setCurrentUpdateModal("house");
    }
    // Handle plot/land properties
    else if (type.includes("plot")) {
      setCurrentUpdateModal("land");
    }
    // Handle agricultural properties
    else if (type.includes("land") || type.includes("agricultural")) {
      setCurrentUpdateModal("agriculture");
    }

    setIsUpdateModalVisible(true);
  };

  const handleUpdateSave = async (updatedData) => {
    try {
      const response = await fetch(
        `${API_URL}/properties/update/${selectedProperty._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        // Clear and restart the refresh interval
        if (refreshInterval) clearInterval(refreshInterval);
        setRefreshInterval(setInterval(fetchData, 10000));

        setProperties(
          properties.map((p) =>
            p._id === selectedProperty._id ? { ...p, ...updatedData } : p
          )
        );
        setIsUpdateModalVisible(false);
        await fetchData();
        Alert.alert("Success", "Property updated successfully");
      } else {
        Alert.alert("Error", result.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update property");
    }
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setEditedDetails({
      propertyType: property.propertyType,
      location: property.location,
      price: property.price.toString(),
      photo: property.photo,
    });
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${API_URL}/properties/update/${selectedProperty._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedDetails),
        }
      );

      if (response.ok) {
        // Clear and restart the refresh interval
        if (refreshInterval) clearInterval(refreshInterval);
        setRefreshInterval(setInterval(fetchData, 10000));

        setProperties(
          properties.map((p) =>
            p._id === selectedProperty._id ? { ...p, ...editedDetails } : p
          )
        );
        setIsEditModalVisible(false);
        Alert.alert("Success", "Changes saved");
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await new Promise((resolve) => {
      if (Platform.OS === "web") {
        resolve(window.confirm("Delete this property?"));
      } else {
        Alert.alert("Confirm", "Delete this property?", [
          { text: "Cancel", onPress: () => resolve(false) },
          { text: "Delete", onPress: () => resolve(true) },
        ]);
      }
    });

    if (!confirm) return;

    try {
      const response = await fetch(`${API_URL}/properties/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Clear and restart the refresh interval
        if (refreshInterval) clearInterval(refreshInterval);
        setRefreshInterval(setInterval(fetchData, 10000));

        setProperties(properties.filter((p) => p._id !== id));
        Alert.alert("Success", "Property deleted");
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "Failed to delete");
    }
  };

  const handleApprove = async (id) => {
    const confirm = await new Promise((resolve) => {
      if (Platform.OS === "web") {
        resolve(
          window.confirm("Are you sure you want to approve this property?")
        );
      } else {
        Alert.alert("Confirm Approval", "Approve this property?", [
          { text: "Cancel", onPress: () => resolve(false) },
          { text: "Approve", onPress: () => resolve(true) },
        ]);
      }
    });

    if (!confirm) return;

    try {
      const response = await fetch(`${API_URL}/properties/approve/${id}`, {
        method: "POST",
      });

      if (response.ok) {
        // Clear and restart the refresh interval
        if (refreshInterval) clearInterval(refreshInterval);
        setRefreshInterval(setInterval(fetchData, 10000));

        // Update the local state to reflect approval
        setProperties(
          properties.map((property) =>
            property._id === id ? { ...property, approved: true } : property
          )
        );
        Alert.alert("Success", "Property approved successfully");
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Approval failed");
      }
    } catch (err) {
      console.error("Approve error:", err);
      Alert.alert("Error", "Failed to approve property");
    }
  };

  // Modal renderers
  const renderUpdateModal = () => {
    if (!selectedProperty || !currentUpdateModal) return null;

    const modalProps = {
      property: selectedProperty,
      closeModal: () => setIsUpdateModalVisible(false),
      onSave: handleUpdateSave,
      propertyId: selectedProperty._id,
    };

    return (
      <Modal
        visible={isUpdateModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsUpdateModalVisible(false)}
      >
        <View style={styles.centeredModalView}>
          <View style={styles.updateModalContent}>
            {currentUpdateModal === "house" && (
              <HouseUpdateModal {...modalProps} />
            )}
            {currentUpdateModal === "land" && (
              <LandUpdateModal {...modalProps} />
            )}
            {currentUpdateModal === "agriculture" && (
              <ApartmentUpdateModal {...modalProps} />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>All Properties</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Sort by Price:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedFilter}
                  onValueChange={setSelectedFilter}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Select --" value="" />
                  <Picker.Item label="High to Low" value="highToLow" />
                  <Picker.Item label="Low to High" value="lowToHigh" />
                </Picker>
              </View>
            </View>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by Location:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedLocationFilter}
                  onValueChange={setSelectedLocationFilter}
                  style={styles.picker}
                >
                  <Picker.Item label="-- All Locations --" value="" />
                  {uniqueLocations.map((location, index) => (
                    <Picker.Item
                      key={index}
                      label={location}
                      value={location}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by property ID (last 4 chars)"
            value={idSearch}
            onChangeText={setIdSearch}
            maxLength={4}
          />
        </View>

        <View style={styles.grid}>
          {filteredProperties.length > 0 ? (
            filteredProperties.map((item) => (
              <View key={item._id} style={styles.card}>
                <Image
                  source={
                    item.photo
                      ? { uri: `${API_URL}${item.photo}` }
                      : require("../assets/logo.png")
                  }
                  style={styles.image}
                />
                <View style={styles.details}>
                  <View style={styles.idContainer}>
                    <Text style={styles.idText}>
                      ID: {getLastFourChars(item._id)}
                    </Text>
                  </View>
                  <Text style={styles.title}>{item.propertyType}</Text>
                  <Text style={styles.info}>Posted by: {item.PostedBy}</Text>
                  <Text style={styles.info}>Location: {item.location}</Text>
                  <Text style={styles.budget}>
                    ₹ {parseInt(item.price).toLocaleString()}
                  </Text>
                  {item.approved && (
                    <Text style={styles.approvedText}>Approved</Text>
                  )}
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.updateButton]}
                    onPress={() => handleUpdate(item)}
                  >
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => handleDelete(item._id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                  {!item.approved && (
                    <TouchableOpacity
                      style={[styles.button, styles.approveButton]}
                      onPress={() => handleApprove(item._id)}
                    >
                      <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No properties found matching your criteria
              </Text>
            </View>
          )}
        </View>

        {/* Edit Property Modal */}
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Property</Text>

            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Property Type:</Text>
              <Picker
                selectedValue={editedDetails.propertyType}
                onValueChange={(value) =>
                  setEditedDetails({ ...editedDetails, propertyType: value })
                }
                style={styles.dropdown}
              >
                <Picker.Item label="Select Type" value="" />
                {propertyTypes.map((type) => (
                  <Picker.Item
                    key={type._id}
                    label={type.name}
                    value={type.name}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Location:</Text>
              <Picker
                selectedValue={editedDetails.location}
                onValueChange={(value) =>
                  setEditedDetails({ ...editedDetails, location: value })
                }
                style={styles.dropdown}
              >
                <Picker.Item label="Select Location" value="" />
                {constituencies
                  .flatMap((c) => c.assemblies)
                  .map((a, i) => (
                    <Picker.Item
                      key={`${a._id}-${i}`}
                      label={a.name}
                      value={a.name}
                    />
                  ))}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Price"
              value={editedDetails.price}
              onChangeText={(text) =>
                setEditedDetails({ ...editedDetails, price: text })
              }
              keyboardType="numeric"
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Update Modals */}
      {renderUpdateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 60,
  },
  container: {
    flexGrow: 1,
    padding: 15,
    marginBottom: 60,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: Platform.OS === "web" ? 0 : 10,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flex: Platform.OS === "web" ? 0.48 : 1,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 10,
    minWidth: Platform.OS === "web" ? 120 : 100,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    flex: 1,
    height: 40,
  },
  picker: {
    height: "100%",
    width: "100%",
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: Platform.OS === "web" ? "flex-start" : "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: 10,
    width: Platform.OS === "web" ? "30%" : "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  details: {
    marginBottom: 10,
  },
  idContainer: {
    backgroundColor: "#2ecc71",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  idText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },
  budget: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 5,
  },
  approvedText: {
    color: "#2ecc71",
    fontWeight: "bold",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
    margin: 2,
    minWidth: 70,
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  updateButton: {
    backgroundColor: "#9b59b6",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  approveButton: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  centeredModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  updateModalContent: {
    width: "90%",
    maxWidth: 700,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
  },
  dropdown: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    width: "40%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  saveButton: {
    backgroundColor: "#3498db",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
});

export default ViewAllProperties;
