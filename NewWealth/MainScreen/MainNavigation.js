import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import UpperNavigation from "./Uppernavigation";
import BottomNavigation from "./BottomNavigation";

const PersistentLayout = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Safe area handling for the top */}
      <View style={styles.topSafeArea}>
        <UpperNavigation />
      </View>

      {/* Middle Content (Dynamic) */}
      <View style={styles.content}>{children}</View>

      {/* Bottom Navigation (Persistent) */}
      <View style={styles.bottomSafeArea}>
        <BottomNavigation />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    backgroundColor: "#fff",
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1, // Takes remaining space
  },
  bottomSafeArea: {
    backgroundColor: "#fff", // or whatever color your bottom nav has
  },
});

export default PersistentLayout;
