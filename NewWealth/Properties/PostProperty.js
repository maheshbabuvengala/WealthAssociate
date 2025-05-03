import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
  Keyboard,
} from "react-native";
import { Button } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropertyCard from "./PropertyCard";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../data/ApiUrl";

const { width, height } = Dimensions.get("window");

const PostProperty = ({ closeModal }) => {
  // [Keep all your existing state declarations and functions exactly the same]

  const scrollViewRef = useRef();

  const handleOutsideTouch = () => {
    Keyboard.dismiss();
    setShowPropertyTypeList(false);
    setShowLocationList(false);
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View 
          style={styles.overlay} 
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleOutsideTouch}
        />
        
        <View style={styles.modalContent}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Post a Property</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              {/* Photo Upload Section */}
              <Text style={styles.label}>Upload Photos (Max 4)</Text>
              <View style={styles.uploadSection}>
                {photos.length > 0 ? (
                  <View style={styles.photosContainer}>
                    {photos.map((photoUri, index) => (
                      <View key={index} style={styles.photoWrapper}>
                        <Image source={{ uri: photoUri }} style={styles.uploadedImage} />
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => {
                            const updatedPhotos = [...photos];
                            updatedPhotos.splice(index, 1);
                            setPhotos(updatedPhotos);
                            if (Platform.OS === "web") {
                              const updatedFiles = [...files];
                              updatedFiles.splice(index, 1);
                              setFiles(updatedFiles);
                            }
                          }}
                        >
                          <MaterialIcons name="close" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {photos.length < 4 && (
                      <TouchableOpacity
                        style={styles.addPhotoButton}
                        onPress={selectImagesFromGallery}
                      >
                        <MaterialIcons name="add" size={24} color="#555" />
                        <Text style={styles.uploadPlaceholderText}>Add Photo</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.uploadOptions}>
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={selectImagesFromGallery}
                    >
                      <MaterialIcons name="photo-library" size={24} color="#555" />
                      <Text style={styles.uploadPlaceholderText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={takePhotoWithCamera}
                    >
                      <MaterialIcons name="camera-alt" size={24} color="#555" />
                      <Text style={styles.uploadPlaceholderText}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}

              {/* Rest of your form components */}
              {/* Property Type Dropdown */}
              <Text style={styles.label}>Property Type</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search Property Type"
                    placeholderTextColor="rgba(25, 25, 25, 0.5)"
                    value={propertyType || propertyTypeSearch}
                    onChangeText={(text) => {
                      setPropertyTypeSearch(text);
                      setPropertyType("");
                      setShowPropertyTypeList(true);
                    }}
                    onFocus={() => setShowPropertyTypeList(true)}
                  />
                  {propertyType && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearPropertyTypeSelection}
                    >
                      <MaterialIcons name="clear" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                {showPropertyTypeList && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={{ maxHeight: 150 }}>
                      {filteredPropertyTypes.map((item) => (
                        <TouchableOpacity
                          key={`${item.code}-${item.name}`}
                          style={styles.listItem}
                          onPress={() => {
                            setPropertyType(item.name);
                            setPropertyTypeSearch(item.name);
                            setShowPropertyTypeList(false);
                            Keyboard.dismiss();
                          }}
                        >
                          <Text>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              {errors.propertyType && (
                <Text style={styles.errorText}>{errors.propertyType}</Text>
              )}

              {/* Property Details */}
              {propertyType && (
                <>
                  <Text style={styles.label}>Property Details</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={getPropertyDetailsPlaceholder()}
                    value={propertyDetails}
                    onChangeText={setPropertyDetails}
                  />
                  {errors.propertyDetails && (
                    <Text style={styles.errorText}>{errors.propertyDetails}</Text>
                  )}
                </>
              )}

              {/* Location Dropdown */}
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex. Vijayawada"
                    value={location || locationSearch}
                    onChangeText={(text) => {
                      setLocationSearch(text);
                      setLocation("");
                      setShowLocationList(true);
                    }}
                    onFocus={() => setShowLocationList(true)}
                  />
                  {location && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearLocationSelection}
                    >
                      <MaterialIcons name="clear" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                {showLocationList && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={{ maxHeight: 150 }}>
                      {filteredConstituencies.map((item) => (
                        <TouchableOpacity
                          key={`${item.code}-${item.name}`}
                          style={styles.listItem}
                          onPress={() => {
                            setLocation(item.name);
                            setLocationSearch(item.name);
                            setShowLocationList(false);
                            Keyboard.dismiss();
                          }}
                        >
                          <Text>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}

              {/* Price Input */}
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.postButton, loading && styles.disabledButton]}
                  onPress={handlePost}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.postButtonText}>Post Property</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Success Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleClosePropertyModal}
        >
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            {postedProperty && (
              <PropertyCard
                property={postedProperty}
                closeModal={handleClosePropertyModal}
              />
            )}
          </Animated.View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// [Keep your existing styles exactly the same]
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Platform.OS === "android" || Platform.OS === "ios" ? "100%" : "40%",
    borderRadius: 30,
    // top: "10%",
    // backgroundColor: "rgba(0,0,0,0.5)",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    // marginBottom: 20,
    color: "#fff",
    backgroundColor: "#D81B60",
    width: "100%",
    borderRadiusto: 20,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  formContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#bbb",
    borderRadius: 25,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 8,
  },
  inputWrapper: {
    position: "relative",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 300,
    overflow: "scroll",
    backgroundColor: "#e6708e",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  uploadSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  photoWrapper: {
    position: "relative",
    marginRight: 10,
    marginBottom: 10,
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: "cover",
  },
  removePhotoButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  uploadPlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginRight: 10,
    marginBottom: 10,
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  postButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#D81B60",
    borderRadius: 8,
    paddingVertical: 14,
    elevation: 2,
  },
  postButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 14,
    elevation: 2,
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default PostProperty;