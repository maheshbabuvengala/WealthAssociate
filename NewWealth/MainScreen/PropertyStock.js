import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../data/ApiUrl";
import LazyImage from "../components/home/LazyImage";

// Cache expiration time (1 day in milliseconds)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Helper function to get property tag
const getPropertyTag = (createdAt) => {
  const currentDate = new Date();
  const propertyDate = new Date(createdAt);
  const timeDifference = currentDate - propertyDate;
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference <= 3) return "Regular Property";
  if (daysDifference >= 4 && daysDifference <= 17) return "Approved Property";
  if (daysDifference >= 18 && daysDifference <= 25) return "Wealth Property";
  return "Listed Property";
};

// Fetch properties from API
const fetchPropertiesFromAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/properties/getApproveProperty`);
    const data = await response.json();

    if (data && Array.isArray(data) && data.length > 0) {
      // Cache the data with timestamp
      const cacheData = {
        data: data,
        timestamp: new Date().getTime(),
      };
      await AsyncStorage.setItem("propertyCache", JSON.stringify(cacheData));

      // Preload images
      data.forEach((property) => {
        const images = normalizeImageSources(property);
        images.forEach((uri) => {
          LazyImage.preload(uri);
        });
      });

      return data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
};

// Get cached properties if they're still valid
const getCachedProperties = async () => {
  try {
    const cachedData = await AsyncStorage.getItem("propertyCache");
    if (!cachedData) return null;

    const parsedData = JSON.parse(cachedData);
    const currentTime = new Date().getTime();

    if (currentTime - parsedData.timestamp < CACHE_EXPIRATION_TIME) {
      return parsedData.data;
    }
    return null;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
};

// Normalize image sources
const normalizeImageSources = (property) => {
  if (!property) return [];

  if (Array.isArray(property.newImageUrls)) {
    return property.newImageUrls.filter(
      (url) => url && typeof url === "string"
    );
  } else if (
    typeof property.newImageUrls === "string" &&
    property.newImageUrls
  ) {
    return [property.newImageUrls];
  }

  if (Array.isArray(property.imageUrls)) {
    return property.imageUrls.filter((url) => url && typeof url === "string");
  } else if (typeof property.imageUrls === "string" && property.imageUrls) {
    return [property.imageUrls];
  }

  return [];
};

// Main function to get properties (uses cache if available and valid)
export const getProperties = async () => {
  // First try to get cached data
  const cachedProperties = await getCachedProperties();
  if (cachedProperties) {
    return cachedProperties;
  }

  // If no valid cache, fetch from API
  return await fetchPropertiesFromAPI();
};

// Get categorized properties
export const getCategorizedProperties = async () => {
  const properties = await getProperties();

  const regularProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Regular Property"
  );
  const approvedProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Approved Property"
  );
  const wealthProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Wealth Property"
  );
  const listedProperties = properties.filter(
    (property) => getPropertyTag(property.createdAt) === "Listed Property"
  );

  return {
    regularProperties,
    approvedProperties,
    wealthProperties,
    listedProperties,
  };
};
