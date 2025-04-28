import React from "react";
import { Modal, View, StyleSheet, Platform } from "react-native";

const CustomModal = ({ isVisible, closeModal, children }) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    backgroundColor: "transparent",
  },
  modalContent: {
    justifyContent: "center",
    alignItems: "center",
    width: Platform.OS === "web" ? "65%" : "100%",
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: 20,
    maxHeight: Platform.OS === "web" ? "80%" : "100%",
    height: 900,
  },
});

export default CustomModal;
