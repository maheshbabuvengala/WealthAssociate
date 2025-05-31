import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  FlatList,
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
import marblebased from "../../assets/marblebased.jpg";
import decorative from "../../assets/decorative.jpg";
import door from "../../assets/door.jpg";
import delivery from "../../assets/delivery.jpg";
import interior from "../../assets/interior.jpg";
import crane from "../../assets/crane.jpg";
import hazaradous from "../../assets/hazaradous.jpg";
import heavyequipment from "../../assets/heavyequipment.jpg";
import recycle from "../../assets/recycle.jpg";
import siteclean from "../../assets/siteclean.jpg";
import storage from "../../assets/storage.jpg";
import waste from "../../assets/waste.jpg";
import steel from "../../assets/steel.jpg";
import precast from "../../assets/precast.jpg";
import prefab from "../../assets/prefab.jpg";
import modular from "../../assets/modular.jpg";

const vendorSubcategories = {
  "Building Materials Suppliers": [
    {
      id: 1,
      name: "Sand and Aggregates",
      image:
        "https://images.pexels.com/photos/262367/pexels-photo-262367.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Construction-grade sand, gravel, crushed stone, and other aggregates",
    },
    {
      id: 2,
      name: "Cement and Concrete",
      image:
        "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Various types of cement, ready-mix concrete, and concrete additives",
    },
    {
      id: 3,
      name: "Structural Steel",
      image:
        "https://images.pexels.com/photos/2760289/pexels-photo-2760289.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Beams, columns, rebars, and other structural steel components",
    },
    {
      id: 4,
      name: "Bricks and Blocks",
      image:
        "https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Clay bricks, concrete blocks, AAC blocks, and other masonry units",
    },
    {
      id: 5,
      name: "Timber and Wood Products",
      image:
        "https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Lumber, plywood, veneers, and engineered wood products",
    },
  ],
  "Equipment and Tool Suppliers": [
    {
      id: 1,
      name: "Heavy Machinery",
      image:
        "https://images.pexels.com/photos/2058911/pexels-photo-2058911.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Excavators, bulldozers, cranes, and other heavy construction equipment",
    },
    {
      id: 2,
      name: "Power Tools",
      image:
        "https://images.pexels.com/photos/6647217/pexels-photo-6647217.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Drills, saws, grinders, and other power tools for construction",
    },
    {
      id: 3,
      name: "Hand Tools",
      image:
        "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Hammers, wrenches, screwdrivers, and other hand tools",
    },
    {
      id: 4,
      name: "Measuring and Layout Tools",
      image:
        "https://images.pexels.com/photos/834892/pexels-photo-834892.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Levels, tape measures, laser measuring devices, and surveying equipment",
    },
  ],
  "Plumbing and Electrical Suppliers": [
    {
      id: 1,
      name: "Pipes and Fittings",
      image:
        "https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "PVC, CPVC, copper, and other plumbing pipes and fittings",
    },
    {
      id: 2,
      name: "Electrical Wiring",
      image:
        "https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Cables, wires, and conductors for electrical installations",
    },
    {
      id: 3,
      name: "Switches and Outlets",
      image:
        "https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Electrical switches, outlets, and other control devices",
    },
    {
      id: 4,
      name: "Sanitary Fixtures",
      image:
        "https://images.pexels.com/photos/7935651/pexels-photo-7935651.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Toilets, sinks, faucets, and other bathroom fixtures",
    },
  ],
  "Paint and Finishing Suppliers": [
    {
      id: 1,
      name: "Interior Paint",
      image:
        "https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Wall paints, primers, and interior finishes",
    },
    {
      id: 2,
      name: "Exterior Paint",
      image:
        "https://images.pexels.com/photos/186078/pexels-photo-186078.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Weather-resistant paints and coatings for exterior surfaces",
    },
    {
      id: 3,
      name: "Varnishes and Wood Finishes",
      image:
        "https://images.pexels.com/photos/279444/pexels-photo-279444.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Stains, varnishes, and protective coatings for wood",
    },
    {
      id: 4,
      name: "Painting Tools",
      image:
        "https://images.pexels.com/photos/8092505/pexels-photo-8092505.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Brushes, rollers, sprayers, and other painting equipment",
    },
  ],
  "HVAC Suppliers": [
    {
      id: 1,
      name: "Air Conditioners",
      image:
        "https://images.pexels.com/photos/4393549/pexels-photo-4393549.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Split ACs, window ACs, and central air conditioning systems",
    },
    {
      id: 2,
      name: "Heating Systems",
      image:
        "https://images.pexels.com/photos/9806250/pexels-photo-9806250.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Furnaces, boilers, and other heating equipment",
    },
    {
      id: 3,
      name: "Ventilation Equipment",
      image:
        "https://images.pexels.com/photos/6368836/pexels-photo-6368836.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Fans, blowers, and air handling units",
    },
    {
      id: 4,
      name: "Ductwork and Vents",
      image:
        "https://images.pexels.com/photos/10299440/pexels-photo-10299440.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Ducts, vents, grilles, and diffusers for HVAC systems",
    },
  ],
  "Landscaping Suppliers": [
    {
      id: 1,
      name: "Plants and Trees",
      image:
        "https://images.pexels.com/photos/1028599/pexels-photo-1028599.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Ornamental plants, trees, shrubs, and ground covers",
    },
    {
      id: 2,
      name: "Soil and Mulch",
      image:
        "https://images.pexels.com/photos/5748798/pexels-photo-5748798.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Topsoil, potting soil, compost, and mulch",
    },
    {
      id: 3,
      name: "Irrigation Systems",
      image:
        "https://images.pexels.com/photos/2566940/pexels-photo-2566940.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Sprinklers, drip irrigation, and water management systems",
    },
    {
      id: 4,
      name: "Outdoor Hardscaping",
      image:
        "https://images.pexels.com/photos/11754348/pexels-photo-11754348.jpeg?auto=compress&cs=tinysrgb&w=600",
      description:
        "Pavers, stones, retaining walls, and other hardscape materials",
    },
  ],
  "Prefabricated Construction Materials": [
    {
      id: 1,
      name: "Prefab Wall Panels",
      image: prefab,
      description: "Factory-made wall panels and partitions",
    },
    {
      id: 2,
      name: "Modular Units",
      image: modular,
      description: "Prefabricated modular building units and components",
    },
    {
      id: 3,
      name: "Precast Concrete",
      image: precast,
      description:
        "Precast concrete elements like beams, slabs, and staircases",
    },
    {
      id: 4,
      name: "Steel Structures",
      image: steel,
      description: "Pre-engineered steel buildings and components",
    },
  ],
  "Waste Management and Disposal": [
    {
      id: 1,
      name: "Waste Containers",
      image: waste,
      description: "Dumpsters, bins, and containers for construction waste",
    },
    {
      id: 2,
      name: "Recycling Services",
      image: recycle,
      description: "Construction material recycling and recovery services",
    },
    {
      id: 3,
      name: "Hazardous Waste Handling",
      image: hazaradous,
      description: "Safe disposal of hazardous construction materials",
    },
    {
      id: 4,
      name: "Site Cleanup",
      image: siteclean,
      description: "Post-construction cleanup and waste removal services",
    },
  ],
  "Logistics and Transport": [
    {
      id: 1,
      name: "Material Delivery",
      image: delivery,
      description: "Transportation and delivery of construction materials",
    },
    {
      id: 2,
      name: "Heavy Equipment Transport",
      image: heavyequipment,
      description: "Moving and transporting heavy construction equipment",
    },
    {
      id: 3,
      name: "On-Site Storage",
      image:storage,
      description: "Temporary storage solutions for construction sites",
    },
    {
      id: 4,
      name: "Crane and Lifting Services",
      image: crane,
      description: "Crane rental and lifting services for construction",
    },
  ],
  "Architectural and Design Suppliers": [
    {
      id: 1,
      name: "Flooring Materials",
      image: marblebased,
      description: "Tiles, hardwood, laminates, and other flooring options",
    },
    {
      id: 2,
      name: "Windows and Doors",
      image: door,
      description: "Custom windows, doors, and related architectural elements",
    },
    {
      id: 3,
      name: "Interior Fixtures",
      image: interior,
      description:
        "Light fixtures, ceiling details, and interior design elements",
    },
    {
      id: 4,
      name: "Decorative Materials",
      image:decorative,
      description:
        "Wallpapers, decorative panels, and interior finishing materials",
    },
  ],
};

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

  const handleSubcategoryPress = (category, subcategory) => {
    navigation.navigate("VendorList", {
      vendorType: category,
      subcategory: subcategory.name,
    });
  };

  const handleAddSupplier = () => {
    navigation.navigate("AddSupplier");
  };

  const shouldShowAddButton = () => {
    return userType === "CoreMember" || agentType === "RegionalWealthAssociate";
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers & Vendors</Text>
        {shouldShowAddButton() && (
          <TouchableOpacity onPress={handleAddSupplier}>
            <View style={styles.addButtonBox}>
              <MaterialIcons name="add" size={18} color="#D81B60" />
              <Text style={styles.addButtonText}>Add Supplier</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>
        Find all the services you need for your property
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {vendorTypes.map((vendor) => (
          <View key={vendor.id} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              {renderIcon(vendor.iconType, vendor.icon, 24, "#D81B60")}
              <Text style={styles.categoryTitle}>{vendor.name}</Text>
            </View>

            <FlatList
              data={vendorSubcategories[vendor.name] || []}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcategoryList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.subcategoryCard}
                  onPress={() => handleSubcategoryPress(vendor.name, item)}
                >
                  <Image
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                    style={styles.subcategoryImage}
                    resizeMode="cover"
                  />
                  <View style={styles.subcategoryTextContainer}>
                    <Text style={styles.subcategoryName}>{item.name}</Text>
                    <Text
                      style={styles.subcategoryDescription}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
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
    marginBottom: 10,
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
    paddingBottom: 30,
  },
  categoryContainer: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  subcategoryList: {
    paddingLeft: 5,
    paddingTop: 10,
    paddingBottom: 10,
  },
  subcategoryCard: {
    width: 160,
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // paddingTop:10
  },
  subcategoryImage: {
    width: "100%",
    height: 100,
  },
  subcategoryTextContainer: {
    padding: 10,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subcategoryDescription: {
    fontSize: 12,
    color: "#666",
  },
});

export default SuppliersVendors;
