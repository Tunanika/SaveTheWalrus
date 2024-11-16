import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ObservationForm = () => {
  const [step, setStep] = useState(1);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    species: "",
    observed_count: "",
    gender: "",
    age: "",
    health: "1",
    location: "",
    timestamp: new Date().toISOString(),
    user: "",
    additional_description: "",
    date: new Date().toISOString().split("T")[0], // Initialize with current date
    time: new Date().toTimeString().split(" ")[0], // Initialize with current time
  });

  useEffect(() => {
    (async () => {
      // Request permissions for image and location
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
      const username = await AsyncStorage.getItem("username");
      if (username) {
        setFormData((prev) => ({ ...prev, user: username }));
      }
    })();
  }, []);

  const extractExifData = async (uri: string) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError(
          "Location permission is required to record the observation location"
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const asset = await MediaLibrary.createAssetAsync(uri);

      return {
        location: `${location.coords.latitude}, ${location.coords.longitude}`,
        timestamp: asset.modificationTime || new Date().toISOString(),
      };
    } catch (err) {
      console.error("Error extracting data:", err);
      setError("Failed to get location data: " + err);
      return null;
    }
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        const exifData = await extractExifData(result.assets[0].uri);
        if (exifData) {
          console.log("EXIF EXISTS");
          
        }
        setStep(2);
      }
    } catch (err) {
      setError("Error picking image: " + err);
    } finally {
      setLoading(false);
    }
  };

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

      Alert.alert("Success", "Observation submitted successfully!");
      setStep(3);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

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
          </View>
        );

      case 2:
        return (
          <ScrollView style={styles.formContainer}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            )}

            <View style={styles.formField}>
              <Text style={styles.label}>Animal Species</Text>
              <Picker
                selectedValue={formData.species}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, species: value }))
                }
                style={styles.picker}
              >
                <Picker.Item label="Select a species" value="" />
                <Picker.Item label="Fallow Deer (Damhert)" value="Damhert" />
                <Picker.Item label="Red Deer (Edelhert)" value="Edelhert" />
                <Picker.Item label="Roe Deer (Ree)" value="Ree" />
                <Picker.Item label="Wild Boar" value="Wild_Boar" />
                <Picker.Item
                  label="Scottish Highlander"
                  value="Scottish_Highlander"
                />
                <Picker.Item label="Wolf" value="Wolf" />
              </Picker>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Number of Animals</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.observed_count}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, observed_count: value }))
                }
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Gender</Text>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
                style={styles.picker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Unknown" value="Unknown" />
              </Picker>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Age</Text>
              <Picker
                selectedValue={formData.age}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, age: value }))
                }
                style={styles.picker}
              >
                <Picker.Item label="Select Age" value="" />
                <Picker.Item label="Adolescent" value="Adolescent" />
                <Picker.Item label="Adult" value="Adult" />
                <Picker.Item label="Unknown" value="Unknown" />
              </Picker>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Health</Text>
              <Picker
                selectedValue={formData.health}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, health: value }))
                }
                style={styles.picker}
              >
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
                <Picker.Item label="4" value="4" />
                <Picker.Item label="5" value="5" />
                <Picker.Item label="Unknown" value="Unknown" />
              </Picker>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, date: value }))
                }
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={formData.time}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, time: value }))
                }
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                value={formData.additional_description}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    additional_description: value,
                  }))
                }
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
              }}
            >
              <Text style={styles.buttonText}>Submit Another Observation</Text>
            </TouchableOpacity>
          </View>
        );
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
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4a5568",
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
  },
  newObservationButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    fontSize: 16,
    color: "#1a202c",
  },
  textArea: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    fontSize: 16,
    color: "#1a202c",
    height: 100,
    textAlignVertical: "top",
  },
});

export default ObservationForm;
