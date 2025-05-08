import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const data = [
  {
    id: "1",
    title: "LEGAL",
    icon: "https://img.icons8.com/ios/100/scales.png",
  },
  {
    id: "2",
    title: "REVENUE",
    icon: "https://img.icons8.com/ios/100/rupee.png",
  },
  {
    id: "3",
    title: "ENGINEERS",
    icon: "https://img.icons8.com/ios/100/engineer.png",
  },
  {
    id: "4",
    title: "INTERIOR & ARCHITECTS",
    icon: "https://img.icons8.com/ios/100/blueprint.png",
  },
  {
    id: "5",
    title: "SURVEY & PLANNING",
    icon: "https://img.icons8.com/ios/100/survey.png",
  },
  {
    id: "6",
    title: "VAASTU PANDITS",
    icon: "https://img.icons8.com/ios/100/guru.png",
  },
  {
    id: "7",
    title: "LAND VALUERS",
    icon: "https://img.icons8.com/ios/100/marker.png",
  },
  {
    id: "8",
    title: "BANKING",
    icon: "https://img.icons8.com/ios/100/bank.png",
  },
  {
    id: "9",
    title: "AGRICULTURE",
    icon: "https://img.icons8.com/ios/100/farm.png",
  },
  {
    id: "10",
    title: "REGISTRATION &\nDOCUMENTATION",
    icon: "https://img.icons8.com/ios/100/contract.png",
  },
  {
    id: "11",
    title: "AUDITING",
    icon: "https://img.icons8.com/ios/100/paint-brush.png",
  },
  {
    id: "12",
    title: "LIAISONING",
    icon: "https://img.icons8.com/ios/100/handshake.png",
  },
];

const ExpertPanel = ({ onSwitch, userType }) => {
  const [isCoreMember, setIsCoreMember] = useState(false);
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 4 : width > 300 ? 3 : 2;
  const spacing = 8;
  const itemSize = (width - spacing * (numColumns + 1)) / numColumns;

  const navigation = useNavigation();

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem("userType");
        setIsCoreMember(storedUserType === "CoreMember");
      } catch (error) {
        console.error("Error reading userType from AsyncStorage:", error);
      }
    };

    checkUserType();
  }, []);

  const handleRequestExpert = () => {
    console.log("Attempting to navigate to requestexpert");
    try {
      navigation.navigate("requestexpert");
      console.log("Navigation successful");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        `Failed to open request screen: ${error.message}`
      );
    }
  };

  const handleAddExpert = () => {
    console.log("Attempting to navigate to addexpert");
    try {
      navigation.navigate("addexpert");
      console.log("Navigation successful");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        `Failed to open add expert screen: ${error.message}`
      );
    }
  };

  return (
    <ScrollView>
      <View style={styles.mainContainer}>
        <View style={{ display: "flex", flexDirection: "column" }}>
          <Text style={styles.header}>Expert Panel</Text>

          {/* Buttons Container */}
          <View style={styles.buttonContainer}>
            {/* Request Expert - Visible to all users */}
            <TouchableOpacity
              style={[styles.button, styles.requestButton]}
              onPress={handleRequestExpert}
            >
              <Text style={styles.buttonText}>Request Expert</Text>
            </TouchableOpacity>

            {/* Add Expert - Only for Core Members */}
            {isCoreMember && (
              <TouchableOpacity
                style={[styles.button, styles.addExpertButton]}
                onPress={handleAddExpert}
              >
                <Text style={styles.buttonText}>Add Expert</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Expert Categories Grid */}
        <View style={styles.listContainer}>
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, { width: itemSize }]}
              onPress={() => onSwitch(item.title)}
            >
              <View style={styles.iconContainer}>
                <Image source={{ uri: item.icon }} style={styles.icon} />
              </View>
              <Text style={styles.text}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 60,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    // marginBottom: 15,
    textAlign: "center",
    color: "#333",
    top: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    marginTop:10,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  requestButton: {
    backgroundColor: "#4CAF50", // Green color
  },
  addExpertButton: {
    backgroundColor: "#2196F3", // Blue color
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    marginBottom: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 5,
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
});

export default ExpertPanel;
