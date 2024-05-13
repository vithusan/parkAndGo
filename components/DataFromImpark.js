import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { firebaseDB } from "../App";
import { ref, set } from "firebase/database";
import axios from "axios";
import cheerio from "cheerio";
import HTMLParser from "react-native-html-parser";
import { useParkingLotsCon } from "./ParkingLotsContext";

const DataFromImpark = () => {
  const { updateParkingLots, destination } = useParkingLotsCon();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://www.easypark.ca/find-parking"
        );
        const html = response.data;
        // console.log(html);
        // const pattern =
        //   /<marker[^>]*street="([^"]*)"[^>]*LotNumber="([^"]*)"[^>]*lat="([^"]*)"[^>]*lng="([^"]*)"[^>]*features="([^"]*)"[^>]*>/g;

        const pattern =
          /<marker[^>]*street="([^"]*)"[^>]*title="([^"]*)"[^>]*LotNumber="([^"]*)"[^>]*lat="([^"]*)"[^>]*lng="([^"]*)"[^>]*features="([^"]*)"[^>]*>/g;

        const lots = [];
        let match;

        while ((match = pattern.exec(html)) !== null) {
          const [, street, title, LotNumber, lat, lng, features] = match;
          lots.push({ street, title, LotNumber, lat, lng, features });
        }

        updateParkingLots(lots);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      {/* <Text>DataFromImpark</Text>
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Fetch Data</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default DataFromImpark;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
