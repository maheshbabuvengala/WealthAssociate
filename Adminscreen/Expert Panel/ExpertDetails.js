import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import logo1 from "../../assets/man.png";

const ExpertDetails = ({ expertType, onSwitch }) => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [Details, setDetails] = useState({});
  const [PostedBy, setPostedBy] = useState("");

  useEffect(() => {
    if (!expertType) return;

    fetch(`${API_URL}/expert/getexpert/${expertType}`)
      .then((response) => response.json())
      .then((data) => {
        setExperts(data.experts || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to fetch experts. Please try again later.");
        setLoading(false);
      });
  }, [expertType]);

  const getDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/agent/AgentDetails`, {
        method: "GET",
        headers: {
          token: `${token}` || "",
        },
      });

      const newDetails = await response.json();
      setPostedBy(newDetails.MobileNumber);
      setDetails(newDetails);
    } catch (error) {
      console.error("Error fetching agent details:", error);
    }
  };

  const requestExpert = async (expert) => {
    try {
      const response = await fetch(`${API_URL}/requestexpert/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: Details.FullName ? Details.FullName : "name",
          MobileNumber: Details.MobileNumber
            ? Details.MobileNumber
            : "MobileNumber",
          ExpertType: expertType,
          ExpertName: expert.name,
          ExpertNo: expert.mobile,
          RequestedBy: "WealthAssociate",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        if (Platform.OS === "web") {
          window.alert("Expert Requested Successfully");
        } else {
          Alert.alert("Expert Requested");
        }
      } else {
        Alert.alert(
          "Request Failed",
          result.message || "Something went wrong."
        );
      }
    } catch (error) {
      console.error("Request error:", error);
      Alert.alert(
        "Network error",
        "Please check your internet connection and try again."
      );
    }
  };

  const renderField = (label, value) => {
    if (!value) return null;
    return (
      <Text style={styles.expertDetails}>
        <Text style={styles.label}>{label}: </Text>
        {value}
      </Text>
    );
  };

  const renderExpertSpecificFields = (expert) => {
    switch (expertType) {
      case "LEGAL":
        return (
          <>
            {renderField("Specialization", expert.specialization)}
            {renderField("Bar Council ID", expert.barCouncilId)}
            {renderField("Court Affiliation", expert.courtAffiliation)}
            {renderField("Law Firm/Organisation", expert.lawFirmOrganisation)}
          </>
        );
      case "REVENUE":
        return (
          <>
            {renderField("Land Type Expertise", expert.landTypeExpertise)}
            {renderField(
              "Revenue Specialisation",
              expert.revenueSpecialisation
            )}
            {renderField("Government Approval", expert.govtApproval)}
            {renderField(
              "Certification License Number",
              expert.certificationLicenseNumber
            )}
            {renderField("Revenue Organisation", expert.revenueOrganisation)}
            {renderField("Key Services Provided", expert.keyServicesProvided)}
          </>
        );
      case "ENGINEERS":
        return (
          <>
            {renderField("Engineering Field", expert.engineeringField)}
            {renderField("Certifications", expert.certifications)}
            {renderField("Projects Handled", expert.projectsHandled)}
            {renderField("Engineer Organisation", expert.engineerOrganisation)}
            {renderField(
              "Specialized Skills/Technologies",
              expert.specializedSkillsTechnologies
            )}
            {renderField(
              "Major Projects Worked On",
              expert.majorProjectsWorkedOn
            )}
            {renderField("Government Licensed", expert.govtLicensed)}
          </>
        );
      case "ARCHITECTS":
        return (
          <>
            {renderField("Architecture Type", expert.architectureType)}
            {renderField("Software Used", expert.softwareUsed)}
            {renderField(
              "Architect License Number",
              expert.architectLicenseNumber
            )}
            {renderField("Architect Firm", expert.architectFirm)}
            {renderField("Major Projects", expert.architectMajorProjects)}
          </>
        );
      case "PLANS & APPROVALS":
        return (
          <>
            {renderField("Approval Type", expert.approvalType)}
            {renderField("Government Department", expert.govtDepartment)}
            {renderField("Processing Time", expert.processingTime)}
            {renderField("Approval Organisation", expert.approvalOrganisation)}
            {renderField("Services Provided", expert.servicesProvided)}
          </>
        );
      case "VAASTU PANDITS":
        return (
          <>
            {renderField("Vaastu Specialization", expert.vaastuSpecialization)}
            {renderField("Vaastu Organisation", expert.vaastuOrganisation)}
            {renderField("Vaastu Certifications", expert.vaastuCertifications)}
            {renderField("Remedies Provided", expert.remediesProvided)}
            {renderField("Consultation Mode", expert.consultationMode)}
          </>
        );
      case "LAND SURVEY & VALUERS":
        return (
          <>
            {renderField("Survey Type", expert.surveyType)}
            {renderField("Valuation Type", expert.valuationType)}
            {renderField("Government Approved", expert.govtApproved)}
            {renderField("Survey License Number", expert.surveyLicenseNumber)}
            {renderField("Valuer License Number", expert.valuerLicenseNumber)}
            {renderField("Survey Organisation", expert.surveyOrganisation)}
            {renderField("Valuer Organisation", expert.valuerOrganisation)}
          </>
        );
      case "BANKING":
        return (
          <>
            {renderField(
              "Banking Specialisation",
              expert.bankingSpecialisation
            )}
            {renderField("Banking Service", expert.bankingService)}
            {renderField("Registered With", expert.registeredWith)}
            {renderField("Bank Name", expert.bankName)}
            {renderField("Government Approved", expert.bankingGovtApproved)}
          </>
        );
      case "AGRICULTURE":
        return (
          <>
            {renderField("Agriculture Type", expert.agricultureType)}
            {renderField(
              "Agriculture Certifications",
              expert.agricultureCertifications
            )}
            {renderField(
              "Agriculture Organisation",
              expert.agricultureOrganisation
            )}
            {renderField("Services Provided", expert.servicesProvided)}
            {renderField("Types of Crops", expert.typesOfCrops)}
          </>
        );
      case "REGISTRATION & DOCUMENTATION":
        return (
          <>
            {renderField(
              "Registration Specialisation",
              expert.registrationSpecialisation
            )}
            {renderField("Document Type", expert.documentType)}
            {renderField("Processing Time", expert.processingTime)}
            {renderField(
              "Government Certified",
              expert.registrationGovtCertified
            )}
            {renderField("Additional Services", expert.additionalServices)}
          </>
        );
      case "AUDITING":
        return (
          <>
            {renderField(
              "Auditing Specialisation",
              expert.auditingSpecialisation
            )}
            {renderField("Audit Type", expert.auditType)}
            {renderField(
              "Audit Certification Number",
              expert.auditCertificationNumber
            )}
            {renderField("Audit Organisation", expert.auditOrganisation)}
            {renderField("Audit Services", expert.auditServices)}
            {renderField("Government Certified", expert.auditGovtCertified)}
          </>
        );
      case "LIAISONING":
        return (
          <>
            {renderField(
              "Liaisoning Specialisations",
              expert.liaisoningSpecialisations
            )}
            {renderField("Government Departments", expert.govtDepartments)}
            {renderField(
              "Liaisoning Organisation",
              expert.liaisoningOrganisation
            )}
            {renderField("Services Provided", expert.servicesProvided)}
            {renderField("Processing Time", expert.processingTime)}
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onSwitch(null)}>
        <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>{expertType} Experts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : experts.length > 0 ? (
        <ScrollView contentContainerStyle={styles.cardContainer}>
          {experts.map((expert) => (
            <View key={expert._id} style={styles.expertCard}>
              <Image
                source={
                  expert.photo ? { uri: `${API_URL}${expert.photo}` } : logo1
                }
                style={styles.profileImage}
              />

              <Text style={styles.expertName}>{expert.name}</Text>

              {/* Basic Information */}
              <View style={styles.detailsContainer}>
                {renderField("Type", expert.expertType)}
                {renderField("Qualification", expert.qualification)}
                {renderField("Experience", expert.experience)}
                {renderField("Location", expert.location)}
                {renderField("Mobile", expert.mobile)}
                {renderField("Office Address", expert.officeAddress)}
                {renderField("Call Executive Call", expert.CallExecutiveCall)}
              </View>

              {/* Expert-specific fields */}
              <View style={styles.specializationContainer}>
                {renderExpertSpecificFields(expert)}
              </View>

              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => requestExpert(expert)}
              >
                <Text style={styles.requestButtonText}>Request Expert</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noExperts}>
          No experts found for this category.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: "10%",
  },
  backButton: { fontSize: 16, color: "blue", marginBottom: 10 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  expertCard: {
    width: Platform.OS === "web" ? "30%" : "90%",
    backgroundColor: "#fff",
    padding: 16,
    margin: 10,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  expertName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  detailsContainer: {
    width: "100%",
    marginBottom: 10,
  },
  specializationContainer: {
    width: "100%",
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  expertDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    textAlign: "left",
    width: "100%",
  },
  label: { fontWeight: "bold", color: "#333" },
  noExperts: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  errorText: { textAlign: "center", fontSize: 16, color: "red", marginTop: 20 },
  requestButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  requestButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ExpertDetails;
