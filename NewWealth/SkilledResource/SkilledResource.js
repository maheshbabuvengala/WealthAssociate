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
import avatar from "../../assets/man.png";

const { width } = Dimensions.get("window");

export default function ViewSkilledLabours() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    fetchSkilledLabours();
  }, []);

  const fetchSkilledLabours = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const storedUserType = await AsyncStorage.getItem("userType");

      if (!token) {
        console.error("No token found in AsyncStorage");
        setLoading(false);
        return;
      }

      setUserType(storedUserType || "");

      const response = await fetch(`${API_URL}/skillLabour/getmyskilllabour`, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });

      const data = await response.json();

      // Handle different response structures
      if (response.ok) {
        if (Array.isArray(data.data)) {
          setAgents(data.data);
        } else if (Array.isArray(data)) {
          setAgents(data);
        } else {
          setAgents([]);
        }
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error("Error fetching skilled labours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      const response = await fetch(`${API_URL}/skillLabour/delete/${id}`, {
        method: "DELETE",
        headers: {
          token: `${token}` || "",
        },
      });

      if (response.ok) {
        // Remove the deleted agent from the state
        setAgents(agents.filter((agent) => agent._id !== id));
        Alert.alert("Success", "Skilled labor deleted successfully");
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "Failed to delete skilled labor"
        );
      }
    } catch (error) {
      console.error("Error deleting skilled labor:", error);
      Alert.alert("Error", "An error occurred while deleting skilled labor");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (id, name) => {
    Alert.alert("Confirm Delete", `Are you sure you want to delete ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => handleDelete(id),
        style: "destructive",
      },
    ]);
  };

  const renderAgentCard = (item) => (
    <View key={item._id} style={styles.card}>
      <Image source={avatar} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>: {item.FullName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Skill Type</Text>
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

        {/* Additional fields for specific user types */}
        {userType === "CoreMember" && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>District</Text>
              <Text style={styles.value}>: {item.District || "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Constituency</Text>
              <Text style={styles.value}>: {item.Contituency || "N/A"}</Text>
            </View>
          </>
        )}

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
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Skilled Resource</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {agents.length > 0 ? (
            <View style={width > 600 ? styles.rowWrapper : null}>
              {agents.map(renderAgentCard)}
            </View>
          ) : (
            <Text style={styles.emptyText}>No skilled Resources found.</Text>
          )}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    // backgroundColor: "rgba(0,0,0,0.5)",
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
    width: width > 600 ? "35%" : "90%",
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
