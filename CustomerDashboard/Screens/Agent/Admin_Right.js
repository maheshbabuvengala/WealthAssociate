import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { API_URL } from "../../../data/ApiUrl";

const { width } = Dimensions.get("window");

// Card dimensions based on platform
const cardWidth = Platform.OS === "web" ? (width * 0.85 - 30) / 3 : width * 0.7;
const cardHeight = Platform.OS === "web" ? 130 : 100;

const fetchData = async () => {
  try {
    return [
      {
        id: 1,
        title: "Total No. of Agents",
        count: "12,000",
        icon: "account-circle",
      },
      {
        id: 2,
        title: "Total No. of Customers",
        count: "5,202",
        icon: "account-group",
      },
      {
        id: 3,
        title: "Total No. of Properties Posted",
        count: "1,200",
        icon: "office-building",
      },
      {
        id: 4,
        title: "Total No. of Experts",
        count: "1,500",
        icon: "account-check",
      },
      { id: 5, title: "Total No. of NRI's", count: "125", icon: "airplane" },
      {
        id: 6,
        title: "Total No. of Core Clients",
        count: "12",
        icon: "contacts",
      },
      {
        id: 7,
        title: "Total No. of Skilled Labour",
        count: "2,450",
        icon: "human-handsup",
      },
    ];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const DashboardCard = ({ title, count, icon }) => (
  <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.count}>{count}</Text>
    <Icon name={icon} size={30} color="#E91E63" style={styles.icon} />
  </View>
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [Agents, setAgents] = useState("");
  const [Experts, setExperts] = useState("");
  const [Customers, setCustomers] = useState("");
  const [Properties, setProperties] = useState("");
  const [SkilledResource, setSkilledResource] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/count/total-agents`)
      .then((response) => response.json())
      .then((data) => setAgents(data.totalAgents))
      .catch((error) => console.error("Error fetching total agents:", error));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/count/total-customers`)
      .then((response) => response.json())
      .then((data) => setCustomers(data.totalAgents))
      .catch((error) =>
        console.error("Error fetching total customers:", error)
      );
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/count/total-properties`)
      .then((response) => response.json())
      .then((data) => setProperties(data.totalAgents))
      .catch((error) =>
        console.error("Error fetching total properties:", error)
      );
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/count/total-experts`)
      .then((response) => response.json())
      .then((data) => setExperts(data.totalAgents))
      .catch((error) => console.error("Error fetching total experts:", error));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/count/total-skilledlabours`)
      .then((response) => response.json())
      .then((data) => setSkilledResource(data.totalAgents))
      .catch((error) =>
        console.error("Error fetching total skilled resources:", error)
      );
  }, []);

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchData();
      setData(fetchedData);
    };
    getData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = [
          {
            id: 1,
            title: "Wealth Associates",
            count: `${Agents}`,
            icon: "account-circle",
          },
          {
            id: 2,
            title: "Expert Panel Members",
            count: `${Experts}`,
            icon: "account-check",
          },
          {
            id: 3,
            title: "Investors & Landlords",
            count: "125",
            icon: "airplane",
          },
          {
            id: 4,
            title: "Customers",
            count: `${Customers}`,
            icon: "account-group",
          },
          {
            id: 5,
            title: "Total Properties Listed",
            count: `${Properties}`,
            icon: "office-building",
          },
          {
            id: 6,
            title: "Skilled Resource",
            count: `${SkilledResource}`,
            icon: "human-handsup",
          },
          { id: 7, title: "Core Clients", count: "12", icon: "contacts" },
          {
            id: 8,
            title: "Core Projects",
            count: "2,450",
            icon: "human-handsup",
          },
          {
            id: 9,
            title: "Channel Partners",
            count: "2,450",
            icon: "account-group",
          },
        ];
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [Agents, Experts, Customers, Properties, SkilledResource]);

  return (
    <View contentContainerStyle={styles.container}>
      <View
        style={
          Platform.OS === "web"
            ? styles.webGridContainer
            : styles.androidGridContainer
        }
      >
        {data.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            count={item.count}
            icon={item.icon}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 10,
    height: "100vh",
  },
  // Web View: Align cards in rows with proper spacing
  webGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Ensures even spacing
    alignItems: "flex-start",
    width: "85%",
  },

  // Android View: Cards should be one below the other, centered
  androidGridContainer: {
    flexDirection: "column",
    alignItems: "center", // Centers cards
    justifyContent: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    margin: 8,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
  },
  count: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  icon: {
    position: "absolute",
    right: 15,
    bottom: 15,
  },
});

export default Dashboard;
