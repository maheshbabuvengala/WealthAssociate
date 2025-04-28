import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_URL } from "../../../data/ApiUrl";

export default function ViewCustomersCalls() {
  const [customers, setCustomers] = useState([]);
  const [contactedCustomers, setContactedCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("Token not found in AsyncStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/customer/getallcustomers`, {
          method: "GET",
          headers: { token: `${token}` || "" },
        });

        const data = await response.json();

        if (data && Array.isArray(data.customers)) {
          // Fetch contacted customers from AsyncStorage
          const storedContacted = await AsyncStorage.getItem("contactedCustomers");
          const parsedContacted = storedContacted ? JSON.parse(storedContacted) : [];

          // Separate contacted and non-contacted customers
          const newCustomers = data.customers.filter(
            (customer) => !parsedContacted.includes(customer._id)
          );
          const contacted = data.customers.filter((customer) =>
            parsedContacted.includes(customer._id)
          );

          setCustomers(newCustomers);
          setContactedCustomers(contacted);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Function to mark a customer as contacted
  const markAsContacted = async (customerId) => {
    try {
      const updatedCustomers = customers.filter((customer) => customer._id !== customerId);
      const contactedCustomer = customers.find((customer) => customer._id === customerId);

      if (contactedCustomer) {
        const updatedContactedCustomers = [...contactedCustomers, contactedCustomer];

        // Save contacted customers to AsyncStorage
        await AsyncStorage.setItem(
          "contactedCustomers",
          JSON.stringify(updatedContactedCustomers.map((customer) => customer._id))
        );

        setCustomers(updatedCustomers);
        setContactedCustomers(updatedContactedCustomers);
      }
    } catch (error) {
      console.error("Error marking customer as contacted:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Customers to Contact</Text>

        {loading ? (
          <Text style={styles.message}>Loading...</Text>
        ) : customers.length > 0 ? (
          customers.map((customer) => (
            <View key={customer._id} style={styles.customerCard}>
              <Image
                source={require("../../assets/customer-icon.png")}
                style={styles.customerImage}
              />
              <View style={styles.customerDetails}>
                <Text style={styles.customerText}>{customer.FullName}</Text>
                <Text style={styles.customerText}>
                  Location: {customer.Location}
                </Text>
                <Text style={styles.customerText}>
                  Contact Number: {customer.ContactNumber}
                </Text>
                <Text style={styles.customerText}>
                  Referral Code: {customer.MyReferralCode}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => markAsContacted(customer._id)}
                style={styles.tickButton}
              >
                <Text style={styles.tickText}>✅</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.message}>No new customers to contact.</Text>
        )}

        <Text style={[styles.heading, { marginTop: 20 }]}>
          Already Contacted Customers
        </Text>

        {contactedCustomers.length > 0 ? (
          contactedCustomers.map((customer) => (
            <View key={customer._id} style={[styles.customerCard, styles.contactedCustomer]}>
              <Image
                source={require("../../assets/customer-icon.png")}
                style={styles.customerImage}
              />
              <View style={styles.customerDetails}>
                <Text style={styles.customerText}>{customer.FullName}</Text>
                <Text style={styles.customerText}>
                  Location: {customer.Location}
                </Text>
                <Text style={styles.customerText}>
                  Contact Number: {customer.ContactNumber}
                </Text>
                <Text style={styles.customerText}>
                  Referral Code: {customer.MyReferralCode}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.message}>No customers contacted yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    width: "90%",
    textAlign: "left",
    marginBottom: 10,
    marginTop: Platform.OS === "android" ? "10%" : 0,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 1000,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  contactedCustomer: {
    opacity: 0.6, // Grey out contacted customers
  },
  customerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  customerDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  customerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  tickButton: {
    padding: 10,
  },
  tickText: {
    fontSize: 24,
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
});
