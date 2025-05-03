import React, { memo } from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import UpperNavigation from "./Uppernavigation";
import BottomNavigation from "./BottomNavigation";

const PersistentLayout = memo(({ children }) => {
  return (
    <View style={styles.container}>
      {/* Static Top Navigation - will never re-render */}
      <View style={styles.topSafeArea}>
        <UpperNavigation />
      </View>

      {/* Content Area - Will be filled by React Navigation */}
      <View style={styles.content}>{children}</View>

      {/* Static Bottom Navigation - will never re-render */}
      <View style={styles.bottomSafeArea}>
        <BottomNavigation />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topSafeArea: {
    zIndex: 100,
    elevation: 100,
  },
  content: {
    flex: 1,
  },
  bottomSafeArea: {
    zIndex: 100,
    elevation: 100,
  },
});

export default PersistentLayout;
