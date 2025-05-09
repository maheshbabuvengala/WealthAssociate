import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import logo1 from "../../assets/man.png";

const { width } = Dimensions.get("window");

export default function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const fetchUserTypeAndCustomers = async () => {
      const type = await AsyncStorage.getItem("userType");
      setUserType(type);
      await fetchCustomers(type); // Pass the type directly
    };
    fetchUserTypeAndCustomers();
  }, []);

  const fetchCustomers = async (type = userType) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("Token not found in AsyncStorage");
        setLoading(false);
        return;
      }

      let endpoint = "";
      switch (
        type // Use the passed type parameter
      ) {
        case "WealthAssociate":
        case "ReferralAssociate":
          endpoint = `${API_URL}/customer/myCustomers`;
          break;
        case "CoreMember":
          endpoint = `${API_URL}/core/mycustomers`;
          break;
        default:
          endpoint = `${API_URL}/customer/getmycustomer`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });

      const data = await response.json();

      if (type === "WealthAssociate" || type === "ReferralAssociate") {
        setCustomers(data?.referredAgents || []);
      } else if (type === "CoreMember") {
        setCustomers(data?.referredAgents || []);
      } else {
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    try {
      setDeletingId(customerId);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("Token not found in AsyncStorage");
        return;
      }

      const response = await fetch(
        `${API_URL}/customer/deletecustomer/${customerId}`,
        {
          method: "DELETE",
          headers: {
            token: `${token}` || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      await fetchCustomers();
      Alert.alert("Success", "Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      Alert.alert("Error", "Failed to delete customer");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (customerId, customerName) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${customerName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDelete(customerId),
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderCustomerCard = (item) => {
    return (
      <View key={item._id} style={styles.card}>
        <Image source={logo1} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>: {item.FullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile Number</Text>
            <Text style={styles.value}>: {item.MobileNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Occupation</Text>
            <Text style={styles.value}>: {item.Occupation}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Referral Code</Text>
            <Text style={styles.value}>: {item.MyRefferalCode}</Text>
          </View>
          {userType !== "WealthAssociate" &&
            userType !== "ReferralAssociate" &&
            userType !== "CoreMember" && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>District</Text>
                  <Text style={styles.value}>: {item.District}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Constituency</Text>
                  <Text style={styles.value}>: {item.Contituency}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.value}>: {item.Locations}</Text>
                </View>
              </>
            )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item._id, item.FullName)}
          disabled={deletingId === item._id}
        >
          {deletingId === item._id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Customers</Text>
      <View style={styles.gridContainer}>
        {customers.length > 0 ? (
          customers.map(renderCustomerCard)
        ) : (
          <Text style={styles.noCustomersText}>No customers found.</Text>
        )}
      </View>
    </View>
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
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 15,
    paddingLeft: 10,
  },
  gridContainer: {
    paddingBottom: 20,
    flexDirection: width > 600 ? "row" : "column",
    flexWrap: "wrap",
    justifyContent: width > 600 ? "space-between" : "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width > 600 ? "48%" : "100%",
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 15,
    position: "relative",
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
  noCustomersText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
