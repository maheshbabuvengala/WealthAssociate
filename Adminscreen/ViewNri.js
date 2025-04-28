import React, { useState, useEffect } from "react";
import { API_URL } from "../data/ApiUrl";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Alert,
  Platform,
  Modal,
  TextInput,
  Button,
  Dimensions,
} from "react-native";
const { width } = Dimensions.get("window");

const ViewNriCard = ({ viewNri, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <Image
        source={require("../Admin_Pan/assets/man.png")}
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedMobile, setEditedMobile] = useState("");
  const [editedOccupation, setEditedOccupation] = useState("");
  const [editedLocality, setEditedLocality] = useState("");
  const [editedCountry, setEditedCountry] = useState("");
  const { width } = useWindowDimensions();
  const isWebView = width > 600;

  useEffect(() => {
    fetch(`${API_URL}/nri/referred-members`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setNriMembers(data.referredMembers))
      .catch((error) => console.error("Error fetching NRI members:", error));
  }, []);

  const handleDelete = (id) => {
    if (Platform.OS === "web") {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this member?"
      );
      if (isConfirmed) {
        fetch(`${API_URL}/nri/deletenri/${id}`, {
          method: "DELETE",
        })
          .then(() => {
            setNriMembers(nriMembers.filter((member) => member._id !== id));
          })
          .catch((error) => console.error("Error deleting member:", error));
      }
    } else {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this member?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: () => {
              fetch(`${API_URL}/nri/deletenri/${id}`, {
                method: "DELETE",
              })
                .then(() => {
                  setNriMembers(
                    nriMembers.filter((member) => member._id !== id)
                  );
                })
                .catch((error) =>
                  console.error("Error deleting member:", error)
                );
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setEditedName(member.Name);
    setEditedMobile(member.MobileIN);
    setEditedOccupation(member.Occupation);
    setEditedLocality(member.Locality);
    setEditedCountry(member.Country);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    const updatedMember = {
      ...selectedMember,
      Name: editedName,
      MobileIN: editedMobile,
      Occupation: editedOccupation,
      Locality: editedLocality,
      Country: editedCountry,
    };

    fetch(`${API_URL}/nri/editnri/${selectedMember._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedMember),
    })
      .then(() => {
        setNriMembers(
          nriMembers.map((m) =>
            m._id === selectedMember._id ? updatedMember : m
          )
        );
        setIsModalVisible(false);
      })
      .catch((error) => console.error("Error updating member:", error));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={nriMembers}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <ViewNriCard
            viewNri={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={
          isWebView ? styles.webContainer : styles.listContainer
        }
        numColumns={isWebView ? 3 : 1}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Member</Text>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Name"
            />
            <TextInput
              style={styles.input}
              value={editedMobile}
              onChangeText={setEditedMobile}
              placeholder="Mobile"
            />
            <TextInput
              style={styles.input}
              value={editedOccupation}
              onChangeText={setEditedOccupation}
              placeholder="Occupation"
            />
            <TextInput
              style={styles.input}
              value={editedLocality}
              onChangeText={setEditedLocality}
              placeholder="Location"
            />
            <TextInput
              style={styles.input}
              value={editedCountry}
              onChangeText={setEditedCountry}
              placeholder="Country"
            />
            <View style={styles.modalButtonContainer}>
              <Button title="Save" onPress={handleSave} />
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width > 600 ? "50%" : "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default ViewNri;
