import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./login";
import PhotoUpload from "./photo";

type RootStackParamList = {
  Login: undefined;
  PhotoUpload: undefined;
  ObservationDetails: { photoData: { location: string; timestamp: Date } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="PhotoUpload" component={PhotoUpload} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}
