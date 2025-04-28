import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  CheckBox,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../data/ApiUrl";

const PlotInfoForm = ({ closeModal, propertyId, initialData }) => {
  const [formData, setFormData] = useState({
    plotLocation: "",
    area: "",
    plotLength: "",
    plotBreadth: "",
    direction: "",
    approvalStatus: "",
    kidsPlayArea: "",
    waterTap: "",
    undergroundDrainage: "",
    security: "",
    compoundWall: "",
    undergroundElectricity: "",
    readyToConstruction: "",
    clubHouse: "",
    swimmingPool: "",
    gymArea: "",
    yogaArea: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        plotLocation: initialData.plotLocation || "",
        area: initialData.area || "",
        plotLength: initialData.plotLength || "",
        plotBreadth: initialData.plotBreadth || "",
        direction: initialData.direction || "",
        approvalStatus: initialData.approvalStatus || "",
        kidsPlayArea: initialData.kidsPlayArea || "",
        waterTap: initialData.waterTap || "",
        undergroundDrainage: initialData.undergroundDrainage || "",
        security: initialData.security || "",
        compoundWall: initialData.compoundWall || "",
        undergroundElectricity: initialData.undergroundElectricity || "",
        readyToConstruction: initialData.readyToConstruction || "",
        clubHouse: initialData.clubHouse || "",
        swimmingPool: initialData.swimmingPool || "",
        gymArea: initialData.gymArea || "",
        yogaArea: initialData.yogaArea || "",
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCheckboxChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!propertyId) {
      Alert.alert("Error", "Property ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/properties/${propertyId}/dynamic`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save plot details");
      }

      Alert.alert("Success", "Plot details saved successfully!");
      closeModal(true);
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", error.message || "Failed to save plot details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Plot Information</Text>
      <Text style={styles.propertyId}>Property ID: {propertyId}</Text>

      <Text style={styles.label}>Plot Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Plot Location"
        value={formData.plotLocation}
        onChangeText={(value) => handleInputChange("plotLocation", value)}
      />

      <Text style={styles.label}>Plot Area (sq. ft)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Plot Area"
        keyboardType="numeric"
        value={formData.area}
        onChangeText={(value) => handleInputChange("area", value)}
      />

      <Text style={styles.label}>Length (ft)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Length"
        keyboardType="numeric"
        value={formData.plotLength}
        onChangeText={(value) => handleInputChange("plotLength", value)}
      />

      <Text style={styles.label}>Breadth (ft)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Breadth"
        keyboardType="numeric"
        value={formData.plotBreadth}
        onChangeText={(value) => handleInputChange("plotBreadth", value)}
      />

      <Text style={styles.label}>Facing Direction</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Facing Direction"
        value={formData.direction}
        onChangeText={(value) => handleInputChange("direction", value)}
      />

      <Text style={styles.label}>Approval Status</Text>
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={formData.approvalStatus === "NonApproved"}
          onValueChange={() =>
            handleCheckboxChange("approvalStatus", "NonApproved")
          }
        />
        <Text style={styles.label}>Non Approved</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={formData.approvalStatus === "Approved"}
          onValueChange={() =>
            handleCheckboxChange("approvalStatus", "Approved")
          }
        />
        <Text style={styles.label}>Approved</Text>
      </View>

      <Text style={styles.sectionHeading}>Amenities</Text>
      {[
        { field: "kidsPlayArea", label: "Kids Play Area" },
        { field: "waterTap", label: "Water Tap" },
        { field: "undergroundDrainage", label: "Underground Drainage" },
        { field: "security", label: "Security" },
        { field: "compoundWall", label: "Compound Wall" },
        { field: "undergroundElectricity", label: "Underground Electricity" },
        { field: "readyToConstruction", label: "Ready to Construction" },
        { field: "clubHouse", label: "Club House" },
        { field: "swimmingPool", label: "Swimming Pool" },
        { field: "gymArea", label: "Gym Area" },
        { field: "yogaArea", label: "Yoga Area" },
      ].map(({ field, label }) => (
        <View key={field} style={styles.checkgroup}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.check}>
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={formData[field] === "Yes"}
                onValueChange={() => handleCheckboxChange(field, "Yes")}
              />
              <Text style={styles.label}>YES</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={formData[field] === "No"}
                onValueChange={() => handleCheckboxChange(field, "No")}
              />
              <Text style={styles.label}>NO</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.buttoncontainer}>
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button1, isSubmitting && styles.disabledButton]}
          onPress={() => closeModal(false)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 400,
    backgroundColor: "#E3F2FD",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
  },
  propertyId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#0D47A1",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  check: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  checkgroup: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0D47A1",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "40%",
  },
  button1: {
    backgroundColor: "#DC3545",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "40%",
  },
  buttoncontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PlotInfoForm;
