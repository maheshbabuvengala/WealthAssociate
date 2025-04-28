import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import logo from "../../assets/logo.png";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";

const PropertyCard = ({ property, closeModal }) => {
  const { photo, location, price, propertyType, PostedBy, fullName } = property;
  const viewShotRef = useRef();

  const handleVisitSite = () => {
    Linking.openURL("https://www.wealthassociate.in");
  };

  const handleShareOnWhatsApp = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      console.log("Image saved to", uri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert("Sharing is not available on this platform.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share Property",
        UTI: "public.image",
      });

      const caption = `Check out this property in ${location} for ₹${price}.`;
      const url = `whatsapp://send?text=${encodeURIComponent(caption)}`;
      Linking.openURL(url)
        .then(() => {
          if (closeModal) closeModal();
        })
        .catch(() => {
          alert("WhatsApp is not installed on your device.");
        });
    } catch (error) {
      console.error("Error sharing property:", error);
      alert("Failed to share property.");
    }
  };

  return (
    <View style={styles.templateContainer}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "jpg", quality: 1.0, result: "tmpfile" }}
        style={{ backgroundColor: "#5a89cc", borderRadius: 10, padding: 10 }}
      >
        <Text
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            fontSize: 25,
            fontWeight: "600",
            marginBottom: 20,
            color: "white",
          }}
        >
          Property For Sale
        </Text>
        <View style={styles.header}>
          <View style={{ display: "flex", flexDirection: "column" }}>
            <Text style={styles.propertyType}>{propertyType}</Text>
            <Text style={styles.locationText}>Location:{location}</Text>
          </View>
          <View>
            <Image
              source={logo}
              style={{
                width: 70,
                height: 70,
                position: "relative",
                // left: "20%",
                size: "contain",
                top: 10,
                left: -10,
              }}
            />
            <Image
              source={{
                uri: "https://www.wealthassociate.in/images/logo.png",
              }}
              style={styles.logo}
            />
          </View>
        </View>

        <View style={styles.imageSection}>
          <Image source={{ uri: photo }} style={styles.propertyImage} />
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>₹{price}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.downloadTitle}>Download Our App</Text>
          <View style={styles.storeButtons}>
            <TouchableOpacity
              style={styles.storeButton}
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=your.app.id"
                )
              }
            >
              <FontAwesome5 name="google-play" size={24} color="#000" />
              <Text style={styles.storeText}>Google Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.storeButton}
              onPress={() =>
                Linking.openURL("https://apps.apple.com/app/idYourAppID")
              }
            >
              <AntDesign name="apple1" size={24} color="#000" />
              <Text style={styles.storeText}>App Store</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* <View style={styles.locationBox}></View> */}
      </ViewShot>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => closeModal()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleShareOnWhatsApp}>
          <FontAwesome name="whatsapp" size={24} color="#25D366" />

          <Text style={styles.buttonText}>Share on WhatsApp</Text>
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
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    // padding: 10,
    borderRadius: 8,
  },
  propertyType: {
    fontSize: 18,
    fontWeight: "bold",
    left: 20,
  },
  logo: {
    width: 60,
    height: 30,
    resizeMode: "contain",
  },
  imageSection: {
    marginTop: 10,
    backgroundColor: "#eee",
    borderRadius: 15,
    overflow: "hidden",
    // paddingBottom: 10,
    position: "relative",
    alignItems: "center",
  },
  propertyImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  priceTag: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 8,
  },
  priceText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },
  agentInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 10,
    padding: 10,
    flex: 2,
    marginRight: 5,
  },
  agentImageCircle: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e653b3",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    position: "relative",
    right: 5,
  },
  agentImgText: {
    fontSize: 10,
    textAlign: "center",
  },
  agentDetails: {
    justifyContent: "center",
  },
  agentName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  agentPhone: {
    fontSize: 14,
    color: "#555",
  },
  // locationBox: {
  //   flex: 1,
  //   backgroundColor: "#eee",
  //   borderRadius: 10,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   padding: 10,
  // },
  locationText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    left: 9,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
  },
  buttonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#000",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    marginTop: 10,
    borderRadius: 10,
  },

  downloadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  storeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  storeButton: {
    alignItems: "center",
    padding: 10,
  },

  storeText: {
    marginTop: 5,
    fontSize: 14,
  },
});

export default PropertyCard;
