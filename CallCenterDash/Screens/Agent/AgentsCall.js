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
import { MaterialIcons } from "@expo/vector-icons"; // For tick icon

export default function ViewAgentsCall() {
  const [agents, setAgents] = useState([]); // All agents from API
  const [contactedAgents, setContactedAgents] = useState([]); // Contacted agents
  const [loading, setLoading] = useState(true);

  // Fetch agents from API on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("Token not found in AsyncStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/customer/getcustomer`, {
          method: "GET",
          headers: { token: token },
        });

        const data = await response.json();
        if (data && Array.isArray(data.referredAgents)) {
          setAgents(data.referredAgents);
          // Load contacted agents from storage
          const savedContacted = await AsyncStorage.getItem("contactedAgents");
          setContactedAgents(savedContacted ? JSON.parse(savedContacted) : []);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Move agent to "Contacted" list
  const markAsContacted = async (agent) => {
    // Update state
    setAgents((prev) => prev.filter((a) => a._id !== agent._id));
    const updatedContacted = [...contactedAgents, agent];
    setContactedAgents(updatedContacted);

    // Save to AsyncStorage
    await AsyncStorage.setItem("contactedAgents", JSON.stringify(updatedContacted));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Agents to Contact</Text>

        {loading ? (
          <Text style={styles.message}>Loading...</Text>
        ) : agents.length > 0 ? (
          agents.map((agent) => (
            <View key={agent._id} style={styles.agentCard}>
              <Image
                source={require("../../assets/man.png")}
                style={styles.agentImage}
              />
              <View style={styles.agentDetails}>
                <Text style={styles.agentText}>{agent.FullName}</Text>
                <Text style={styles.agentText}>
                  Constituency: {agent.Contituency}
                </Text>
                <Text style={styles.agentText}>
                  Referral Code: {agent.MyRefferalCode}
                </Text>
              </View>
              <TouchableOpacity onPress={() => markAsContacted(agent)}>
                <MaterialIcons name="check-circle" size={28} color="green" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.message}>No new agents to contact.</Text>
        )}

        <Text style={styles.heading}>Already Contacted Agents</Text>

        {contactedAgents.length > 0 ? (
          contactedAgents.map((agent) => (
            <View key={agent._id} style={[styles.agentCard, styles.contactedCard]}>
              <Image
                source={require("../../assets/man.png")}
                style={styles.agentImage}
              />
              <View style={styles.agentDetails}>
                <Text style={styles.agentText}>{agent.FullName}</Text>
                <Text style={styles.agentText}>
                  Constituency: {agent.Contituency}
                </Text>
                <Text style={styles.agentText}>
                  Referral Code: {agent.MyRefferalCode}
                </Text>
              </View>
              <MaterialIcons name="check-circle" size={28} color="gray" />
            </View>
          ))
        ) : (
          <Text style={styles.message}>No contacted agents yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    width: "90%",
    textAlign: "left",
    marginBottom: 10,
    marginTop: 20,
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
  contactedCard: {
    backgroundColor: "#e6e6e6",
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
