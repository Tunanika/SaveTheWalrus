import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const ExploreTab = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data from the backend
    axios
      .get("http://10.30.32.210:8000/observations")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.species}</Text>
        <Ionicons name="arrow-forward" size={20} color="#666" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.info}>Age: {item.age}</Text>
        <Text style={styles.info}>Gender: {item.gender}</Text>
        <Text style={styles.info}>Health: {item.health}</Text>
        <Text style={styles.info}>Observed Count: {item.observed_count}</Text>
      </View>
      <Text style={styles.description}>{item.additional_description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: 36 }]}>
      <Text style={styles.header}>Explore</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0066cc",
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  list: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
});

export default ExploreTab;
