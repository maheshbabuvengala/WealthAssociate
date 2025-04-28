import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";

const data = [
  {
    id: "1",
    title: "LEGAL",
    icon: "https://img.icons8.com/ios/100/scales.png",
  },
  {
    id: "2",
    title: "REVENUE",
    icon: "https://img.icons8.com/ios/100/rupee.png",
  },
  {
    id: "3",
    title: "ENGINEERS",
    icon: "https://img.icons8.com/ios/100/engineer.png",
  },
  {
    id: "4",
    title: "ARCHITECTS",
    icon: "https://img.icons8.com/ios/100/blueprint.png",
  },
  {
    id: "5",
    title: "SURVEY",
    icon: "https://img.icons8.com/ios/100/survey.png",
  },
  {
    id: "6",
    title: "VAASTU PANDITS",
    icon: "https://img.icons8.com/ios/100/guru.png",
  },
  {
    id: "7",
    title: "LAND VALUERS",
    icon: "https://img.icons8.com/ios/100/marker.png",
  },
  {
    id: "8",
    title: "BANKING",
    icon: "https://img.icons8.com/ios/100/bank.png",
  },
  {
    id: "9",
    title: "AGRICULTURE",
    icon: "https://img.icons8.com/ios/100/farm.png",
  },
  {
    id: "10",
    title: "REGISTRATION &\nDOCUMENTATION",
    icon: "https://img.icons8.com/ios/100/contract.png",
  },
  {
    id: "11",
    title: "AUDITING",
    icon: "https://img.icons8.com/ios/100/paint-brush.png",
  },
  {
    id: "12",
    title: "LIAISONING",
    icon: "https://img.icons8.com/ios/100/handshake.png",
  },
];

const ExpertPanel = ({ onSwitch }) => {
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 4 : width > 300 ? 3 : 2;
  const spacing = 8;
  const itemSize = (width - spacing * (numColumns + 1)) / numColumns;

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.header}>Expert Panel</Text>
      <View style={styles.listContainer}>
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, { width: itemSize }]}
            onPress={() => onSwitch(item.title)} 
          >
            <View style={styles.iconContainer}>
              <Image source={{ uri: item.icon }} style={styles.icon} />
            </View>
            <Text style={styles.text}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  item: { alignItems: "center", justifyContent: "center", margin: 4 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  icon: { width: 35, height: 35, resizeMode: "contain" },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
    color: "#333",
  },
});

export default ExpertPanel;
