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
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import agentImage from "../../assets/man.png";

const { width } = Dimensions.get("window");

export default function ViewAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem("userType");
        const storedUserTypeValue = await AsyncStorage.getItem("userTypevalue");

        const currentUserType =
          storedUserTypeValue === "ValueAssociate"
            ? "ValueAssociate"
            : storedUserType || "";

        setUserType(currentUserType);

        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("Token not found in AsyncStorage");
          setLoading(false);
          return;
        }

        let endpoint = "";
        let body = null;
        let method = "GET";

        switch (currentUserType) {
          case "CoreMember":
            endpoint = `${API_URL}/core/myagents`;
            break;
          case "WealthAssociate":
          case "ReferralAssociate":
            endpoint = `${API_URL}/agent/myAgents`;
            break;
          case "ValueAssociate":
            const userDetails = await AsyncStorage.getItem("userDetails");
            if (userDetails) {
              const parsedDetails = JSON.parse(userDetails);
              if (parsedDetails.MyRefferalCode) {
                endpoint = `${API_URL}/agent/valueagents`;
                method = "POST";
                body = JSON.stringify({
                  referralCode: parsedDetails.MyRefferalCode,
                });
              }
            }
            break;
          default:
            setLoading(false);
            return;
        }

        const headers = {
          token: `${token}` || "",
        };

        if (method === "POST") {
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(endpoint, {
          method,
          headers,
          body,
        });

        const data = await response.json();

        if (
          data &&
          Array.isArray(data.referredAgents || data.valueAgents || data)
        ) {
          const agentsData = data.referredAgents || data.valueAgents || data;
          setAgents(agentsData);
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

  const handleAgentPress = (agent) => {
    if (userType !== "ValueAssociate") return;
    setSelectedAgent(agent);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          My Agents:{agents.length > 0 ? agents.length : "0"}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        ) : agents.length > 0 ? (
          <View style={styles.gridContainer}>
            {agents.map((agent) => (
              <TouchableOpacity
                key={agent._id}
                style={styles.card}
                onPress={() => handleAgentPress(agent)}
                activeOpacity={userType === "ValueAssociate" ? 0.6 : 1}
              >
                <Image
                  source={
                    typeof agent.photo === "string" && agent.photo.trim() !== ""
                      ? { uri: agent.photo }
                      : agentImage
                  }
                  style={styles.avatar}
                />

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
                {userType !== "ValueAssociate" && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAgent(agent._id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noAgentsText}>
            {userType === "CoreMember" ||
            userType === "WealthAssociate" ||
            userType === "ReferralAssociate" ||
            userType === "ValueAssociate"
              ? "No agents found."
              : "This feature is only available for Core Members and Associates."}
          </Text>
        )}
      </ScrollView>

      {/* Modal for Value Associate */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {selectedAgent?.FullName}'s Referral Stats
            </Text>

            {selectedAgent?.referralStats ? (
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Referred Agents:</Text>
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.referredAgents || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Referred Customers:</Text>
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.referredCustomers || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Added Investors:</Text>
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.addedInvestors || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Added Skilled:</Text>
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.addedSkilled || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Added NRIs:</Text>
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.addedNRIs || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Posted Properties:</Text>
                  9985626888
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.postedProperties || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Approved Properties:</Text>
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.approvedProperties || 0}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Last Updated:</Text>
                  <Text style={styles.statValue}>
                    {selectedAgent.referralStats.lastUpdated
                      ? new Date(
                          selectedAgent.referralStats.lastUpdated
                        ).toLocaleString()
                      : "N/A"}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noStatsText}>
                No referral stats available
              </Text>
            )}

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  statsContainer: {
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
  },
  noStatsText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
    color: "#666",
  },
});
