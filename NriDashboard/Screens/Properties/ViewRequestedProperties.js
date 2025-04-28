import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
import { API_URL } from "../../../data/ApiUrl";

const numColumns = width > 800 ? 4 : 1;

const RequestedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editedData, setEditedData] = useState({
    propertyTitle: "",
    propertyType: "",
    location: "",
    Budget: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("Token not found in AsyncStorage");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `${API_URL}/requestProperty/myrequestedPropertys`,
        {
          method: "GET",
          headers: {
            token: `${token}` || "",
          },
        }
      );
      const data = await response.json();
      const formattedProperties = data.reverse().map((item) => ({
        id: item._id,
        title: item.propertyTitle,
        type: item.propertyType,
        ExactLocation:item.islocation,
        location: item.location,
        budget: `₹${item.Budget.toLocaleString()}`,
        image: getImageByPropertyType(item.propertyType),
      }));
      setProperties(formattedProperties);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setLoading(false);
    }
  };

  const getImageByPropertyType = (propertyType) => {
    switch (propertyType.toLowerCase()) {
      case "land":
        return require("../../../assets/Land.jpg");
      case "residential":
        return require("../../../assets/residntial.jpg");
      case "commercial":
        return require("../../../assets/commercial.jpg");
      case "villa":
        return require("../../../assets/villa.jpg");
      default:
        return require("../../../assets/house.png");
    }
  };

  const handleEditPress = (property) => {
    setSelectedProperty(property);
    setEditedData({
      propertyTitle: property.title,
      propertyType: property.type,
      location: property.location,
      Budget: property.budget.replace("₹", "").replace(/,/g, ""), // Remove ₹ and commas
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProperty) return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("Token not found");
        return;
      }

      const response = await fetch(
        `${API_URL}/requestProperty/updateProperty/${selectedProperty.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: `${token}`,
          },
          body: JSON.stringify(editedData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Updated successfully:", result);
        setEditModalVisible(false);
        fetchProperties(); // Refresh the list
      } else {
        console.error("Failed to update:", result.message);
      }
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };

  const getLastFourChars = (id) => {
    return id ? id.slice(-4) : "N/A";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Requested Properties</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e91e63" />
          <Text style={styles.loadingText}>Fetching properties...</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {properties.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.details}>
                <View style={styles.idContainer}>
                  <View style={styles.idBadge}>
                    <Text style={styles.idText}>
                      ID: {getLastFourChars(item.id)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.text}>Type: {item.type}</Text>
                <Text style={styles.text}>Constituency: {item.location}</Text>
               <Text style={styles.text}>ExactLocation: {item.ExactLocation}</Text>
                <Text style={styles.text}>Budget: {item.budget}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPress(item)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Edit Property Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Property</Text>
            <TextInput
              style={styles.input}
              value={editedData.propertyTitle}
              onChangeText={(text) =>
                setEditedData({ ...editedData, propertyTitle: text })
              }
              placeholder="Property Title"
            />
            <TextInput
              style={styles.input}
              value={editedData.propertyType}
              onChangeText={(text) =>
                setEditedData({ ...editedData, propertyType: text })
              }
              placeholder="Property Type"
            />
            <TextInput
              style={styles.input}
              value={editedData.location}
              onChangeText={(text) =>
                setEditedData({ ...editedData, location: text })
              }
              placeholder="Location"
            />
            <TextInput
              style={styles.input}
              value={editedData.Budget}
              keyboardType="numeric"
              onChangeText={(text) =>
                setEditedData({ ...editedData, Budget: text })
              }
              placeholder="Budget"
            />
            <Button title="Save Changes" onPress={handleSaveEdit} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setEditModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    margin: 8,
    width: 250,
    padding: 10,
    elevation: 3,
  },
  image: { width: "100%", height: 120, resizeMode: "cover" },
  details: { padding: 10 },
  idContainer: {
    alignItems: "flex-end",
    marginBottom: 5,
  },
  idBadge: {
    backgroundColor: "green",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  idText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  text: { fontSize: 12, color: "#666" },
  editButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  editButtonText: { color: "white", fontSize: 14 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10, borderRadius: 5 },
});

export default RequestedProperties;
