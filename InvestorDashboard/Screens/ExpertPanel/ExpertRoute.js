import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ExpertPanel from "./Expert_panel";
import ExpertDetails from "./ExpertDetails";

export default function ExpertRoute() {
  const [activeComponent, setActiveComponent] = useState("A");
  const [selectedExpertType, setSelectedExpertType] = useState(null);

  return (
    <View style={styles.container}>
      {activeComponent === "A" ? (
        <ExpertPanel
          onSwitch={(type) => {
            setSelectedExpertType(type);
            setActiveComponent("B");
          }}
        />
      ) : (
        <ExpertDetails
          expertType={selectedExpertType}
          onSwitch={() => setActiveComponent("A")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
