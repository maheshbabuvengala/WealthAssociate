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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../data/ApiUrl";

const { width } = Dimensions.get("window");

export default function ViewAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("Token not found in AsyncStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/core/myagents`, {
          method: "GET",
          headers: {
            token: `${token}` || "", // Fallback to an empty string if token is null
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

    fetchAgents();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>My Agents</Text>

        {loading ? (
          <Text style={styles.message}>Loading...</Text>
        ) : agents.length > 0 ? (
          agents.map((agent) => (
            <View key={agent._id} style={styles.agentCard}>
              <Image
                source={require("../../../assets/man.png")}
                style={styles.agentImage}
              />
              <View style={styles.agentDetails}>
                <Text style={styles.agentText}>{agent.FullName}</Text>
                <Text style={styles.agentText}>
                  Parliament Constituency: {agent.District}
                </Text>
                <Text style={styles.agentText}>
                  Assembly Constituency: {agent.Contituency}
                </Text>
                <Text style={styles.agentText}>
                  Referral Code: {agent.MyRefferalCode}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.message}>No agents found.</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    width: "90%",
    textAlign: "left",
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? "10%" : 0,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 1000,
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  agentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  agentDetails: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: Platform.OS === "android" ? "column" : "row",
  },
  agentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
});
