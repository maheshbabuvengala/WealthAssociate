import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const SuppliersVendors = () => {
  const navigation = useNavigation();

  const vendorTypes = [
    { id: 1, name: "Building Materials Suppliers", icon: "construct", color: "white" },
    { id: 2, name: "Equipment and Tool Suppliers", icon: "color-palette", color: "white" },
    { id: 3, name: "Plumbing and Electrical Suppliers", icon: "brush", color: "white" },
    { id: 4, name: "Paint and Finishing Suppliers", icon: "flash", color: "white" },
    { id: 5, name: "HVAC Suppliers", icon: "water", color: "white" },
    { id: 6, name: "Landscaping Suppliers", icon: "hammer", color: "white" },
    { id: 7, name: "Prefabricated Construction Materials", icon: "brush", color: "white" },
    { id: 8, name: "Waste Management and Disposal", icon: "leaf", color: "white" },
    { id: 9, name: "Logistics and Transport", icon: "lock-closed", color: "white" },
    { id: 10, name: "Architectural and Design Suppliers", icon: "trash", color: "white" },
  ];

  const handleVendorTypePress = (type) => {
    navigation.navigate("VendorList", { vendorType: type });
  };

  const handleAddSupplier = () => {
    navigation.navigate("AddSupplier");
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button in a Mini Box */}
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers & Vendors</Text>
        <TouchableOpacity onPress={handleAddSupplier}>
          <View style={styles.addButtonBox}>
            <MaterialIcons name="add" size={18} color="#D81B60" />
            <Text style={styles.addButtonText}>Add Supplier</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Find all the services you need for your property
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.grid}>
          {vendorTypes.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              style={[styles.vendorCard, { backgroundColor: vendor.color }]}
              onPress={() => handleVendorTypePress(vendor.name)}
            >
              <Ionicons name={vendor.icon} size={40} color="#D81B60" />
              <Text style={styles.vendorName}>{vendor.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 33,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButtonBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D81B60",
    gap: 6,
  },
  addButtonText: {
    color: "#D81B60",
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  vendorCard: {
    width: width * 0.45 - 20,
    height: 120,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  vendorName: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
});

export default SuppliersVendors;