import React, { useState, useEffect } from "react";
import { API_URL } from "../../../data/ApiUrl";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ViewNriCard = ({ viewNri, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <Image
        source={require("../../../Admin_Pan/assets/man.png")}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{viewNri.Name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Mobile:</Text>
          <Text style={styles.value}>{viewNri.MobileIN}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Occupation:</Text>
          <Text style={styles.value}>{viewNri.Occupation}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{viewNri.Locality}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{viewNri.Country}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(viewNri)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(viewNri._id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ViewNri = () => {
  const [nriMembers, setNriMembers] = useState([]);
  const { width } = useWindowDimensions();
  const isWebView = width > 600;

  const getNriMembers = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }
      const response = await fetch(`${API_URL}/nri/getmynris`, {
        method: "GET",
        headers: {
          token,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setNriMembers(data.referredMembers || []);
    } catch (error) {
      console.error("Error fetching NRI members:", error);
    }
  };

  useEffect(() => {
    getNriMembers();
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await fetch(`${API_URL}/nri/referred-members/${id}`, {
                method: "DELETE",
              });
              setNriMembers((prevMembers) =>
                prevMembers.filter((member) => member._id !== id)
              );
            } catch (error) {
              console.error("Error deleting member:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEdit = (member) => {
    Alert.alert("Edit", `Edit feature for ${member.Name} coming soon!`);
  };

  return (
    <View style={isWebView ? styles.webContainer : styles.listContainer}>
      {nriMembers.map((item) => (
        <ViewNriCard
          key={item._id.toString()}
          viewNri={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 20,
  },
  webContainer: {
    justifyContent: "center",
    paddingVertical: 90,
    marginLeft: 100,
    gap: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 10,
    width: 280,
    height: 320,
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 10,
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  deleteButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ViewNri;
