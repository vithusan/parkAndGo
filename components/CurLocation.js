import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
  Button,
  TextInput,
  Modal,
} from "react-native";
import { ref, set, remove } from "firebase/database";
import { firebaseDB } from "../App";
import * as Location from "expo-location";
import MapView, { Marker, Callout } from "react-native-maps";
import MapViewDirection from "react-native-maps-directions";
import { useParkingLotsCon } from "./ParkingLotsContext";
import { useNavigation } from "@react-navigation/core";

const CurLocation = () => {
  const navigation = useNavigation();
  const [initialRegion, setInitialRegion] = useState(null);
  const mapRef = useRef(null);
  const [relevantParkingLots, setRelevantParkingLots] = useState([]);
  const [distanceThreshold, setDistanceThreshold] = useState("1");
  const [nearDestination, setNearDestination] = useState("1");
  const [showFilter, setShowFilter] = useState(false);

  const {
    userId,
    destination,
    parkingLots,
    listFromFirebase,
    currentLocation,
    updateCurrentLocation,
    Nodes,
    updateNodes,
  } = useParkingLotsCon();

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    updateCurrentLocation(location.coords);

    setInitialRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const coordinates =
    currentLocation && destination
      ? [
          {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          },
          {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        ]
      : [];

  useEffect(() => {
    if (currentLocation && destination && mapRef.current) {
      const boundingBox = {
        latitude: (currentLocation.latitude + destination.lat) / 2,
        longitude: (currentLocation.longitude + destination.lng) / 2,
        latitudeDelta:
          Math.abs(currentLocation.latitude - destination.lat) * 1.5,
        longitudeDelta:
          Math.abs(currentLocation.longitude - destination.lng) * 1.5,
      };

      mapRef.current.animateToRegion(boundingBox);

      getDirections(coordinates[0], coordinates[1]);
    }
  }, [currentLocation, destination]);

  const getDirections = async (startLocation, endLocation) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${
        startLocation.latitude.toString() +
        ", " +
        startLocation.longitude.toString()
      }&destination=${
        endLocation.latitude.toString() +
        ", " +
        endLocation.longitude.toString()
      }&key=AIzaSyBg9_Kb_OC9NHjURUHoMJ2XlKnSkUh-MSg`
    );
    const data = await response.json();

    if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
      console.error("No route found");
      return [];
    }

    const route = data.routes[0];
    const nodes = [];

    for (const leg of route.legs) {
      for (const step of leg.steps) {
        const stepPolyline = step.polyline.points;
        const decodedPolyline = decodePolyline(stepPolyline);
        nodes.push(...decodedPolyline);
      }
    }
    updateNodes(nodes);
  };

  const decodePolyline = (encoded) => {
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;
    const points = [];

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const listOfParkingLotsDB = parkingLots;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const degToRad = Math.PI / 180;
    lat1 *= degToRad;
    lon1 *= degToRad;
    lat2 *= degToRad;
    lon2 *= degToRad;

    const earthRadius = 6371;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return distance;
  };

  const isParkingLotNearPath = (parkingLot, pathSegment, maxDistance) => {
    const distance = calculateDistance(
      parkingLot.lat,
      parkingLot.lng,
      pathSegment.latitude,
      pathSegment.longitude
    );
    return distance <= maxDistance;
  };

  const isNodeNearDestination = (node, destination, maxDistance) => {
    const distance = calculateDistance(
      node.latitude,
      node.longitude,
      destination.lat,
      destination.lng
    );
    return distance <= maxDistance;
  };

  const convertedDistanceThreshold = parseFloat(distanceThreshold) / 10;

  const nearbyNodes = Nodes.filter((node) =>
    isNodeNearDestination(node, destination, nearDestination)
  );

  const updateRelevantParkingLots = () => {
    const newRelevantParkingLots = [];

    for (const parkingLot of listOfParkingLotsDB) {
      const isNearPath = nearbyNodes.some((pathSegment) =>
        isParkingLotNearPath(
          parkingLot,
          pathSegment,
          convertedDistanceThreshold
        )
      );

      if (isNearPath) {
        newRelevantParkingLots.push(parkingLot);
      }
    }
    setRelevantParkingLots(newRelevantParkingLots);
  };
  useEffect(() => {
    if (Nodes.length > 0 && parkingLots.length > 0) {
      updateRelevantParkingLots();
    }
  }, [Nodes, parkingLots]);

  const handleFilterPress = () => {
    updateRelevantParkingLots();
    setShowFilter(false);
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  return (
    <View>
      {initialRegion && (
        <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
              pinColor="#00224D"
            />
          )}
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.lat,
                longitude: destination.lng,
              }}
              title="Destination"
              pinColor="#FF204E"
            />
          )}

          {currentLocation && destination && (
            <MapViewDirection
              origin={coordinates[0]}
              destination={coordinates[1]}
              apikey="AIzaSyBg9_Kb_OC9NHjURUHoMJ2XlKnSkUh-MSg"
              strokeWidth={10}
              strokeColor="#40A2E3"
            />
          )}

          {relevantParkingLots &&
            relevantParkingLots.map((parkingLot, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: parseFloat(parkingLot.lat),
                  longitude: parseFloat(parkingLot.lng),
                }}
                pinColor="#A0153E"
                onPress={() =>
                  navigation.navigate("EachParkingLotDetails", { parkingLot })
                }
              />
            ))}
        </MapView>
      )}

      <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
        <Text style={styles.filterButtonText}>
          {showFilter ? "Hide Filter" : "Show Filter"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilter}
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.filterLabel}>Distance Away from the Path:</Text>
            <View style={styles.distanceThresholdView}>
              <TextInput
                style={styles.input}
                defaultValue={distanceThreshold}
                onChangeText={(text) => setDistanceThreshold(text)}
                keyboardType="numeric"
              />
              <Text>KM</Text>
            </View>
            <Text style={styles.filterLabel}>Near Destination:</Text>
            <View style={styles.distanceThresholdView}>
              <TextInput
                style={styles.input}
                defaultValue={nearDestination}
                onChangeText={(text) => setNearDestination(text)}
                keyboardType="numeric"
              />
              <Text>KM</Text>
            </View>
            <Button title="Search" onPress={handleFilterPress} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  filterContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    width: 80,
  },
  filterButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  filterButtonText: {
    fontSize: 16,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  distanceThresholdView: {
    flexDirection: "row",
  },
  callout: {
    width: 200,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CurLocation;
