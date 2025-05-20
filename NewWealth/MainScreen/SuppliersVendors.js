import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";

const { width } = Dimensions.get("window");

const SuppliersVendors = () => {
  const navigation = useNavigation();
  const [userType, setUserType] = useState("");
  const [agentType, setAgentType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const type = await AsyncStorage.getItem("userType");
        setUserType(type || "");

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

  const vendorTypes = [
    {
      id: 1,
      name: "Building Materials Suppliers",
      icon: "home",
      iconType: "ionicons",
      color: "white",
    },
    {
      id: 2,
      name: "Equipment and Tool Suppliers",
      icon: "tools",
      iconType: "material-community",
      color: "white",
    },
    {
      id: 3,
      name: "Plumbing and Electrical Suppliers",
      icon: "pipe",
      iconType: "material-community",
      color: "white",
    },
    {
      id: 4,
      name: "Paint and Finishing Suppliers",
      icon: "format-paint",
      iconType: "material",
      color: "white",
    },
    {
      id: 5,
      name: "HVAC Suppliers",
      icon: "air-conditioner",
      iconType: "material-community",
      color: "white",
    },
    {
      id: 6,
      name: "Landscaping Suppliers",
      icon: "tree",
      iconType: "font-awesome",
      color: "white",
    },
    {
      id: 7,
      name: "Prefabricated Construction Materials",
      icon: "cube",
      iconType: "font-awesome",
      color: "white",
    },
    {
      id: 8,
      name: "Waste Management and Disposal",
      icon: "delete",
      iconType: "material",
      color: "white",
    },
    {
      id: 9,
      name: "Logistics and Transport",
      icon: "truck",
      iconType: "material-community",
      color: "white",
    },
    {
      id: 10,
      name: "Architectural and Design Suppliers",
      icon: "architecture",
      iconType: "material",
      color: "white",
    },
  ];

  const handleVendorTypePress = (type) => {
    navigation.navigate("VendorList", { vendorType: type });
  };

  const handleAddSupplier = () => {
    navigation.navigate("AddSupplier");
  };

  const shouldShowAddButton = () => {
    return userType === "CoreMember" || agentType === "RegionalWealthAssociate";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  const renderIcon = (iconType, iconName, size, color) => {
    switch (iconType) {
      case "ionicons":
        return <Ionicons name={iconName} size={size} color={color} />;
      case "material":
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case "material-community":
        return (
          <MaterialCommunityIcons name={iconName} size={size} color={color} />
        );
      case "font-awesome":
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      default:
        return <MaterialIcons name={iconName} size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button in a Mini Box */}
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers & Vendors</Text>
        
      </View>

      <Text style={styles.subtitle}>
        Find all the services you need for your property
      </Text>
      <View style={{width:"50%",marginTop:-10,marginBottom:10}}>{shouldShowAddButton() && (
          <TouchableOpacity onPress={handleAddSupplier}>
            <View style={styles.addButtonBox}>
              <MaterialIcons name="add" size={18} color="#D81B60" />
              <Text style={styles.addButtonText}>Add Supplier</Text>
            </View>
          </TouchableOpacity>
        )}</View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.grid}>
          {vendorTypes.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              style={[styles.vendorCard, { backgroundColor: vendor.color }]}
              onPress={() => handleVendorTypePress(vendor.name)}
            >
              {renderIcon(vendor.iconType, vendor.icon, 30, "#D81B60")}
              <Text style={styles.vendorName}>{vendor.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 33,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButtonBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D81B60",
    gap: 6,
  },
  addButtonText: {
    color: "#D81B60",
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  vendorCard: {
    width: width * 0.45 - 20,
    height: 130,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  vendorName: {
    color: "black",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
});

export default SuppliersVendors;
