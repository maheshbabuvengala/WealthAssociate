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
  FlatList,
  LogBox,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import avatar from "../../Admin_Pan/assets/man.png";

// Ignore specific warnings (optional)
LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

const { width } = Dimensions.get("window");

export default function ViewNri({ navigation }) {
  const [nriMembers, setNriMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [userType, setUserType] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        await fetchNriMembers();
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error("Component error:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchNriMembers = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const storedUserType = (await AsyncStorage.getItem("userType")) || "";

      if (!token) {
        throw new Error("Authentication token not found");
      }

      setUserType(storedUserType);

      const response = await fetch(`${API_URL}/nri/getmynris`, {
        method: "GET",
        headers: {
          token: `${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch NRI members");
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.referredMembers)) {
        throw new Error("Invalid data format received");
      }

      setNriMembers(data.referredMembers);
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setNriMembers([]);
      Alert.alert("Error", error.message || "Failed to load NRI members");
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/nri/deletenri/${id}`, {
        method: "DELETE",
        headers: {
          token: `${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete member");
      }

      // Success case
      setNriMembers((prev) => prev.filter((member) => member._id !== id));
      Alert.alert("Success", "Member deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", error.message || "Failed to delete member");
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

  const renderMemberCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={avatar} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>: {item.Name || "N/A"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Mobile (IN)</Text>
          <Text style={styles.value}>: {item.MobileIN || "N/A"}</Text>
        </View>

        {item.MobileCountryNo && (
          <View style={styles.row}>
            <Text style={styles.label}>Mobile (Country)</Text>
            <Text style={styles.value}>: {item.MobileCountryNo}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>: {item.Occupation || "N/A"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>: {item.Locality || "N/A"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Country</Text>
          <Text style={styles.value}>: {item.Country || "N/A"}</Text>
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNriMembers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>
        NRI Members: {nriMembers.length > 0 ? nriMembers.length : "0"}
      </Text>

      <FlatList
        data={nriMembers}
        renderItem={renderMemberCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No NRI members found.</Text>
        }
        numColumns={width > 600 ? 2 : 1}
        columnWrapperStyle={width > 600 ? styles.rowWrapper : null}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    alignItems: "center",
  },
  rowWrapper: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width > 600 ? "48%" : "95%",
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
    width: 120,
  },
  value: {
    flexShrink: 1,
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
