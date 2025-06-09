import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import logo1 from "../../assets/man.png";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const fetchUserTypeAndCustomers = async () => {
      try {
        const type = await AsyncStorage.getItem("userType");
        setUserType(type);
        await fetchCustomers(type);
      } catch (error) {
        console.error("Error fetching user type:", error);
        setLoading(false);
      }
    };
    fetchUserTypeAndCustomers();
  }, []);

  const fetchCustomers = async (type = userType) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("Token not found in AsyncStorage");
        setLoading(false);
        return;
      }

      let endpoint = "";
      switch (type) {
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

  const handleDelete = async (customerId, customerName) => {
    const confirmDelete = async () => {
      if (Platform.OS === "web") {
        return window.confirm(`Are you sure you want to delete ${customerName}?`);
      } else {
        return new Promise((resolve) => {
          Alert.alert(
            "Confirm Delete",
            `Are you sure you want to delete ${customerName}?`,
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

    try {
      const confirmed = await confirmDelete();
      if (!confirmed) return;

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

      setCustomers(prevCustomers => 
        prevCustomers.filter(customer => customer._id !== customerId)
      );
      Alert.alert("Success", "Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      Alert.alert("Error", "Failed to delete customer");
    } finally {
      setDeletingId(null);
    }
  };

  const renderCustomerCards = () => {
    if (isWeb) {
      return (
        <View style={styles.webGrid}>
          {customers.map((customer) => (
            <CustomerCard 
              key={customer._id} 
              customer={customer} 
              onDelete={handleDelete}
              userType={userType}
              deletingId={deletingId}
            />
          ))}
        </View>
      );
    } else {
      return customers.map((customer) => (
        <CustomerCard 
          key={customer._id} 
          customer={customer} 
          onDelete={handleDelete}
          userType={userType}
          deletingId={deletingId}
        />
      ));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          My Customers: {customers.length > 0 ? customers.length : "0"}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#3E5C76"
            style={styles.loader}
          />
        ) : customers.length > 0 ? (
          <View style={styles.gridContainer}>
            {renderCustomerCards()}
          </View>
        ) : (
          <Text style={styles.noCustomersText}>No customers found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CustomerCard = ({ customer, onDelete, userType, deletingId }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={logo1} style={styles.avatar} />
        <Text style={styles.customerName}>{customer.FullName}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile:</Text>
          <Text style={styles.infoValue}>{customer.MobileNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Occupation:</Text>
          <Text style={styles.infoValue}>{customer.Occupation}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Referral Code:</Text>
          <Text style={styles.infoValue}>{customer.MyRefferalCode}</Text>
        </View>
        
        {userType !== "WealthAssociate" &&
          userType !== "ReferralAssociate" &&
          userType !== "CoreMember" && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>District:</Text>
                <Text style={styles.infoValue}>{customer.District}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Constituency:</Text>
                <Text style={styles.infoValue}>{customer.Contituency}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{customer.Locations}</Text>
              </View>
            </>
          )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(customer._id, customer.FullName)}
        disabled={deletingId === customer._id}
      >
        {deletingId === customer._id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete Customer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 30,
  },
  scrollContainer: {
    width: "100%",
    paddingHorizontal: isWeb ? 20 : 10,
  },
  loader: {
    marginTop: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3E5C76",
    marginVertical: 20,
    marginLeft: isWeb ? 10 : 0,
  },
  gridContainer: {
    width: "100%",
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: isWeb ? -10 : 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: isWeb ? "31%" : "93%",
    margin: isWeb ? 10 : 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#f0f0f0",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3E5C76",
  },
  infoContainer: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  noCustomersText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6c757d",
    width: "100%",
  },
  deleteButton: {
    marginTop: 15,
    backgroundColor: "#e63946",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: "center",
    width: "100%"
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});