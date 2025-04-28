import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";
import logo1 from "../../assets/Main-Logo (1) 1.png";
import logo2 from "../../assets/Meenakshi-Icon-Blac (2) 1.png";
import logo3 from "../../assets/Surya Avenue Logo[1] 1.png";
import logo4 from "../../assets/Logo 1.png";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const coreProjects = [
  { name: "Bay Town", logo: logo1 },
  { name: "Icon", logo: logo2 },
  {
    name: "Surya Avenue",
    logo: logo3,
  },
  { name: "The Park Vue", logo: logo4 },
];

const Core_Projects = () => {
  const [coreProjects, setCoreProjectes] = useState([]);

  useEffect(() => {
    // Fetch data from the backend
    const fetchCoreClients = async () => {
      try {
        const response = await fetch(
          `${API_URL}/coreproject/getallcoreprojects`
        );
        const data = await response.json();
        setCoreProjectes(data);
      } catch (error) {
        console.error("Error fetching core clients:", error);
      }
    };

    fetchCoreClients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Core Projects</Text>
      <ScrollView
        contentContainerStyle={isWeb ? styles.webContainer : null}
        horizontal={isWeb}
      >
        <View style={styles.projectScroll}>
          {coreProjects.map((project, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: `${API_URL}${project.photo}` }}
                style={styles.logo}
                resizeMode="contain"
              />
              <View>
                <Text>{project.city}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Core_Projects;

const styles = StyleSheet.create({
  projectScroll: {
    marginVertical: 10,
    display: "flex",
    flexDirection: isWeb ? "row" : "column",
  },
  webContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    marginTop: Platform.OS === "web" ? "auto" : 40,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: isWeb ? 200 : 200, // Fixed width for horizontal scrolling
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginRight: 10, // Add margin between cards
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "column",
  },
  logo: { width: "80%", height: "80%" },
});
