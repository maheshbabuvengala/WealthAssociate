import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";

const PropertyCards = ({ property, closeModal }) => {
  const { photo, location, price, propertyType } = property;
  const viewShotRef = useRef();

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share property");
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "jpg", quality: 1.0 }}
        style={styles.cardContainer}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/logosub.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.forSaleText}>PROPERTY FOR SALE</Text>

          {/* Property Image */}
          <Image
            source={{ uri: photo || "https://via.placeholder.com/300" }}
            style={styles.propertyImage}
            defaultSource={require("../../assets/logosub.png")}
          />

          {/* Property Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.propertyType}>
              PROPERTY TYPE: {propertyType.toUpperCase()}
            </Text>
            <Text style={styles.location}>
              LOCATION: {location.toUpperCase()}
            </Text>
            <Text style={styles.price}>₹{price}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.downloadText}>DOWNLOAD OUR APP</Text>
          <View style={styles.appButtons}>
            <TouchableOpacity style={styles.appButton}>
              <FontAwesome name="android" size={16} color="#000" />
              <Text style={styles.buttonText}>Play Store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appButton}>
              <FontAwesome name="apple" size={16} color="#000" />
              <Text style={styles.buttonText}>App Store</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ViewShot>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton} onPress={closeModal}>
          <Text style={styles.callButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <FontAwesome name="whatsapp" size={16} color="#fff" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 330,
    marginLeft: 17,
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    top: 10,
    maxHeight: "80%",
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 10,
  },
  header: {
    backgroundColor: "#fff5f5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  logo: {
    marginLeft: -9,
    bottom: 15,
    width: 120,
    height: 120,
  },
  content: {
    padding: 15,
  },
  forSaleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    backgroundColor: "#1a237e",
    height: 50,
    width: 350,
    lineHeight: 50,
    marginTop: -48,
    marginLeft: -20,
  },
  propertyImage: {
    width: "100%",
    height: 180,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsContainer: {
    marginBottom: -15,
  },
  propertyType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  location: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  footer: {
    backgroundColor: "#e8eaf6",
    padding: 10,
    alignItems: "center",
  },
  downloadText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a237e",
  },
  appButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  appButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 5,
    width: "45%",
    justifyContent: "center",
    elevation: 2,
  },
  buttonText: {
    marginLeft: 6,
    fontWeight: "500",
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    justifyContent: "center",
  },
  callButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default PropertyCards;
