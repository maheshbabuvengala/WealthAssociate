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
import agentImage from "../../assets/man.png";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ViewAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem("userType");
        setUserType(storedUserType || "");

        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("Token not found in AsyncStorage");
          setLoading(false);
          return;
        }

        let endpoint = "";
        switch (storedUserType) {
          case "CoreMember":
            endpoint = `${API_URL}/core/myagents`;
            break;
          case "WealthAssociate":
          case "ReferralAssociate":
            endpoint = `${API_URL}/agent/myAgents`;
            break;
          default:
            setLoading(false);
            return;
        }

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            token: `${token}` || "",
          },
        });

        const data = await response.json();

        if (data && Array.isArray(data.referredAgents)) {
          setAgents(data.referredAgents);
        } else {
          setAgents([]);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteAgent = async (agentId) => {
    const confirmDelete = async () => {
      if (Platform.OS === "web") {
        return window.confirm("Are you sure you want to delete this agent?");
      } else {
        return new Promise((resolve) => {
          Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this agent?",
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

      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("Token not found in AsyncStorage");
        return;
      }

      const response = await fetch(`${API_URL}/agent/deleteagent/${agentId}`, {
        method: "DELETE",
        headers: {
          token: `${token}` || "",
        },
      });

      if (!response.ok) throw new Error("Failed to delete agent");

      setAgents((prevAgents) =>
        prevAgents.filter((agent) => agent._id !== agentId)
      );
      Alert.alert("Success", "Agent deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete agent");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>My Agents</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        ) : agents.length > 0 ? (
          <View style={styles.gridContainer}>
            {agents.map((agent) => (
              <View key={agent._id} style={styles.card}>
                <Image source={agentImage} style={styles.avatar} />
                <View style={styles.infoContainer}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>: {agent.FullName}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>District</Text>
                    <Text style={styles.value}>: {agent.District}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Constituency</Text>
                    <Text style={styles.value}>: {agent.Contituency}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Referral Code</Text>
                    <Text style={styles.value}>: {agent.MyRefferalCode}</Text>
                  </View>
                  {agent.MobileNumber && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Mobile Number</Text>
                      <Text style={styles.value}>: {agent.MobileNumber}</Text>
                    </View>
                  )}
                  {agent.Locations && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Location</Text>
                      <Text style={styles.value}>: {agent.Locations}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAgent(agent._id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noAgentsText}>
            {userType === "CoreMember" ||
            userType === "WealthAssociate" ||
            userType === "ReferralAssociate"
              ? "No agents found."
              : "This feature is only available for Core Members and Associates."}
          </Text>
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
    paddingBottom: 30,
  },
  scrollContainer: {
    width: "100%",
  },
  loader: {
    marginTop: 40,
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
  noAgentsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    width: "100%",
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
