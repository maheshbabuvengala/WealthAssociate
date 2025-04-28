import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import logo1 from "../../assets/man.png";

const { width } = Dimensions.get("window");

export default function ViewExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw error;
    }
  };

  const fetchExperts = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/expert/getallexpert`, {
        headers: {
          token: `${token}` || "",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch experts");

      const expertsData = await response.json();

      const sortedExperts = expertsData.data.sort((a, b) => {
        if (a.CallExecutiveCall === "Done" && b.CallExecutiveCall !== "Done")
          return 1;
        if (a.CallExecutiveCall !== "Done" && b.CallExecutiveCall === "Done")
          return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setExperts(sortedExperts);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", error.message || "Failed to load experts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExperts();
    const interval = setInterval(fetchExperts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setExperts((prevExperts) => [...prevExperts]); // Trigger re-render
    } else {
      setExperts((prevExperts) => {
        return prevExperts.filter(
          (expert) =>
            (expert.name &&
              expert.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (expert.mobile && expert.mobile.includes(searchQuery)) ||
            (expert.expertType &&
              expert.expertType
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        );
      });
    }
  }, [searchQuery]);

  const handleRefresh = async () => {
    await fetchExperts();
  };

  const handleMarkAsDone = async (expertId) => {
    const confirm = () => {
      if (Platform.OS === "web") {
        return window.confirm(
          "Are you sure you want to mark this expert as done?"
        );
      } else {
        return new Promise((resolve) => {
          Alert.alert("Confirm", "Mark this expert as done?", [
            { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
            { text: "Confirm", onPress: () => resolve(true) },
          ]);
        });
      }
    };

    if (!(await confirm())) return;

    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/expert/markasdone/${expertId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to update status");

      const result = await response.json();

      setExperts((prevExperts) => {
        const updated = prevExperts.map((expert) =>
          expert._id === expertId
            ? { ...expert, CallExecutiveCall: "Done" }
            : expert
        );
        return updated.sort((a, b) => {
          if (a.CallExecutiveCall === "Done" && b.CallExecutiveCall !== "Done")
            return 1;
          if (a.CallExecutiveCall !== "Done" && b.CallExecutiveCall === "Done")
            return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });

      Alert.alert("Success", "Expert marked as done");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update expert status");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          Platform.OS !== "web" ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0000ff"]}
            />
          ) : undefined
        }
      >
        <Text style={styles.heading}>My Assigned Experts</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, mobile or expert type"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading experts...</Text>
          </View>
        ) : experts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.noExpertsText}>
              {searchQuery
                ? "No matching experts found"
                : "No experts assigned to you"}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            {experts.map((expert) => (
              <View
                key={expert._id}
                style={[
                  styles.card,
                  expert.CallExecutiveCall === "Done"
                    ? styles.doneCard
                    : styles.pendingCard,
                ]}
              >
                <Image
                  source={
                    expert.photo ? { uri: `${API_URL}${expert.photo}` } : logo1
                  }
                  style={styles.avatar}
                />
                <View style={styles.infoContainer}>
                  {expert.name && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Name</Text>
                      <Text style={styles.value}>: {expert.name}</Text>
                    </View>
                  )}
                  {expert.expertType && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Expert Type</Text>
                      <Text style={styles.value}>: {expert.expertType}</Text>
                    </View>
                  )}
                  {/* {expert.qualification && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Qualification</Text>
                      <Text style={styles.value}>: {expert.qualification}</Text>
                    </View>
                  )}
                  {expert.experience && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Experience</Text>
                      <Text style={styles.value}>: {expert.experience}</Text>
                    </View>
                  )} */}
                  {expert.location && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Location</Text>
                      <Text style={styles.value}>: {expert.location}</Text>
                    </View>
                  )}
                  {expert.mobile && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Mobile</Text>
                      <Text style={styles.value}>: {expert.mobile}</Text>
                    </View>
                  )}
                  {/* {expert.officeAddress && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Office Address</Text>
                      <Text style={styles.value}>: {expert.officeAddress}</Text>
                    </View>
                  )} */}
                  <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <Text
                      style={[
                        styles.value,
                        expert.CallExecutiveCall === "Done"
                          ? styles.doneStatus
                          : styles.pendingStatus,
                      ]}
                    >
                      :{" "}
                      {expert.CallExecutiveCall === "Done" ? "Done" : "Pending"}
                    </Text>
                  </View>

                  {expert.expertType === "Legal" && (
                    <>
                      {expert.specialization && (
                        <View style={styles.row}>
                          <Text style={styles.label}>Specialization</Text>
                          <Text style={styles.value}>
                            : {expert.specialization}
                          </Text>
                        </View>
                      )}
                      {expert.barCouncilId && (
                        <View style={styles.row}>
                          <Text style={styles.label}>Bar Council ID</Text>
                          <Text style={styles.value}>
                            : {expert.barCouncilId}
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {expert.expertType === "Revenue" && (
                    <>
                      {expert.landTypeExpertise && (
                        <View style={styles.row}>
                          <Text style={styles.label}>Land Expertise</Text>
                          <Text style={styles.value}>
                            : {expert.landTypeExpertise}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
                <View style={styles.buttonContainer}>
                  {expert.CallExecutiveCall !== "Done" && (
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={() => handleMarkAsDone(expert._id)}
                    >
                      <Text style={styles.buttonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
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
    marginBottom: "20%",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 15,
    paddingLeft: 10,
    color: "#333",
  },
  searchContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noExpertsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  refreshButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width > 600 ? "30%" : "100%",
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
  doneCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  pendingCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#F44336",
    backgroundColor: "#FFEBEE",
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
    color: "#555",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  doneStatus: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  pendingStatus: {
    color: "#F44336",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
