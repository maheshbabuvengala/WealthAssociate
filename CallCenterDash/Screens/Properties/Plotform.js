import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../../data/ApiUrl";

const PlotInfoForm = ({ closeModal, propertyId, initialData }) => {
  const [formData, setFormData] = useState({
    plotLocation: "",
    lpNumber: "",
    ventureName: "",
    plotNumber: "",
    area: "",
    plotLength: "",
    plotBreadth: "",
    direction: "",
    approvalStatus: "",
    bankLoanFacility: "",
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        plotLocation: initialData.plotLocation || "",
        lpNumber: initialData.lpNumber || "",
        ventureName: initialData.ventureName || "",
        plotNumber: initialData.plotNumber || "",
        area: initialData.area || "",
        plotLength: initialData.plotLength || "",
        plotBreadth: initialData.plotBreadth || "",
        direction: initialData.direction || "",
        approvalStatus: initialData.approvalStatus || "",
        bankLoanFacility: initialData.bankLoanFacility || "",
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

  const handleToggleChange = (field, value) => {
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

  // Custom Toggle Component
  const CustomToggle = ({ field, value, options }) => {
    return (
      <View style={styles.toggleContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.toggleOption,
              value === option.value && styles.toggleOptionSelected,
            ]}
            onPress={() => handleToggleChange(field, option.value)}
          >
            <Text
              style={[
                styles.toggleText,
                value === option.value && styles.toggleTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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

      <Text style={styles.label}>LP Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter LP Number"
        value={formData.lpNumber}
        onChangeText={(value) => handleInputChange("lpNumber", value)}
      />

      <Text style={styles.label}>Venture Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Venture Name"
        value={formData.ventureName}
        onChangeText={(value) => handleInputChange("ventureName", value)}
      />

      <Text style={styles.label}>Plot Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Plot Number"
        value={formData.plotNumber}
        onChangeText={(value) => handleInputChange("plotNumber", value)}
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
      <CustomToggle
        field="approvalStatus"
        value={formData.approvalStatus}
        options={[
          { value: "NonApproved", label: "Non Approved" },
          { value: "Approved", label: "Approved" },
        ]}
      />

      <Text style={styles.label}>Bank Loan Facility</Text>
      <CustomToggle
        field="bankLoanFacility"
        value={formData.bankLoanFacility}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
      />

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
        <View key={field} style={styles.amenityContainer}>
          <Text style={styles.label}>{label}</Text>
          <CustomToggle
            field={field}
            value={formData[field]}
            options={[
              { value: "Yes", label: "YES" },
              { value: "No", label: "NO" },
            ]}
          />
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
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#E3F2FD",
    alignSelf: "center",
    borderRadius: 10,
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleOption: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  toggleOptionSelected: {
    backgroundColor: "#0D47A1",
  },
  toggleText: {
    color: "#333",
    fontWeight: "bold",
  },
  toggleTextSelected: {
    color: "#fff",
  },
  amenityContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
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
