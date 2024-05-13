import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { ref, get, onValue, off } from "firebase/database";
import { firebaseDB } from "../App";
import { useParkingLotsCon } from "./ParkingLotsContext";

const UsersContent = () => {
  const { userId, parkingLots, listFromFirebase, updateListFromFirebase } =
    useParkingLotsCon();

  useEffect(() => {
    retrieveSavedItems();
    const parkingLotsRef = ref(firebaseDB, `users/${userId}/parkingLots`);
    const onDataChange = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const testData = Object.values(data);
        updateListFromFirebase(testData);

        console.log(testData);
      } else {
        console.log("No data available");
      }
    };
    onValue(parkingLotsRef, onDataChange);

    return () => {
      off(parkingLotsRef, "value", onDataChange);
    };
  }, []);

  const retrieveSavedItems = async () => {
    try {
      const parkingLotsRef = ref(firebaseDB, `users/${userId}/parkingLots`);
      const snapshot = await get(parkingLotsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const testData = Object.values(data);
        updateListFromFirebase(testData);
      } else {
        console.log("No data available");
        return null;
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
      return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>List of Favorite Parking Lots</Text>
      {listFromFirebase &&
        listFromFirebase.map((FavparkingLot, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.lotNumber}>
              Lot#: {FavparkingLot.LotNumber}
            </Text>
            <Text style={styles.address}>Address: {FavparkingLot.street}</Text>
            <Text style={styles.features}>
              Features: {FavparkingLot.features}
            </Text>
          </View>
        ))}
    </ScrollView>
  );
};

export default UsersContent;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 15,
    width: "100%",
  },
  lotNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    marginBottom: 5,
  },
  features: {
    fontSize: 16,
  },
});
