import React, { useRef, useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const PropertyCard = ({ route, navigation }) => {
  const { property } = route.params;
  const {
    photo = "",
    location = "Location not specified",
    price = "Price not available",
    propertyType = "Property",
    PostedBy = "",
    fullName = "Wealth Associate",
  } = property;

  const [agentImage, setAgentImage] = useState(null);
  const viewShotRef = useRef();
  const navigations=useNavigation()

  useEffect(() => {
    const fetchAgentImage = async () => {
      try {
        const imageUri = await AsyncStorage.getItem("agentImage");
        if (imageUri) {
          setAgentImage({ uri: imageUri });
        } else {
          setAgentImage(require("../../assets/man.png"));
        }
      } catch (error) {
        console.error("Error fetching agent image:", error);
        setAgentImage(require("../../assets/man.png"));
      }
    };

    fetchAgentImage();
  }, []);

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCall = () => {
    if (PostedBy) {
      Linking.openURL(`tel:${PostedBy}`);
    } else {
      alert("Phone number not available");
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
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.tagline}>Your Trusted Property Consultant</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.forSaleText}>PROPERTY FOR SALE</Text>

          {/* Property Image */}
          <Image
            source={{ uri: photo || "https://via.placeholder.com/300" }}
            style={styles.propertyImage}
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

          {/* Agent Info */}
          {/* <View style={styles.agentContainer}>
            <View style={styles.agentInfo}>
              <Image source={agentImage} style={styles.agentImage} />
              <Text style={styles.agentName}>{fullName.toUpperCase()}</Text>
            </View>
            <Text style={styles.contactText}>MOBILE: {PostedBy}</Text>
          </View>*/}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.downloadText}>DOWNLOAD OUR APP</Text>
          <View style={styles.appButtons}>
            <TouchableOpacity style={styles.appButton}>
              <FontAwesome name="android" size={20} color="#000" />
              <Text style={styles.buttonText}>Play Store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appButton}>
              <FontAwesome name="apple" size={20} color="#000" />
              <Text style={styles.buttonText}>App Store</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ViewShot>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton} onPress={()=>navigations.goBack()}>
          {/* <FontAwesome name="phone" size={20} color="#fff" /> */}
          <Text style={styles.callButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <FontAwesome name="whatsapp" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 15,
  },
  header: {
    backgroundColor: "lightpink",
    padding: 20,
    alignItems: "center",
  },
  logo: {
    width: 260,
    height: 70,
    // marginBottom: 10,
  },
  companyLocation: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "bold",
  },
  tagline: {
    color: "#fff",
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "center",
    // marginTop: 5,
  },
  content: {
    padding: 20,
  },
  forSaleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 15,
    textTransform: "uppercase",
    backgroundColor: "#1a237e",
    width: "100%",
    borderRadius: 5,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    alignContent: "center",
  },
  propertyImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailsContainer: {
    marginBottom: 15,
  },
  propertyType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  location: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#388e3c",
    textAlign: "center",
    marginVertical: 10,
  },
  agentContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  agentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  agentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  agentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textTransform: "uppercase",
    flex: 1,
  },
  contactText: {
    fontSize: 14,
    color: "#555",
  },
  footer: {
    backgroundColor: "#e8eaf6",
    padding: 15,
    alignItems: "center",
  },
  downloadText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
    padding: 10,
    borderRadius: 5,
    width: "45%",
    justifyContent: "center",
    elevation: 2,
  },
  buttonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    justifyContent: "center",
  },
  callButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
});

export default PropertyCard;
