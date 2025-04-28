import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../data/ApiUrl";

const ExpertCard = ({ expert, onResolve }) => {
  return (
    <View style={styles.card}>
      <Image
        source={require("../../Admin_Pan/assets/man.png")}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Requested By:</Text>
          <Text style={styles.value}>{expert.WantedBy || expert.Name}</Text>
        </View>
        {expert.MobileNumber && (
          <View style={styles.row}>
            <Text style={styles.label}>Mobile Number:</Text>
            <Text style={styles.value}>{expert.MobileNumber}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Expert Type:</Text>
          <Text style={styles.value}>
            {expert.expertType || expert.ExpertType}
          </Text>
        </View>
        {expert.reason && (
          <View style={styles.row}>
            <Text style={styles.label}>Reason:</Text>
            <Text style={styles.value}>{expert.reason}</Text>
          </View>
        )}
        {expert.ExpertName && (
          <View style={styles.row}>
            <Text style={styles.label}>Expert Name:</Text>
            <Text style={styles.value}>{expert.ExpertName}</Text>
          </View>
        )}
        {expert.ExpertNo && (
          <View style={styles.row}>
            <Text style={styles.label}>Expert Mobile:</Text>
            <Text style={styles.value}>{expert.ExpertNo}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.value,
              expert.resolved ? styles.resolvedText : styles.unresolvedText,
            ]}
          >
            {expert.resolved ? "Resolved" : "Unresolved"}
          </Text>
        </View>
      </View>
      {!expert.resolved && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => onResolve(expert._id, expert.UserType)}
        >
          <Text style={styles.buttonText}>Mark as Resolved</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ExpertList = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isWebView = width > 600;

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      // Fetch both types of expert requests
      const [directResponse, generalResponse] = await Promise.all([
        fetch(`${API_URL}/direqexp/all`),
        fetch(`${API_URL}/requestexpert/all`),
      ]);

      const directData = await directResponse.json();
      const generalData = await generalResponse.json();

      // Combine and normalize the data
      const combined = [
        ...directData.map((item) => ({
          ...item,
          UserType: "direct", // Mark as direct expert request
        })),
        ...generalData.map((item) => ({
          ...item,
          UserType: "general", // Mark as general expert request
        })),
      ];

      // Sort experts: unresolved first, then resolved
      const sortedExperts = combined.sort((a, b) =>
        a.resolved === b.resolved ? 0 : a.resolved ? 1 : -1
      );

      setExperts(sortedExperts);
    } catch (error) {
      console.error("Error fetching experts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (id, userType) => {
    // Determine the correct endpoint based on request type
    const endpoint =
      userType === "direct"
        ? `${API_URL}/direqexp/resolve/${id}`
        : `${API_URL}/requestexpert/resolve/${id}`;

    fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => {
        fetchExperts(); // Refresh the list
      })
      .catch((error) => {
        console.error("Error resolving expert:", error);
      });
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#e91e63"
        style={{ marginTop: 50 }}
      />
    );
  }

  return (
    <FlatList
      data={experts}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => (
        <ExpertCard expert={item} onResolve={handleResolve} />
      )}
      contentContainerStyle={
        isWebView ? styles.webContainer : styles.listContainer
      }
      numColumns={isWebView ? 3 : 1}
    />
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
    height: 340,
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
  resolvedText: {
    color: "green",
    fontWeight: "bold",
  },
  unresolvedText: {
    color: "red",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#e91e63",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ExpertList;
