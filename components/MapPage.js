import { StyleSheet, View, Text } from "react-native";
import React, { useEffect, useState, createContext, useContext } from "react";
import SearchBar from "./SearchBar";
import CurLocation from "./CurLocation";
import DataFromImpark from "./DataFromImpark";
import UserProfile from "./UserProfile";

const MapPage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <SearchBar />
      </View>
      <CurLocation />
      <DataFromImpark />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    position: "absolute",
    zIndex: 10,
    padding: 5,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
});

export default MapPage;
