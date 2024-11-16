import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";

const ObservationForm = () => {
  const [step, setStep] = useState(1);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    species: "",
    observed_count: "1",
    gender: "",
    age: "",
    health: "1",
    location: "",
    timestamp: new Date(),
    username: "",
    remarks: "",
  });

  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
          setFormData((prev) => ({ ...prev, username: storedUsername }));
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    getUsername();
  }, []);

  // Function to extract EXIF data and location
  const extractExifData = async (uri: any) => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError(
          "Location permission is required to record the observation location"
        );
        return null;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      // Get asset info
      const asset = await MediaLibrary.createAssetAsync(uri);

      return {
        location: `${location.coords.latitude}, ${location.coords.longitude}`,
        timestamp: asset.modificationTime,
      };
    } catch (err) {
      console.error("Error extracting data:", err);
      setError("Failed to get location data: " + err);
      return null;
    }
  };

  // Image Picker Function
  const pickImage = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        exif: true,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);

        // Extract EXIF data directly from the result
        const exifData = result.assets[0].exif;
        if (exifData && exifData.DateTimeOriginal) {
          const dateString = exifData.DateTimeOriginal.replace(
            /:/g,
            "-"
          ).replace(" ", "T");
          const timestamp = new Date(dateString);
          setFormData((prev) => ({
            ...prev,
            timestamp,
          }));
        }
        setStep(2);
      }
    } catch (err) {
      setError("Error picking image: " + err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8000/observations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit observation");
      }

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Render the Observation Form
  const renderForm = () => (
    <ScrollView style={styles.formContainer}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      {/* Species Dropdown */}
      <View style={styles.formField}>
        <Text style={styles.label}>Species *</Text>
        <Picker
          selectedValue={formData.species}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, species: value }))
          }
          style={styles.picker}
        >
          <Picker.Item label="Select species" value="" />
          <Picker.Item label="Fallow deer (damhert)" value="damhert" />
          <Picker.Item label="Red deer (edelhert)" value="edelhert" />
          <Picker.Item label="Roe deer (ree)" value="ree" />
          <Picker.Item label="Wild boar" value="wild_boar" />
          <Picker.Item
            label="Scottish Highlander"
            value="scottish_highlander"
          />
          <Picker.Item label="Wolf" value="wolf" />
        </Picker>
      </View>

      {/* Number of Animals Input */}
      <View style={styles.formField}>
        <Text style={styles.label}>Number of Animals *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.observed_count}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, observed_count: value }))
          }
          keyboardType="numeric"
          placeholder="Enter number of animals"
        />
      </View>

      {/* Gender Dropdown */}
      <View style={styles.formField}>
        <Text style={styles.label}>Gender</Text>
        <Picker
          selectedValue={formData.gender}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, gender: value }))
          }
          style={styles.picker}
        >
          <Picker.Item label="Select gender" value="" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Unknown" value="unknown" />
        </Picker>
      </View>

      {/* Age Dropdown */}
      <View style={styles.formField}>
        <Text style={styles.label}>Age</Text>
        <Picker
          selectedValue={formData.age}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, age: value }))
          }
          style={styles.picker}
        >
          <Picker.Item label="Select age" value="" />
          <Picker.Item label="Young" value="young" />
          <Picker.Item label="Adolescent" value="adolescent" />
          <Picker.Item label="Adult" value="adult" />
          <Picker.Item label="Unknown" value="unknown" />
        </Picker>
      </View>

      {/* Health Score Dropdown */}
      <View style={styles.formField}>
        <Text style={styles.label}>Health Score</Text>
        <Picker
          selectedValue={formData.health}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, health: value }))
          }
          style={styles.picker}
        >
          <Picker.Item label="Select health score" value="" />
          <Picker.Item label="1 (Poor)" value="1" />
          <Picker.Item label="2 (Fair)" value="2" />
          <Picker.Item label="3 (Good)" value="3" />
          <Picker.Item label="4 (Very Good)" value="4" />
          <Picker.Item label="5 (Excellent)" value="5" />
          <Picker.Item label="Unknown" value="unknown" />
        </Picker>
      </View>

      {/* Date and Time Picker */}
      <View style={styles.formField}>
        <Text style={styles.label}>Date and Time of Observation</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.timestamp.toLocaleString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.timestamp}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData((prev) => ({ ...prev, timestamp: selectedDate }));
              }
            }}
          />
        )}
      </View>

      {/* Observation Location */}
      <View style={styles.formField}>
        <Text style={styles.label}>Observation Location</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation ? selectedLocation.latitude : 37.78825,
            longitude: selectedLocation
              ? selectedLocation.longitude
              : -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setSelectedLocation({ latitude, longitude });
            setFormData((prev) => ({
              ...prev,
              location: `${latitude}, ${longitude}`,
            }));
          }}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} />}
        </MapView>
      </View>

      {/* Username Display */}
      <View style={styles.formField}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.usernameText}>{username}</Text>
      </View>

      {/* Remarks Input */}
      <View style={styles.formField}>
        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={[styles.textInput, styles.remarksInput]}
          value={formData.remarks}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, remarks: value }))
          }
          placeholder="Enter any additional remarks"
          multiline={true}
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Submit Observation</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={loading}
            >
              <Ionicons name="camera" size={50} color="#4a5568" />
              <Text style={styles.uploadText}>Tap to select an image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setStep(2)}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return renderForm();
      case 3:
        return (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#10b981" />
            <Text style={styles.successText}>
              Observation Submitted Successfully!
            </Text>
            <TouchableOpacity
              style={styles.newObservationButton}
              onPress={() => {
                setStep(1);
                setImageUri(null);
                setFormData({
                  species: "",
                  observed_count: "1",
                  gender: "",
                  age: "",
                  health: "1",
                  location: "",
                  timestamp: new Date(),
                  username: username,
                  remarks: "",
                });
                setError("");
              }}
            >
              <Text style={styles.buttonText}>Submit Another Observation</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((stepNumber) => (
          <View
            key={stepNumber}
            style={[
              styles.progressDot,
              step >= stepNumber && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {renderStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e2e8f0",
  },
  progressDotActive: {
    backgroundColor: "#3b82f6",
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    backgroundColor: "white",
    width: "100%",
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4a5568",
  },
  skipButton: {
    marginTop: 20,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  formContainer: {
    padding: 20,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a202c",
    marginBottom: 8,
  },
  picker: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    fontSize: 16,
  },
  remarksInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1a202c",
  },
  usernameText: {
    fontSize: 16,
    color: "#4a5568",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    margin: 20,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a202c",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  newObservationButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
});

export default ObservationForm;
