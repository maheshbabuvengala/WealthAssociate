import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import logo from "../../../assets/logo.png";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";

const PropertyCard = ({ property, closeModal }) => {
  const viewShotRef = useRef();
  const [isSharing, setIsSharing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getPhotoUri = () => {
    if (!property?.photo) return logo;
    if (property.photo.startsWith("http")) return { uri: property.photo };
    if (property.photo.startsWith("file://")) return { uri: property.photo };
    return logo;
  };

  const handleShare = async () => {
    if (!viewShotRef.current) {
      Alert.alert("Error", "Sharing component not ready");
      return;
    }

    setIsSharing(true);

    try {
      // Capture the view as an image
      const uri = await viewShotRef.current.capture({
        format: "jpg",
        quality: 0.9,
      });

      if (!uri) {
        throw new Error("Failed to capture image");
      }

      // Ensure file is saved locally
      const fileUri = FileSystem.cacheDirectory + "shared-property.jpg";
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      // Check if sharing is available on the device
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Sharing Not Supported",
          "Update your device to enable sharing."
        );
        return;
      }

      // Share the image with caption
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Property For Sale",
        mimeType: "image/jpeg",
        UTI: "image/jpeg", // For iOS
      });
    } catch (error) {
      Alert.alert(
        "Sharing Error",
        error.message || "Couldn't share the property."
      );
    } finally {
      setIsSharing(false);
    }
  };
  const handleVisitSite = () => {
    Linking.openURL("https://www.wealthassociate.in");
  };

  if (!property) {
    return (
      <View style={styles.templateContainer}>
        <Text style={styles.errorText}>No property data available</Text>
        <TouchableOpacity style={styles.button} onPress={closeModal}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.templateContainer}>
      <ViewShot
        ref={viewShotRef}
        options={{
          format: "jpg",
          quality: 0.9,
        }}
        style={styles.viewShotContainer}
      >
        <Text style={styles.propertyForSaleText}>Property For Sale</Text>

        <View style={styles.header}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyType}>
              {property.propertyType || "Property"}
            </Text>
            <Text style={styles.locationText}>
              Location: {property.location || "Location not specified"}
            </Text>
          </View>

          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logoImage} />
            <Image
              source={{ uri: "https://www.wealthassociate.in/images/logo.png" }}
              style={styles.websiteLogo}
            />
          </View>
        </View>

        <View style={styles.imageSection}>
          {imageLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5a89cc" />
            </View>
          )}
          <Image
            source={getPhotoUri()}
            style={styles.propertyImage}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            defaultSource={logo}
          />
          {imageError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load image</Text>
            </View>
          )}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              ₹{property.price || "Price not specified"}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.downloadTitle}>Download Our App</Text>
          <View style={styles.storeButtons}>
          <TouchableOpacity
              style={styles.storeButton}
              onPress={() =>
                Linking.openURL(
                  Platform.OS === "ios"
                    ? "https://apps.apple.com/in/app/wealth-associate/id6743356719"
                    : "https://play.google.com/store/apps/details?id=com.wealthassociates.alpha"
                )
              }
            >
              {Platform.OS === "ios" ? (
                <AntDesign name="apple1" size={24} color="#000" />
              ) : (
                <FontAwesome5 name="google-play" size={24} color="#000" />
              )}
              <Text style={styles.storeText}>
                {Platform.OS === "ios" ? "App Store" : "Google Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.storeButton}
              onPress={() =>
                Linking.openURL(
                  Platform.OS !== "ios"
                    ? "https://apps.apple.com/in/app/wealth-associate/id6743356719"
                    : "https://play.google.com/store/apps/details?id=com.wealthassociates.alpha"
                )
              }
            >
              {Platform.OS !== "ios" ? (
                <AntDesign name="apple1" size={24} color="#000" />
              ) : (
                <FontAwesome5 name="google-play" size={24} color="#000" />
              )}
              <Text style={styles.storeText}>
                {Platform.OS !== "ios" ? "App Store" : "Google Play"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ViewShot>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={closeModal}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="share" size={24} color="white" />
              <Text style={[styles.buttonText, styles.shareButtonText]}>
                Share Property
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  templateContainer: {
    backgroundColor: "#5a89cc",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    width: Platform.OS === "ios" ? "95%" : "100%",
    alignSelf: "center",
  },
  viewShotContainer: {
    backgroundColor: "#5a89cc",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  propertyForSaleText: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 20,
    color: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  propertyInfo: {
    flex: 1,
  },
  propertyType: {
    fontSize: 18,
    fontWeight: "bold",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  logoContainer: {
    width: 80,
    alignItems: "center",
  },
  logoImage: {
    width: 50,
    height: 40,
  },
  websiteLogo: {
    width: 80,
    height: 40,
    resizeMode: "contain",
  },
  imageSection: {
    marginTop: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  loadingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  errorContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#eee",
  },
  priceTag: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  priceText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f9f9f9",
  },
  shareButton: {
    backgroundColor: "#007AFF",
  },
  shareButtonText: {
    color: "white",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
  },
  footer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  downloadTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  storeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "white",
    borderRadius: 5,
  },
  storeText: {
    marginLeft: 5,
    fontSize: 12,
  },
});

export default PropertyCard;
