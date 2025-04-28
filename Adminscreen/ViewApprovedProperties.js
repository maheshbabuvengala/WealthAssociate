import React, { useEffect, useState } from "react";
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
  Linking,
  Share,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../data/ApiUrl";

const { width } = Dimensions.get("window");

const ViewAllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [editedDetails, setEditedDetails] = useState({
    propertyType: "",
    location: "",
    price: "",
    photo: "",
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [propertyTypeSearch, setPropertyTypeSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [idSearch, setIdSearch] = useState("");

  const fetchPropertyTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/discons/propertytype`);
      const data = await response.json();
      setPropertyTypes(data);
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };

  const fetchConstituencies = async () => {
    try {
      const response = await fetch(`${API_URL}/alldiscons/alldiscons`);
      const data = await response.json();
      setConstituencies(data);
    } catch (error) {
      console.error("Error fetching constituencies:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/properties/getApproveProperty`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setProperties(data);
      } else {
        console.warn("API returned empty data.");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchPropertyTypes();
    fetchConstituencies();
  }, []);

  const getLastFourChars = (id) => {
    return id ? id.slice(-4) : "N/A";
  };

  const filteredPropertyTypes = propertyTypes.filter((item) =>
    item.name.toLowerCase().includes(propertyTypeSearch.toLowerCase())
  );

  const filteredConstituencies = constituencies.flatMap((item) =>
    item.assemblies.filter((assembly) =>
      assembly.name.toLowerCase().includes(locationSearch.toLowerCase())
    )
  );

  const filteredProperties = properties.filter((property) => {
    const matchesId = idSearch
      ? getLastFourChars(property._id)
          .toLowerCase()
          .includes(idSearch.toLowerCase())
      : true;

    return matchesId;
  });

  const handleDelete = async (id) => {
    if (Platform.OS === "web") {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this property?"
      );
      if (!confirmDelete) return;
    } else {
      const confirmDelete = await new Promise((resolve) => {
        Alert.alert(
          "Confirm",
          "Are you sure you want to delete this property?",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Delete", onPress: () => resolve(true) },
          ]
        );
      });
      if (!confirmDelete) return;
    }

    try {
      const response = await fetch(
        `${API_URL}/properties/approvedelete/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (response.ok) {
        setProperties(properties.filter((item) => item._id !== id));
        if (Platform.OS === "web") {
          alert("Property deleted successfully.");
        } else {
          Alert.alert("Success", "Property deleted successfully.");
        }
      } else {
        if (Platform.OS === "web") {
          alert(result.message || "Failed to delete.");
        } else {
          Alert.alert("Error", result.message || "Failed to delete.");
        }
      }
    } catch (error) {
      console.error("Error deleting property:", error);
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
    setIsModalVisible(true);
  };

  const handleViewDetails = (property) => {
    setSelectedPropertyDetails(property);
    setIsDetailsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${API_URL}/properties/approveupdate/${selectedProperty._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedDetails),
        }
      );

      const result = await response.json();
      if (response.ok) {
        const updatedProperties = properties.map((item) =>
          item._id === selectedProperty._id
            ? { ...item, ...editedDetails }
            : item
        );
        setProperties(updatedProperties);
        setIsModalVisible(false);
        Alert.alert("Success", "Property updated successfully.");
      } else {
        Alert.alert("Error", result.message || "Failed to update property.");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      Alert.alert("Error", "An error occurred while updating the property.");
    }
  };

  const handleSold = async (id) => {
    const confirm = await new Promise((resolve) => {
      if (Platform.OS === "web") {
        resolve(
          window.confirm("Are you sure you want to mark this property as sold?")
        );
      } else {
        Alert.alert("Confirm", "Mark this property as sold?", [
          { text: "Cancel", onPress: () => resolve(false) },
          { text: "Mark as Sold", onPress: () => resolve(true) },
        ]);
      }
    });

    if (!confirm) return;

    try {
      const response = await fetch(`${API_URL}/properties/sold/${id}`, {
        method: "POST",
      });

      if (response.ok) {
        // Update the local state to reflect sold status
        setProperties(
          properties.map((property) =>
            property._id === id ? { ...property, sold: true } : property
          )
        );
        Alert.alert("Success", "Property marked as sold");

        // If you need to refresh data, call fetchProperties directly
        fetchProperties();
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Failed to mark as sold");
      }
    } catch (err) {
      console.error("Sold error:", err);
      Alert.alert("Error", "Failed to mark property as sold");
    }
  };

  const formatPropertyDetails = (property) => {
    let details = `*Property Details*\n\n`;
    details += `*ID:* ${getLastFourChars(property._id)}\n`;
    details += `*Type:* ${property.propertyType}\n`;
    details += `*Location:* ${property.location}\n`;
    details += `*Constituency:* ${property.Constituency || "N/A"}\n`;
    details += `*Price:* ₹${parseInt(property.price).toLocaleString()}\n`;
    details += `*Details:* ${property.propertyDetails || "N/A"}\n`;
    details += `*Posted By:* ${property.PostedBy || "N/A"}\n`;
    details += `*User Type:* ${property.PostedUserType || "N/A"}\n\n`;

    // Add dynamic data
    details += `*Specifications:*\n`;
    Object.entries(property).forEach(([key, value]) => {
      if (
        [
          "_id",
          "propertyType",
          "location",
          "price",
          "photo",
          "propertyDetails",
          "PostedBy",
          "PostedUserType",
          "Constituency",
        ].includes(key)
      ) {
        return;
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        details += `\n*${key.toUpperCase()}:*\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== null && subValue !== undefined && subValue !== "") {
            const formattedKey = subKey
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            details += `  ${formattedKey}: ${subValue}\n`;
          }
        });
      } else if (value !== null && value !== undefined && value !== "") {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        details += `${formattedKey}: ${value}\n`;
      }
    });

    return details;
  };

  const shareOnWhatsApp = () => {
    if (!selectedPropertyDetails) return;

    const message = formatPropertyDetails(selectedPropertyDetails);

    if (Platform.OS === "web") {
      // Web: Opens WhatsApp Web with recent chats (no way to skip)
      window.open(
        `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } else {
      // Mobile: Forces "New Chat" screen (works on most devices)
      const url = `whatsapp://send?phone=&text=${encodeURIComponent(message)}`;

      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // Fallback: Open WhatsApp normally if deep link fails
            Linking.openURL(
              `whatsapp://send?text=${encodeURIComponent(message)}`
            ).catch(() => Alert.alert("Error", "WhatsApp not installed"));
          }
        })
        .catch(() => {
          Alert.alert("Error", "Could not open WhatsApp");
        });
    }
  };

  const renderDynamicData = (data) => {
    if (!data) return null;

    // Handle case where data is an array
    if (Array.isArray(data)) {
      return (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Items:</Text>
          <View style={styles.arrayContainer}>
            {data.map((item, index) => (
              <Text key={index} style={styles.detailValue}>
                {typeof item === "object"
                  ? JSON.stringify(item)
                  : item.toString()}
              </Text>
            ))}
          </View>
        </View>
      );
    }

    // Handle case where data is an object
    return Object.entries(data).map(([key, value]) => {
      if (value === null || value === undefined || value === "") return null;

      // Skip these fields as they're already displayed in basic info
      if (
        [
          "_id",
          "propertyType",
          "location",
          "price",
          "photo",
          "propertyDetails",
          "PostedBy",
          "PostedUserType",
          "Constituency",
        ].includes(key)
      ) {
        return null;
      }

      // Format key for display
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, "$1 $2");

      // Handle nested objects (like agricultureDetails)
      if (typeof value === "object" && !Array.isArray(value)) {
        return (
          <View key={key} style={styles.nestedSection}>
            <Text style={styles.nestedTitle}>{formattedKey}:</Text>
            {renderDynamicData(value)}
          </View>
        );
      }

      // Handle arrays within objects
      if (Array.isArray(value)) {
        return (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{formattedKey}:</Text>
            <View style={styles.arrayContainer}>
              {value.map((item, index) => (
                <Text key={index} style={styles.detailValue}>
                  {typeof item === "object"
                    ? JSON.stringify(item)
                    : item.toString()}
                </Text>
              ))}
            </View>
          </View>
        );
      }

      // Handle primitive values
      return (
        <View key={key} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{formattedKey}:</Text>
          <Text style={styles.detailValue}>
            {value.toString() === "true"
              ? "Yes"
              : value.toString() === "false"
              ? "No"
              : value.toString()}
          </Text>
        </View>
      );
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.heading}>All Properties</Text>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Sort by:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedFilter}
                  onValueChange={(value) => setSelectedFilter(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Select Filter --" value="" />
                  <Picker.Item label="Price: High to Low" value="lowToHigh" />
                  <Picker.Item label="Price: Low to High" value="highToLow" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by last 4 digits of ID"
              value={idSearch}
              onChangeText={setIdSearch}
              maxLength={4}
            />
          </View>

          <View style={styles.grid}>
            {filteredProperties.map((item) => {
              const imageUri = item.photo
                ? { uri: `${API_URL}${item.photo}` }
                : require("../assets/logo.png");
              const propertyId = getLastFourChars(item._id);

              return (
                <View key={item._id} style={styles.card}>
                  <Image source={imageUri} style={styles.image} />
                  <View style={styles.details}>
                    <View style={styles.idContainer}>
                      <Text style={styles.idText}>ID: {propertyId}</Text>
                    </View>
                    <Text style={styles.title}>{item.propertyType}</Text>
                    <Text style={styles.title}>PostedBy: {item.PostedBy}</Text>
                    <Text style={styles.title}>{item.propertyDetails}</Text>
                    <Text style={styles.info}>Location: {item.location}</Text>
                    <Text style={styles.budget}>
                      ₹ {parseInt(item.price).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.viewButton]}
                      onPress={() => handleViewDetails(item)}
                    >
                      <Text style={styles.buttonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={() => handleEdit(item)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.deleteButton]}
                      onPress={() => handleDelete(item._id)}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.deleteButton]}
                      onPress={() => handleSold(item._id)}
                    >
                      <Text style={styles.buttonText}>SoldOut</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Edit Modal */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Property</Text>

                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Property Type:</Text>
                  <View style={styles.dropdown}>
                    <Picker
                      selectedValue={editedDetails.propertyType}
                      onValueChange={(value) =>
                        setEditedDetails({
                          ...editedDetails,
                          propertyType: value,
                        })
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Property Type" value="" />
                      {filteredPropertyTypes.map((type) => (
                        <Picker.Item
                          key={type._id}
                          label={type.name}
                          value={type.name}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Location:</Text>
                  <View style={styles.dropdown}>
                    <Picker
                      selectedValue={editedDetails.location}
                      onValueChange={(value) =>
                        setEditedDetails({ ...editedDetails, location: value })
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Location" value="" />
                      {filteredConstituencies.map((assembly, index) => (
                        <Picker.Item
                          key={`${assembly._id}-${index}`}
                          label={assembly.name}
                          value={assembly.name}
                        />
                      ))}
                    </Picker>
                  </View>
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
                    onPress={() => setIsModalVisible(false)}
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
            </View>
          </Modal>

          {/* Details Modal */}
          <Modal
            visible={isDetailsModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsDetailsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.detailsModalContent, { maxHeight: "90%" }]}>
                <Text style={styles.modalTitle}>Property Details</Text>

                {selectedPropertyDetails && (
                  <>
                    <View style={styles.detailImageContainer}>
                      <Image
                        source={
                          selectedPropertyDetails.photo
                            ? {
                                uri: `${API_URL}${selectedPropertyDetails.photo}`,
                              }
                            : require("../assets/logo.png")
                        }
                        style={styles.detailImage}
                      />
                    </View>

                    <ScrollView style={styles.detailsScrollView}>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>
                          Basic Information
                        </Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Property ID:</Text>
                          <Text style={styles.detailValue}>
                            {getLastFourChars(selectedPropertyDetails._id)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Type:</Text>
                          <Text style={styles.detailValue}>
                            {selectedPropertyDetails.propertyType}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Location:</Text>
                          <Text style={styles.detailValue}>
                            {selectedPropertyDetails.location}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Constituency:</Text>
                          <Text style={styles.detailValue}>
                            {selectedPropertyDetails.Constituency || "N/A"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Price:</Text>
                          <Text style={styles.detailValue}>
                            ₹{" "}
                            {parseInt(
                              selectedPropertyDetails.price
                            ).toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Property Details:
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedPropertyDetails.propertyDetails || "N/A"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Posted By:</Text>
                          <Text style={styles.detailValue}>
                            {selectedPropertyDetails.PostedBy || "N/A"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Posted User Type:
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedPropertyDetails.PostedUserType || "N/A"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>
                          Property Specifications
                        </Text>
                        {renderDynamicData(selectedPropertyDetails)}
                      </View>
                    </ScrollView>
                  </>
                )}

                <View style={styles.detailsModalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.whatsappButton]}
                    onPress={shareOnWhatsApp}
                  >
                    <Text style={styles.modalButtonText}>
                      Share on WhatsApp
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.closeButton]}
                    onPress={() => setIsDetailsModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#f5f5f5", padding: 15, marginBottom: 30 },
  header: {
    flexDirection: Platform.OS === "android" ? "column" : "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: { fontSize: 22, fontWeight: "bold", textAlign: "left" },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  filterLabel: { fontSize: 16, marginRight: 5 },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    height: Platform.OS === "android" ? 50 : 40,
  },
  picker: { height: "100%", width: 180, fontSize: 14 },
  loader: { marginTop: 50 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    width: Platform.OS === "web" ? "30%" : "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  image: { width: "100%", height: 150, borderRadius: 8 },
  details: { marginTop: 10 },
  idContainer: {
    backgroundColor: "green",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  idText: {
    color: "#fff",
    fontWeight: "600",
  },
  title: { fontSize: 16, fontWeight: "bold" },
  info: { fontSize: 14, color: "#555" },
  budget: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
  },
  button: {
    padding: 6,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
    marginBottom: 5,
    minWidth: 70,
  },
  viewButton: {
    backgroundColor: "#4CAF50",
  },
  editButton: {
    backgroundColor: "#3498db",
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: Platform.OS === "web" ? "50%" : "90%",
  },
  detailsModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: Platform.OS === "web" ? "70%" : "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    height: 50,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  closeButton: {
    backgroundColor: "#3498db",
    marginTop: 10,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    marginTop: 10,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  detailImageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  detailImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  detailsScrollView: {
    maxHeight: Platform.OS === "web" ? 400 : 300,
  },
  detailSection: {
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#3498db",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontWeight: "bold",
    width: "40%",
  },
  detailValue: {
    width: "60%",
    textAlign: "right",
  },
  nestedSection: {
    marginLeft: 10,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: "#ddd",
    paddingLeft: 10,
  },
  nestedTitle: {
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  arrayContainer: {
    width: "60%",
  },
  detailsModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default ViewAllProperties;
