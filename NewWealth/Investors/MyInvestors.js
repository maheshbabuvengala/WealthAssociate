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
import logo1 from "../../assets/man.png";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function ViewInvesters() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    const confirmDelete = async () => {
      if (Platform.OS === "web") {
        return window.confirm("Are you sure you want to delete this investor?");
      } else {
        return new Promise((resolve) => {
          Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this investor?",
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

  const handleInvestorPress = (investor) => {
    setSelectedInvestor(investor);
    setModalVisible(true);
  };

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

  const renderInvestorCards = () => {
    if (isWeb) {
      return (
        <View style={styles.webGrid}>
          {investors.map((investor) => (
            <InvestorCard 
              key={investor._id} 
              investor={investor} 
              onPress={handleInvestorPress}
              onDelete={handleDelete}
              userType={userType}
            />
          ))}
        </View>
      );
    } else {
      return investors.map((investor) => (
        <InvestorCard 
          key={investor._id} 
          investor={investor} 
          onPress={handleInvestorPress}
          onDelete={handleDelete}
          userType={userType}
        />
      ));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          {getHeaderTitle()}: {investors.length > 0 ? investors.length : "0"}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#3E5C76"
            style={styles.loader}
          />
        ) : investors.length > 0 ? (
          <View style={styles.gridContainer}>
            {renderInvestorCards()}
          </View>
        ) : (
          <Text style={styles.noInvestorsText}>
            No investors found.
          </Text>
        )}
      </ScrollView>

      {/* Modal for Investor Details */}
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
              {selectedInvestor?.FullName}'s Details
            </Text>

            {selectedInvestor && (
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Category:</Text>
                  <Text style={styles.statValue}>
                    {selectedInvestor.SelectSkill || "N/A"}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Mobile Number:</Text>
                  <Text style={styles.statValue}>
                    {selectedInvestor.MobileNumber || "N/A"}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Location:</Text>
                  <Text style={styles.statValue}>
                    {selectedInvestor.Location || "N/A"}
                  </Text>
                </View>
                {userType === "NRI" && (
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>NRI Details:</Text>
                    <Text style={styles.statValue}>
                      {selectedInvestor.NRIDetails || "N/A"}
                    </Text>
                  </View>
                )}
              </View>
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

// Separate InvestorCard component with improved design
const InvestorCard = ({ investor, onPress, onDelete, userType }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(investor)}
      activeOpacity={0.6}
    >
      <View style={styles.cardHeader}>
        <Image source={logo1} style={styles.avatar} />
        <Text style={styles.investorName}>{investor.FullName}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>{investor.SelectSkill}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile:</Text>
          <Text style={styles.infoValue}>{investor.MobileNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{investor.Location}</Text>
        </View>
        {userType === "NRI" && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NRI Details:</Text>
            <Text style={styles.infoValue}>{investor.NRIDetails || "N/A"}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(investor._id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.deleteButtonText}>Delete Investor</Text>
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
  loader: {
    marginTop: 40,
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
  investorName: {
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
  noInvestorsText: {
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
    flexDirection: "row",
    justifyContent: "center",
    width: "100%"
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
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