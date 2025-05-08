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
import avatar from "../../Admin_Pan/assets/man.png";

const { width } = Dimensions.get("window");

export default function ViewNri() {
  const [nriMembers, setNriMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    fetchNriMembers();
  }, []);

  const fetchNriMembers = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const storedUserType = await AsyncStorage.getItem("userType");

      if (!token) {
        console.error("No token found in AsyncStorage");
        setLoading(false);
        return;
      }

      setUserType(storedUserType || "");

      const response = await fetch(`${API_URL}/nri/getmynris`, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNriMembers(data.referredMembers || []);
      } else {
        setNriMembers([]);
      }
    } catch (error) {
      console.error("Error fetching NRI members:", error);
    } finally {
      setLoading(false);
    }
  };


  // const handleDelete = (id) => {
  //   if (Platform.OS === "web") {
  //     const isConfirmed = window.confirm(
  //       "Are you sure you want to delete this member?"
  //     );
  //     if (isConfirmed) {
  //       fetch(`${API_URL}/nri/deletenri/${id}`, {
  //         method: "DELETE",
  //       })
  //         .then(() => {
  //           setNriMembers(nriMembers.filter((member) => member._id !== id));
  //         })
  //         .catch((error) => console.error("Error deleting member:", error));
  //     }
  //   } else {
  //     Alert.alert(
  //       "Confirm Delete",
  //       "Are you sure you want to delete this member?",
  //       [
  //         { text: "Cancel", style: "cancel" },
  //         {
  //           text: "Delete",
  //           onPress: () => {
  //             fetch(`${API_URL}/nri/deletenri/${id}`, {
  //               method: "DELETE",
  //             })
  //               .then(() => {
  //                 setNriMembers(
  //                   nriMembers.filter((member) => member._id !== id)
  //                 );
  //               })
  //               .catch((error) =>
  //                 console.error("Error deleting member:", error)
  //               );
  //           },
  //           style: "destructive",
  //         },
  //       ]
  //     );
  //   }
  // };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      const response = await fetch(`${API_URL}/nri/deletenri/${id}`, {
        method: "DELETE",
      });

      // First check if the response is OK (status 200-299)
      if (response.ok) {
        // Try to parse as JSON only if content-type is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setNriMembers(nriMembers.filter((member) => member._id !== id));
          Alert.alert(
            "Success",
            data.message || "NRI member deleted successfully"
          );
        } else {
          // Handle non-JSON response (though DELETE should typically return empty body)
          setNriMembers(nriMembers.filter((member) => member._id !== id));
          Alert.alert("Success", "NRI member deleted successfully");
        }
      } else {
        // Handle non-OK responses
        const errorText = await response.text();
        try {
          // Try to parse error as JSON if possible
          const errorData = JSON.parse(errorText);
          Alert.alert(
            "Error",
            errorData.message ||
              `Failed to delete NRI member (Status: ${response.status})`
          );
        } catch (e) {
          // If not JSON, show the raw error text
          Alert.alert(
            "Error",
            errorText ||
              `Failed to delete NRI member (Status: ${response.status})`
          );
        }
      }
    } catch (error) {
      console.error("Error deleting NRI member:", error);
      Alert.alert("Error", "An error occurred while deleting NRI member");
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

  const renderMemberCard = (item) => (
    <View key={item._id} style={styles.card}>
      <Image source={avatar} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>: {item.Name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Mobile (IN)</Text>
          <Text style={styles.value}>: {item.MobileIN}</Text>
        </View>

        {item.MobileCountryNo && (
          <View style={styles.row}>
            <Text style={styles.label}>Mobile (Country)</Text>
            <Text style={styles.value}>: {item.MobileCountryNo}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>: {item.Occupation}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>: {item.Locality}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Country</Text>
          <Text style={styles.value}>: {item.Country}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item._id, item.Name)}
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>NRI Members</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {nriMembers.length > 0 ? (
            <View style={width > 600 ? styles.rowWrapper : null}>
              {nriMembers.map(renderMemberCard)}
            </View>
          ) : (
            <Text style={styles.emptyText}>No NRI members found.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
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
    width: width > 600 ? "35%" : "10`0%",
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
    width: 120, // Fixed width for labels
  },
  value: {
    flexShrink: 1, // Prevents text from expanding card
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
