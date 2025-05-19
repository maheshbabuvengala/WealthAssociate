import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SkilledWorkersList = ({ route }) => {
  const { categoryName, categoryType } = route.params;
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // This would be replaced with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockWorkers = [
        {
          id: 1,
          name: `Professional ${categoryName}`,
          rating: 4.7,
          experience: "5+ years",
          image: require("../../../WealthAssociate/assets/agent-icon.png"),
          skills: ["Precision work", "Safety certified", "Equipment expert"],
        },
        {
          id: 2,
          name: `Expert ${categoryName}`,
          rating: 4.5,
          experience: "8+ years",
          image: require("../../../WealthAssociate/assets/agent-icon.png"),
          skills: ["Quality craftsmanship", "Team leader", "Fast worker"],
        },
        {
          id: 3,
          name: `Senior ${categoryName}`,
          rating: 4.9,
          experience: "10+ years",
          image: require("../../../WealthAssociate/assets/agent-icon.png"),
          skills: ["Complex projects", "Mentor", "Detail-oriented"],
        },
      ];
      setWorkers(mockWorkers);
      setLoading(false);
    }, 800);
  }, [categoryName]);

  const renderWorkerItem = ({ item }) => (
    <TouchableOpacity style={styles.workerItem}>
      <Image source={item.image} style={styles.workerImage} />
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.experienceText}> • {item.experience}</Text>
        </View>
        <View style={styles.skillsContainer}>
          {item.skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{categoryName}</Text>
      <Text style={styles.subHeader}>{categoryType} specialists</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2c3e50" />
          <Text style={styles.loadingText}>Finding skilled workers...</Text>
        </View>
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorkerItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No workers available in this category</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  workerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#34495e",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 5,
    color: "#2c3e50",
    fontWeight: "500",
  },
  experienceText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    backgroundColor: "#ecf0f1",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  skillText: {
    fontSize: 12,
    color: "#2c3e50",
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#95a5a6",
    fontSize: 16,
  },
});

export default SkilledWorkersList;