import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../data/ApiUrl";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const numColumns = 3;

const ViewPostedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editedData, setEditedData] = useState({
    propertyType: "",
    location: "",
    price: "",
  });
  const [showFilterList, setShowFilterList] = useState(false);

  const filterOptions = [
    { label: "All Properties", value: "" },
    { label: "Price: Low to High", value: "lowToHigh" },
    { label: "Price: High to Low", value: "highToLow" },
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.warn("No token found in AsyncStorage.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/properties/getMyPropertys`, {
        method: "GET",
        headers: {
          token: `${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties([]);
        console.error("Unexpected API response:", data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setShowFilterList(false);

    if (value === "highToLow") {
      setProperties((prevProperties) =>
        [...(Array.isArray(prevProperties) ? prevProperties : [])].sort(
          (a, b) => b.price - a.price
        )
      );
    } else if (value === "lowToHigh") {
      setProperties((prevProperties) =>
        [...(Array.isArray(prevProperties) ? prevProperties : [])].sort(
          (a, b) => a.price - b.price
        )
      );
    } else {
      fetchProperties();
    }
  };

  const handleEditPress = (property) => {
    setSelectedProperty(property);
    setEditedData({
      propertyType: property.propertyType,
      location: property.location,
      price: property.price.toString(),
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
        `${API_URL}/properties/editProperty/${selectedProperty._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: `${token}`,
          },
          body: JSON.stringify(editedData),
        }
      );

      if (response.ok) {
        console.log("Updated successfully");
        setEditModalVisible(false);
        fetchProperties();
      } else {
        console.error("Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };
  const getLastFourCharss = (id) => {
    if (!id) return "N/A";
    return id.length > 4 ? id.slice(-4) : id;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Properties</Text>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterList(!showFilterList)}
              >
                <Text style={styles.filterButtonText}>
                  {selectedFilter
                    ? filterOptions.find((opt) => opt.value === selectedFilter)
                        ?.label || "Select filter"
                    : "Select filter"}
                </Text>
                <MaterialIcons
                  name={showFilterList ? "arrow-drop-up" : "arrow-drop-down"}
                  size={24}
                  color="#E82E5F"
                  style={styles.icon}
                />
              </TouchableOpacity>
              {showFilterList && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={styles.scrollView}>
                    {filterOptions.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={styles.listItem}
                        onPress={() => handleFilterChange(item.value)}
                      >
                        <Text>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E82E5F" style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          {properties.map((item) => {
            const imageUri = item.photo
              ? { uri: `${API_URL}${item.photo}` }
              : require("../../../assets/logo.png");

            return (
              <View key={item._id} style={styles.card}>
                <Image source={imageUri} style={styles.image} />
                <View style={styles.details}>
                  <View style={styles.idContainer}>
                    <Text style={styles.idText}>
                      ID: {getLastFourCharss(item._id)}
                    </Text>
                  </View>
                  <Text style={styles.title}>{item.propertyType}</Text>
                  <Text style={styles.info}>Location: {item.location}</Text>
                  <Text style={styles.budget}>
                    ₹ {parseInt(item.price).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditPress(item)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Property</Text>
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
              value={editedData.price}
              keyboardType="numeric"
              onChangeText={(text) =>
                setEditedData({ ...editedData, price: text })
              }
              placeholder="Price"
            />
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleSaveEdit}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  header: {
    flexDirection:
      Platform.OS === "android" || Platform.OS === "ios" ? "column" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    color: "#191919",
  },
  idContainer: {
    backgroundColor: "green",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-end",
    margin: 5,
  },
  idText: {
    color: "#fff",
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 10,
    color: "#191919",
  },
  inputContainer: {
    width: Platform.OS === "android" || Platform.OS === "ios" ? "70%" : "30%",
    position: "relative",
    zIndex: 1,
  },
  inputWrapper: {
    position: "relative",
    zIndex: 1,
  },
  filterButton: {
    width: "100%",
    height: 47,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButtonText: {
    color: "rgba(25, 25, 25, 0.5)",
  },
  icon: {
    right: 0,
    top: 0,
  },
  dropdownContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  scrollView: {
    maxHeight: 300,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  loader: {
    marginTop: 50,
  },
  grid: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  details: {
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#191919",
  },
  info: {
    fontSize: 14,
    color: "#555",
  },
  budget: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    color: "#E82E5F",
  },
  editButton: {
    marginTop: 10,
    backgroundColor: "#E82E5F",
    padding: 8,
    borderRadius: 15,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 25,
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#191919",
    textAlign: "center",
  },
  registerButton: {
    backgroundColor: "#E82E5F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#424242",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
});

export default ViewPostedProperties;
