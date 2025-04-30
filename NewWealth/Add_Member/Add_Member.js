import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Dimensions,
  width,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../../data/ApiUrl";
import UpperNavigation from "../MainScreen/Uppernavigation";
import BottomNavigation from "../MainScreen/BottomNavigation";

import Add_Agent from "../Myagents/Myagents";
import MyCustomersScreen from "../Mycustomers/MyCustomers";
import SkilledResourceScreen from "../SkilledResource/SkilledResource";
import MyInvestorsScreen from "../Investors/MyInvestors";
import MyNRIsScreen from "../Nris/Nris";
import { useNavigation } from "@react-navigation/native";

import Regicus from "./Regicus";
import AddNri from "./AddNri";
import AddInvestor from "./AddInvestors";
import Rskill from "./Rskill";

export default function Add_Member() {
  const navigation = useNavigation();
  const [userType, setUserType] = useState("");
  const [agentType, setAgentType] = useState("");
  const [loading, setLoading] = useState(true);
  // const [modalVisible, setModalVisible] = useState(false);
  // const [subModalVisible, setSubModalVisible] = useState(false);

  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [nriModalVisible, setNriModalVisible] = useState(false);
  const [skilledModalVisible, setSkilledModalVisible] = useState(false);
  const [investorModalVisible, setInvestorModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    // Default to "My Agents" for WealthAssociate and CoreMember
    if (["WealthAssociate", "CoreMember"].includes(userType)) {
      return "My Agents";
    }
    // For other user types, default to "My Customers"
    return "My Customers";
  });
  const [data, setData] = useState([]);

  const tabsScrollRef = useRef(null);
  const actionButtonsScrollRef = useRef(null);
  const { width } = Dimensions.get("window");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const type = await AsyncStorage.getItem("userType");
        setUserType(type || "");

        // Set active tab based on user type
        if (["Customer", "Investor", "NRI", "SkilledResource"].includes(type)) {
          setActiveTab("My Customers");
        } else if (["WealthAssociate", "CoreMember"].includes(type)) {
          setActiveTab("My Agents");
        }

        if (type === "WealthAssociate" || type === "ReferralAssociate") {
          const token = await AsyncStorage.getItem("authToken");
          const response = await fetch(`${API_URL}/agent/AgentDetails`, {
            headers: { token: token || "" },
          });
          const data = await response.json();
          setAgentType(data?.AgentType || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      let endpoint = "";

      switch (userType) {
        case "WealthAssociate":
          endpoint = `${API_URL}/agent/AgentDetails`;
          break;
        case "Customer":
          endpoint = `${API_URL}/customer/getcustomer`;
          break;
        case "CoreMember":
          endpoint = `${API_URL}/core/getcore`;
          break;
        case "ReferralAssociate":
          endpoint = `${API_URL}/agent/AgentDetails`;
          break;
        case "Investor":
          endpoint = `${API_URL}/investors/getinvestor`;
          break;
        case "NRI":
          endpoint = `${API_URL}/nri/getnri`;
          break;
        case "SkilledResource":
          endpoint = `${API_URL}/skillLabour/getskilled`;
          break;
        default:
          endpoint = `${API_URL}/agent/AgentDetails`;
      }

      const response = await fetch(endpoint, {
        headers: { token: token || "" },
      });
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (userType) {
      fetchData();
    }
  }, [userType, activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      let scrollInterval;
      let timer1, timer2, actionTimer1, actionTimer2;

      const animateScroll = () => {
        if (tabsScrollRef.current) {
          tabsScrollRef.current.scrollTo({ x: 0, animated: false });

          timer1 = setTimeout(() => {
            tabsScrollRef.current.scrollTo({
              x: width * 0.7,
              animated: true,
              duration: 600,
            });

            timer2 = setTimeout(() => {
              tabsScrollRef.current.scrollTo({
                x: 0,
                animated: true,
                duration: 800,
              });
            }, 800);
          }, 300);
        }
      };

      const animateActionButtonsScroll = () => {
        if (actionButtonsScrollRef.current) {
          actionButtonsScrollRef.current.scrollTo({ x: 0, animated: false });

          actionTimer1 = setTimeout(() => {
            actionButtonsScrollRef.current.scrollTo({
              x: width * 0.7,
              animated: true,
              duration: 600,
            });

            actionTimer2 = setTimeout(() => {
              actionButtonsScrollRef.current.scrollTo({
                x: 0,
                animated: true,
                duration: 800,
              });
            }, 800);
          }, 300);
        }
      };

      // Start immediately
      animateScroll();
      animateActionButtonsScroll();

      // Then repeat every 10 seconds
      scrollInterval = setInterval(() => {
        animateScroll();
        animateActionButtonsScroll();
      }, 5000); // 10 seconds

      return () => {
        clearInterval(scrollInterval);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(actionTimer1);
        clearTimeout(actionTimer2);
      };
    }, [width])
  );

  const getVisibleTabs = () => {
    const tabs = [
      { id: "My Customers", label: "My Customers" },
      { id: "Skilled Resource", label: "Skilled Resource" },
      { id: "My Investors", label: "My Investors" },
      { id: "My NRIs", label: "My NRIs" },
    ];

    if (userType === "WealthAssociate" || userType === "CoreMember") {
      tabs.unshift({ id: "My Agents", label: "My Agents" });
    }

    return tabs;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e63946" />
      </View>
    );
  }

  const showAddButton = [
    "WealthAssociate",
    "ReferralAssociate",
    "CoreMember",
  ].includes(userType);
  const isCoreMember = userType === "CoreMember";
  const isRegionalWealthAssociate = agentType === "RegionalWealthAssociate";

  const renderAddAssociateButton = () => {
    if (!showAddButton) return null;

    let buttonText = "Add Associate";
    if (userType === "WealthAssociate" || userType === "ReferralAssociate") {
      buttonText = isRegionalWealthAssociate
        ? "Add Associate"
        : "Add \nWealth Associate";
    }

    return (
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          if (isCoreMember || isRegionalWealthAssociate) {
            setModalVisible(true);
          } else {
            console.log("Add Wealth Associate");
          }
        }}
      >
        <View style={styles.circleIcon}>
          <MaterialIcons name="person-add-alt-1" size={28} color="white" />
        </View>
        <Text style={styles.actionText}>{buttonText}</Text>
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "My Agents":
        return <Add_Agent data={data} />;
      case "My Customers":
        return <MyCustomersScreen data={data} />;
      case "Skilled Resource":
        return <SkilledResourceScreen data={data} />;
      case "My Investors":
        return <MyInvestorsScreen data={data} />;
      case "My NRIs":
        return <MyNRIsScreen data={data} />;
      default:
        return <MyAgentsScreen data={data} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* <UpperNavigation /> */}

      <ScrollView
        ref={actionButtonsScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.actionButtonsContainer}
        contentContainerStyle={styles.actionButtonsContentContainer}
      >
        <View style={styles.actionButtons}>
          {renderAddAssociateButton()}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setCustomerModalVisible(true)}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="person-add" size={28} color="white" />
            </View>
            <Text style={styles.actionText}>Add Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setNriModalVisible(true)}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="globe-outline" size={28} color="white" />
            </View>
            <Text style={styles.actionText}>Add NRI Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSkilledModalVisible(true)}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="trophy-outline" size={28} color="white" />
            </View>
            <Text style={styles.actionText}>Register Skilled Resources</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setInvestorModalVisible(true)}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="business-outline" size={28} color="white" />
            </View>
            <Text style={styles.actionText}>Add Investor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView
        ref={tabsScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContentContainer}
      >
        <View style={styles.tabs}>
          {getVisibleTabs().map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {renderTabContent()}

      {/* <BottomNavigation/> */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                setSubModalVisible(true);
              }}
            >
              <View style={styles.modalButtonContent}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="person-add" size={24} color="white" />
                </View>
                <Text style={styles.modalButtonText}>
                  {isCoreMember
                    ? "Add Regional Wealth Associate"
                    : "Add Executive Wealth Associate"}
                </Text>
              </View>
            </TouchableOpacity>
            {isCoreMember && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  setSubModalVisible(true);
                }}
              >
                <View style={styles.modalButtonContent}>
                  <View style={styles.modalIconCircle}>
                    <Ionicons name="person-add" size={24} color="white" />
                  </View>
                  <Text style={styles.modalButtonText}>
                    Add value Wealth Associate
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                console.log("Add Wealth Associate");
              }}
            >
              <View style={styles.modalButtonContent}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="person-add" size={24} color="white" />
                </View>
                <Text style={styles.modalButtonText}>Add Wealth Associate</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={subModalVisible}
        onRequestClose={() => setSubModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: 25 }]}>
            <Text style={styles.modalTitle}>
              {isCoreMember
                ? "Regional Wealth Associate"
                : "Executive Wealth Associate"}
            </Text>

            <TouchableOpacity
              style={[styles.modalCancelButton, { marginTop: 20 }]}
              onPress={() => setSubModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={customerModalVisible}
        onRequestClose={() => setCustomerModalVisible(false)}
      >
        <Regicus
          closeModal={() => setCustomerModalVisible(false)}
          onSuccess={() => {
            setCustomerModalVisible(false);
            fetchData(); // Refresh data after successful addition
          }}
        />
      </Modal>

      {/* Add NRI Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={nriModalVisible}
        onRequestClose={() => setNriModalVisible(false)}
      >
        <AddNri
          closeModal={() => setNriModalVisible(false)}
          onSuccess={() => {
            setNriModalVisible(false);
            fetchData(); // Refresh data after successful addition
          }}
        />
      </Modal>

      {/* Add Skilled Resource Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={skilledModalVisible}
        onRequestClose={() => setSkilledModalVisible(false)}
      >
        <Rskill
          closeModal={() => setSkilledModalVisible(false)}
          onSuccess={() => {
            setSkilledModalVisible(false);
            fetchData(); // Refresh data after successful addition
          }}
        />
      </Modal>

      {/* Add Investor Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={investorModalVisible}
        onRequestClose={() => setInvestorModalVisible(false)}
      >
        <AddInvestor
          closeModal={() => setInvestorModalVisible(false)}
          onSuccess={() => {
            setInvestorModalVisible(false);
            fetchData(); // Refresh data after successful addition
          }}
        />
      </Modal>

      {/* Keep your existing modals for Add Associate */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* ... (your existing modal content) */}
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={subModalVisible}
        onRequestClose={() => setSubModalVisible(false)}
      ></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonsContainer: {
    maxHeight: 100,
  },
  actionButtonsContentContainer: {
    paddingHorizontal: 5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    marginBottom: 5,
    elevation: 2,
  },
  actionButton: {
    alignItems: "center",
    width: width * 0.45,
    minWidth: 120,
    paddingHorizontal: 5,
  },
  circleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e63946",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
    paddingHorizontal: 2,
  },
  tabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    maxHeight: 50,
  },
  tabsContentContainer: {
    paddingHorizontal: 5,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginHorizontal: 2,
  },
  activeTab: {},
  tabText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#e63946",
    fontWeight: "600",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 15,
    right: 15,
    height: 3,
    backgroundColor: "#e63946",
    borderRadius: 2,
  },
  agentList: {
    flex: 1,
    padding: 10,
  },
  agentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  agentSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 14,
    color: "#555",
    marginLeft: 15,
  },
  subSection: {
    marginLeft: 15,
  },
  subSectionTitle: {
    fontSize: 14,
    color: "#777",
  },
  subSectionContent: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
  deleteText: {
    color: "#e63946",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "relative",
  },
  navItem: {
    alignItems: "center",
    padding: 10,
    width: "25%",
  },
  navText: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
    marginTop: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e63946",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalCancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: "#e63946",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
});
