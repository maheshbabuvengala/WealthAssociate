import React from 'react';
import { View, StyleSheet } from 'react-native';
import UpperNavigation from './Uppernavigation';
import BottomNavigation from './BottomNavigation';

const PersistentLayout = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Upper Navigation (Persistent) */}
      <UpperNavigation />
      
      {/* Middle Content (Dynamic) */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Bottom Navigation (Persistent) */}
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1, // Takes remaining space
  },
});

export default PersistentLayout;