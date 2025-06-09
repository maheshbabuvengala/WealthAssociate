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
import avatar from "../../Admin_Pan/assets/man.png";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function ViewNri({ navigation }) {
  const [nriMembers, setNriMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const storedUserType = await AsyncStorage.getItem("userType") || "";

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleMemberPress = (member) => {
    setSelectedMember(member);
    setModalVisible(true);
  };

  const renderMemberCards = () => {
    if (isWeb) {
      return (
        <View style={styles.webGrid}>
          {nriMembers.map((member) => (
            <MemberCard 
              key={member._id} 
              member={member} 
              onPress={handleMemberPress}
              onDelete={confirmDelete}
              deletingId={deletingId}
            />
          ))}
        </View>
      );
    } else {
      return nriMembers.map((member) => (
        <MemberCard 
          key={member._id} 
          member={member} 
          onPress={handleMemberPress}
          onDelete={confirmDelete}
          deletingId={deletingId}
        />
      ));
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3E5C76" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchNriMembers();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          NRI Members: {nriMembers.length > 0 ? nriMembers.length : "0"}
        </Text>

        {nriMembers.length > 0 ? (
          <View style={styles.gridContainer}>
            {renderMemberCards()}
          </View>
        ) : (
          <Text style={styles.noMembersText}>
            No NRI members found.
          </Text>
        )}
      </ScrollView>

      {/* Modal for Member Details */}
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
            {selectedMember && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedMember.Name}'s Details
                </Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Mobile (IN):</Text>
                    <Text style={styles.statValue}>
                      {selectedMember.MobileIN || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Mobile (Country):</Text>
                    <Text style={styles.statValue}>
                      {selectedMember.MobileCountryNo || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Occupation:</Text>
                    <Text style={styles.statValue}>
                      {selectedMember.Occupation || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Location:</Text>
                    <Text style={styles.statValue}>
                      {selectedMember.Locality || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Country:</Text>
                    <Text style={styles.statValue}>
                      {selectedMember.Country || "N/A"}
                    </Text>
                  </View>
                </View>
              </>
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

// Separate MemberCard component
const MemberCard = ({ member, onPress, onDelete, deletingId }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(member)}
      activeOpacity={0.6}
    >
      <View style={styles.cardHeader}>
        <Image source={avatar} style={styles.avatar} />
        <Text style={styles.memberName}>{member.Name || "N/A"}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile (IN):</Text>
          <Text style={styles.infoValue}>{member.MobileIN || "N/A"}</Text>
        </View>
        {member.MobileCountryNo && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile (Country):</Text>
            <Text style={styles.infoValue}>{member.MobileCountryNo}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Occupation:</Text>
          <Text style={styles.infoValue}>{member.Occupation || "N/A"}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(member._id, member.Name)}
        disabled={deletingId === member._id}
      >
        {deletingId === member._id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete Member</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 30,
  },
  scrollContainer: {
    width: "100%",
    paddingHorizontal: isWeb ? 20 : 10,
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
    backgroundColor: "#3E5C76",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3E5C76",
    marginVertical: 20,
    marginLeft: isWeb ? 10 : 0,
  },
  gridContainer: {
    width: "100%",
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: isWeb ? -10 : 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: isWeb ? "31%" : "93%",
    margin: isWeb ? 10 : 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#f0f0f0",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3E5C76",
  },
  infoContainer: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  noMembersText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6c757d",
    width: "100%",
  },
  deleteButton: {
    marginTop: 15,
    backgroundColor: "#e63946",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: "center",
    width: "100%"
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
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
    color: "#3E5C76",
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: "#3E5C76",
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
    color: "#495057",
  },
  statValue: {
    fontSize: 16,
    color: "#3E5C76",
  },
});