import { View, Text, Button, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useDispatch } from "react-redux";
import { setDestination } from "../slices/navSlice";
import MapViewDirection from "react-native-maps-directions";
import { useParkingLotsCon } from "./ParkingLotsContext";

export default function SearchBar() {
  const { updateDestination } = useParkingLotsCon();

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: 5,
        paddingHorizontal: 5,
        borderColor: "#111",
        borderRadius: 5,
      }}
    >
      <GooglePlacesAutocomplete
        placeholder="Search"
        fetchDetails={true}
        onPress={(data, details = null) => {
          updateDestination(details.geometry.location);
        }}
        query={{
          key: "AIzaSyBg9_Kb_OC9NHjURUHoMJ2XlKnSkUh-MSg",
          language: "en",
        }}
      />
    </View>
  );
}
