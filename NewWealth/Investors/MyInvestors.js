import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo1 from "../../assets/man.png";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ViewInvesters() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    fetchInvestorsBasedOnUserType();
  }, []);

  const fetchInvestorsBasedOnUserType = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const storedUserType = await AsyncStorage.getItem("userType");

      if (!token || !storedUserType) {
        console.error("Missing token or userType in AsyncStorage");
        setLoading(false);
        return;
      }

      setUserType(storedUserType);

      let endpoint = "";
      switch (storedUserType) {
        case "WealthAssociate":
        case "ReferralAssociate":
          endpoint = `${API_URL}/investors/getagentinvestor`;
          break;
        case "NRI":
          endpoint = `${API_URL}/nri/getnri`;
          break;
        case "Investor":
          endpoint = `${API_URL}/investors/getinvestor`;
          break;
        default:
          endpoint = `${API_URL}/investors/getagentinvestor`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        setInvestors(data.data);
      } else {
        setInvestors([]);
      }
    } catch (error) {
      console.error("Error fetching investors:", error);
      Alert.alert("Error", "Failed to fetch investors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      let endpoint = "";
      switch (userType) {
        case "WealthAssociate":
        case "ReferralAssociate":
        case "Investor":
          endpoint = `${API_URL}/investors/delete/${id}`;
          break;
        case "NRI":
          endpoint = `${API_URL}/nri/delete/${id}`;
          break;
        default:
          endpoint = `${API_URL}/investors/delete/${id}`;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          token: `${token}` || "",
        },
      });

      if (response.ok) {
        setInvestors(investors.filter((investor) => investor._id !== id));
        Alert.alert("Success", "Investor deleted successfully");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to delete investor");
      }
    } catch (error) {
      console.error("Error deleting investor:", error);
      Alert.alert("Error", "An error occurred while deleting the investor");
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this investor?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDelete(id),
          style: "destructive",
        },
      ]
    );
  };

  const renderInvestorCard = (item) => (
    <View key={item._id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={logo1} style={styles.avatar} />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item._id)}
        >
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>: {item.FullName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>: {item.SelectSkill}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile Number</Text>
          <Text style={styles.value}>: {item.MobileNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>: {item.Location}</Text>
        </View>
        {userType === "NRI" && (
          <View style={styles.row}>
            <Text style={styles.label}>NRI Details</Text>
            <Text style={styles.value}>: {item.NRIDetails || "N/A"}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const getHeaderTitle = () => {
    switch (userType) {
      case "WealthAssociate":
      case "ReferralAssociate":
        return "Agent Investors";
      case "NRI":
        return "NRI Investors";
      case "Investor":
        return "Investors";
      default:
        return "Investors";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>{getHeaderTitle()}</Text>
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : investors.length > 0 ? (
          <View style={width > 600 ? styles.rowWrapper : null}>
            {investors.map((item) => renderInvestorCard(item))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No investors found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 15,
    paddingLeft: 10,
  },
  gridContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  rowWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width > 600 ? "35%" : "auto",
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#ddd",
  },
  deleteButton: {
    padding: 5,
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});
