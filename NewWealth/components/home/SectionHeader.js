import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const SectionHeader = ({ title, onViewAll }) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  viewAllButton: {
    borderWidth: 1,
    borderColor: "#3E5C76",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    color: "#2B2D42",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default SectionHeader;
