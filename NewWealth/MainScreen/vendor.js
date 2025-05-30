import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../data/ApiUrl";

const Vendor = ({ route }) => {
  const { vendorType, subcategory } = route.params;
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `${API_URL}/suppliersvendors/getsuppliers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ category: vendorType }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const vendorsData = Array.isArray(data) ? data : [data];
        setVendors(vendorsData);
        if (subcategory) {
          const filtered = vendorsData.filter(
            (vendor) =>
              vendor.subcategory && vendor.subcategory.includes(subcategory)
          );
          setFilteredVendors(filtered);
        } else {
          setFilteredVendors(vendorsData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVendors();
  }, [vendorType, subcategory]);

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading vendors: {error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setLoading(true);
            setVendors([]);
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {subcategory ? `${vendorType} - ${subcategory}` : vendorType}
      </Text>

      {filteredVendors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#999" />
          <Text style={styles.emptyText}>
            {subcategory
              ? `No suppliers found for ${subcategory}`
              : "No suppliers found for this category"}
          </Text>
          <Text style={styles.emptySubtext}>
            Please check back later or try another category
          </Text>
        </View>
      ) : (
        <View style={styles.vendorsContainer}>
          {filteredVendors.map((item) => (
            <View
              key={item._id || Math.random().toString()}
              style={styles.vendorCard}
            >
              <Image
                source={
                  item.logo
                    ? { uri: formatImageUrl(item.logo) }
                    : require("../../assets/man.png")
                }
                style={styles.vendorImage}
                defaultSource={require("../../assets/man.png")}
                onError={(e) => {
                  console.log("Image load error:", e.nativeEvent.error);
                  e.target.source = require("../../assets/man.png");
                }}
              />
              <View style={styles.vendorDetails}>
                <Text style={styles.vendorName}>
                  {item.companyName || "Company name not available"}
                </Text>
                <Text style={styles.ownerName}>
                  {item.ownerName || "Owner name not available"}
                </Text>
                <Text style={styles.ownerName}>
                  {item.location || "Location not available"}
                </Text>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.exactLocation ||
                      item.location ||
                      "Location not specified"}
                  </Text>
                </View>
                {item.phone && (
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.phone}</Text>
                  </View>
                )}
                {item.subcategories && (
                  <View style={styles.subcategoriesContainer}>
                    <Text style={styles.subcategoriesTitle}>Services:</Text>
                    <View style={styles.subcategories}>
                      {item.subcategories.map((subcat, index) => (
                        <Text key={index} style={styles.subcategory}>
                          {subcat}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#D81B60",
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  vendorsContainer: {
    marginBottom: 20,
  },
  vendorCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  vendorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
  },
  vendorDetails: {
    width: "100%",
    alignItems: "center",
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    textAlign: "center",
  },
  ownerName: {
    fontSize: 15,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    width: "100%",
    justifyContent: "center",
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
    maxWidth: "80%",
  },
  subcategoriesContainer: {
    marginTop: 10,
    width: "100%",
  },
  subcategoriesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  subcategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  subcategory: {
    fontSize: 12,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    margin: 3,
    color: "#555",
  },
});

export default Vendor;
