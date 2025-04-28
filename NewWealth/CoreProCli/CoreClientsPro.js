import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import CoreClients from "./CoreClients";
import CoreProjects from "./CoreProjects";

const ClientsAndProjectsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Clients</Text>
        <CoreClients />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Projects</Text>
        <CoreProjects />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default ClientsAndProjectsScreen;
