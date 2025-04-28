import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Card, Title } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  const data = [
    { title: "Agents", value: "12,000", icon: "account" },
    { title: "Customers", value: "1,500", icon: "account-group" },
    { title: "Posted Properties", value: "125", icon: "office-building" },
    { title: "Expert Requests", value: "12,000", icon: "help-circle" },
  ];

  const handleLogout = () => {
    // Navigate to MainScreen
    navigation.navigate("Main Screen");
  };

  return (
    <View style={styles.container}>
      {/* Logout Button at Top Right */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#D42A5E" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Cards in Column Layout */}
      <View style={styles.column}>
        {data.map((item, index) => (
          <Card key={index} style={[styles.card, styles.cardShadow]}>
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Title style={styles.title}>{item.title}</Title>
                <Text style={styles.value}>{item.value}</Text>
              </View>
              <Icon name={item.icon} size={30} color="#D42A5E" />
            </View>
          </Card>
        ))}
      </View>

      {/* Version Text */}
      <Text style={styles.version}>Version: 1.0.0.0.2025</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    elevation: 2,
  },
  logoutText: {
    marginLeft: 5,
    color: "#D42A5E",
    fontWeight: "500",
  },
  column: {
    flex: 1,
  },
  card: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
  },
  cardShadow: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  version: {
    textAlign: "right",
    marginTop: 10,
    color: "#999",
    fontSize: 12,
  },
});

export default Dashboard;
