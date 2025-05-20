import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const SkilledResources = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  const skilledCategories = [
    {
      id: 1,
      name: "Drilling & Boring",
      icon: "toolbox",
      iconLibrary: "MaterialCommunityIcons",
      category: "Heavy Equipment",
    },
    {
      id: 2,
      name: "Masons",
      icon: "construction",
      iconLibrary: "MaterialIcons",
      category: "Construction",
    },
    {
      id: 3,
      name: "Carpenters",
      icon: "hammer",
      iconLibrary: "MaterialCommunityIcons",
      category: "Woodwork",
    },
    {
      id: 5,
      name: "Concrete Workers",
      icon: "domain",
      iconLibrary: "MaterialIcons",
      category: "Construction",
    },
    {
      id: 6,
      name: "Scaffolders",
      icon: "layers",
      iconLibrary: "MaterialIcons",
      category: "Safety",
    },
    {
      id: 7,
      name: "Plasterers",
      icon: "wall",
      iconLibrary: "MaterialCommunityIcons",
      category: "Finishing",
    },
    {
      id: 8,
      name: "Tilers",
      icon: "grid",
      iconLibrary: "MaterialCommunityIcons",
      category: "Flooring",
    },
    {
      id: 9,
      name: "Painters",
      icon: "format-paint",
      iconLibrary: "MaterialIcons",
      category: "Finishing",
    },
    {
      id: 10,
      name: "Roofers",
      icon: "roofing",
      iconLibrary: "MaterialIcons",
      category: "Construction",
    },
    {
      id: 11,
      name: "Welders",
      icon: "wrench",
      iconLibrary: "FontAwesome",
      category: "Metalwork",
    },
    {
      id: 12,
      name: "Electricians",
      icon: "flash",
      iconLibrary: "Ionicons",
      category: "Electrical",
    },
    {
      id: 13,
      name: "Plumbers",
      icon: "water-pump",
      iconLibrary: "MaterialCommunityIcons",
      category: "Plumbing",
    },
    {
      id: 14,
      name: "HVAC Techs",
      icon: "snowflake",
      iconLibrary: "FontAwesome",
      category: "Mechanical",
    },
    {
      id: 16,
      name: "Waterproofing",
      icon: "water",
      iconLibrary: "Ionicons",
      category: "Finishing",
    },
    {
      id: 17,
      name: "Insulators",
      icon: "coolant-temperature",
      iconLibrary: "MaterialCommunityIcons",
      category: "Finishing",
    },
    {
      id: 18,
      name: "Glaziers",
      icon: "window-closed",
      iconLibrary: "MaterialCommunityIcons",
      category: "Glasswork",
    },
    {
      id: 19,
      name: "Granite Workers",
      icon: "texture",
      iconLibrary: "MaterialCommunityIcons",
      category: "Stonework",
    },
    {
      id: 20,
      name: "False Ceiling",
      icon: "ceiling-light",
      iconLibrary: "MaterialCommunityIcons",
      category: "Interior",
    },
    {
      id: 21,
      name: "Drywall Installers",
      icon: "wall",
      iconLibrary: "MaterialCommunityIcons",
      category: "Interior",
    },
    {
      id: 22,
      name: "Surveyors",
      icon: "map-marker-distance",
      iconLibrary: "MaterialCommunityIcons",
      category: "Planning",
    },
    {
      id: 24,
      name: "Road Marking",
      icon: "road-variant",
      iconLibrary: "MaterialCommunityIcons",
      category: "Civil",
    },
    {
      id: 25,
      name: "Pipe Layers",
      icon: "pipe",
      iconLibrary: "MaterialCommunityIcons",
      category: "Plumbing",
    },
    {
      id: 26,
      name: "Cable Pullers",
      icon: "cable-data",
      iconLibrary: "MaterialCommunityIcons",
      category: "Electrical",
    },
    {
      id: 27,
      name: "Drainage Workers",
      icon: "water-outline",
      iconLibrary: "Ionicons",
      category: "Civil",
    },
    {
      id: 28,
      name: "Concrete Finishers",
      icon: "tape-measure",
      iconLibrary: "MaterialCommunityIcons",
      category: "Construction",
    },
    {
      id: 29,
      name: "Tunnel Workers",
      icon: "tunnel",
      iconLibrary: "MaterialCommunityIcons",
      category: "Heavy Construction",
    },
    {
      id: 30,
      name: "Fabricators",
      icon: "factory",
      iconLibrary: "MaterialCommunityIcons",
      category: "Metalwork",
    },
    {
      id: 31,
      name: "Solar Installers",
      icon: "solar-power",
      iconLibrary: "MaterialCommunityIcons",
      category: "Electrical",
    },
  ];

  const filteredCategories = skilledCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryPress = (category) => {
    navigation.navigate("SkilledWorkersList", {
      categoryName: category.name,
      categoryType: category.category,
    });
  };

  const handleAddSkilledUser = () => {
    navigation.navigate("regiskill");
  };

  const renderIcon = (iconLibrary, iconName) => {
    switch (iconLibrary) {
      case "MaterialIcons":
        return <MaterialIcons name={iconName} size={28} color="#D81B60" />;
      case "MaterialCommunityIcons":
        return (
          <MaterialCommunityIcons name={iconName} size={28} color="#D81B60" />
        );
      case "FontAwesome":
        return <FontAwesome name={iconName} size={28} color="#D81B60" />;
      case "Ionicons":
        return <Ionicons name={iconName} size={28} color="#D81B60" />;
      default:
        return <MaterialIcons name="help" size={28} color="#D81B60" />;
    }
  };

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.iconContainer}>
        {renderIcon(item.iconLibrary, item.icon)}
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryType}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Skilled Resources</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddSkilledUser}
          >
            <Text style={styles.addButtonText}>Add Skilled User</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Find specialized workers for your project
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#D81B60"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search skilled workers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#D81B60" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="exclamation-triangle" size={40} color="#ccc" />
            <Text style={styles.emptyText}>
              No matching skilled workers found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    paddingBottom: "20%",
  },
  header: {
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addButton: {
    backgroundColor: "#D81B60",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#34495e",
    height: 40,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    backgroundColor: "#f8e1e7",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#95a5a6",
    marginTop: 10,
  },
});

export default SkilledResources;
