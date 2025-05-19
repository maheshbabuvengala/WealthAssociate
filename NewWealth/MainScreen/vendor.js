import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const vendor= ({ route }) => {
  const { vendorType } = route.params;
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // This would be replaced with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockVendors = [
        {
          id: 1,
          name: `${vendorType} Provider 1`,
          rating: 4.5,
          reviews: 120,
          image: require("../../assets/man.png"),
        },
        {
          id: 2,
          name: `${vendorType} Provider 2`,
          rating: 4.2,
          reviews: 85,
          image: require("../../assets/man.png"),
        },
        // Add more mock data as needed
      ];
      setVendors(mockVendors);
      setLoading(false);
    }, 500);
  }, [vendorType]);

  const renderVendorItem = ({ item }) => (
    <TouchableOpacity style={styles.vendorItem}>
      <Image source={item.image} style={styles.vendorImage} />
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name={vendor.icon} size={40} color="#D81B60" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{vendorType}</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={vendors}
          renderItem={renderVendorItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  vendorItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  vendorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    color: "#666",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default vendor;