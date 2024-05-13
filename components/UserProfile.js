import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useRef } from "react";
import { useNavigation } from "@react-navigation/core";
import { auth } from "../App";
import axios from "axios";
import cheerio from "cheerio";
import MapView, { Marker, Callout } from "react-native-maps";
import { useParkingLotsCon } from "./ParkingLotsContext";

const UserProfile = () => {
  const navigation = useNavigation();
  const currentUserEmail = auth.currentUser ? auth.currentUser.email : null;

  const { updateCurrentLocation, updateDestination, updateNodes } =
    useParkingLotsCon();

  const handleSignOut = async () => {
    try {
      updateCurrentLocation(null);
      updateDestination(null);
      updateNodes([]);

      await auth.signOut();
      navigation.replace("LoginPage");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emailText}>Email: {currentUserEmail}</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emailText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
