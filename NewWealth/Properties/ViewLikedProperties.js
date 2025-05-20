import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const LikedPropertiesScreen = () => {
  const [likedProperties, setLikedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data from AsyncStorage
        const userDetailsString = await AsyncStorage.getItem("userDetails");

        if (!userDetailsString) {
          throw new Error("No user details found");
        }

        const userDetails = JSON.parse(userDetailsString);

        const mobileNumber =
          userDetails?.MobileNumber ||
          userDetails?.MobileIN ||
          userDetails?.Number;

        if (!mobileNumber) {
          throw new Error("No mobile number found in user details");
        }

        // Now fetch liked properties
        await fetchLikedProperties(mobileNumber);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchLikedProperties = async (mobileNumber) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties/getlikedproperties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          MobileNumber: mobileNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLikedProperties(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching liked properties:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyPress = (property) => {
    navigation.navigate("PropertyDetails", {
      property: {
        ...property,
        id: property._id,
        price: `₹${parseInt(property.price).toLocaleString()}`,
        images: Array.isArray(property.photo)
          ? property.photo.map((photo) => ({
              uri: photo.startsWith("http") ? photo : `${API_URL}${photo}`,
            }))
          : [
              {
                uri: property.photo.startsWith("http")
                  ? property.photo
                  : `${API_URL}${property.photo}`,
              },
            ],
      },
    });
  };

  const handleShare = (property) => {
    let shareImage;
    if (Array.isArray(property.photo) && property.photo.length > 0) {
      shareImage = property.photo[0].startsWith("http")
        ? property.photo[0]
        : `${API_URL}${property.photo[0]}`;
    } else if (property.photo) {
      shareImage = property.photo.startsWith("http")
        ? property.photo
        : `${API_URL}${property.photo}`;
    } else {
      shareImage = null;
    }

    navigation.navigate("PropertyCard", {
      property: {
        photo: shareImage,
        location: property.location || "Location not specified",
        price: property.price || "Price not available",
        propertyType: property.propertyType || "Property",
        PostedBy: property.PostedBy || "",
        fullName: property.fullName || "Wealth Associate",
      },
    });
  };

  const renderPropertyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => handlePropertyPress(item)}
    >
      <Image
        source={{
          uri: Array.isArray(item.photo)
            ? item.photo[0]?.startsWith("http")
              ? item.photo[0]
              : `${API_URL}${item.photo[0]}`
            : item.photo?.startsWith("http")
            ? item.photo
            : `${API_URL}${item.photo}`,
        }}
        style={styles.propertyImage}
        defaultSource={require("../../assets/man.png")} // Add a placeholder image
      />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyType}>{item.propertyType}</Text>
        <Text style={styles.propertyLocation}>{item.location}</Text>
        <Text style={styles.propertyPrice}>
          ₹{parseInt(item.price).toLocaleString()}
        </Text>
      </View>
      <View style={styles.propertyActions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={(e) => {
            e.stopPropagation();
            handleShare(item);
          }}
        >
          <FontAwesome name="share" size={16} color="white" />
        </TouchableOpacity>
        <Ionicons
          name="heart"
          size={24}
          color="#D81B60"
          style={styles.heartIcon}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="warning" size={60} color="#FFC107" />
        <Text style={styles.emptyText}>Error loading properties</Text>
        <Text style={styles.emptySubtext}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchData();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (likedProperties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-dislike" size={60} color="#D81B60" />
        <Text style={styles.emptyText}>No liked properties yet</Text>
        <Text style={styles.emptySubtext}>
          Tap the heart icon on properties to save them here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={likedProperties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom:"10%"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  listContent: {
    padding: 15,
  },
  propertyCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: "100%",
    height: 200,
  },
  propertyInfo: {
    padding: 15,
  },
  propertyType: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  propertyActions: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 5,
    marginRight: 10,
  },
  heartIcon: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 5,
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#D81B60",
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default LikedPropertiesScreen;
