import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const AddSupplier = ({ navigation }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "Construction Materials",
    "Interior Design",
    "Architects",
    "Electricians",
    "Plumbers",
    "Carpenters",
    "Painters",
    "Landscapers",
    "Security Systems",
    "Cleaning Services",
  ];

  const handleSubmit = () => {
    // Save logic here (e.g., API call or state update)
    console.log({ name, phone, category: selectedCategory });
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Supplier</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Supplier Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., ABC Construction"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., +1234567890"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Working Category</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a category" value="" />
          {categories.map((category, index) => (
            <Picker.Item key={index} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Supplier</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#D81B60",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddSupplier;