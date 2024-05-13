// ParkingLotsContext.js
import React, { createContext, useState, useContext } from "react";

const ParkingLotsContext = createContext();

export const ParkingLotsProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [parkingLots, setParkingLots] = useState([]);
  const [destination, setDestination] = useState("");
  const [listFromFirebase, setListFromFirebase] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [Nodes, setNodes] = useState([]);

  const updateUserId = (newUserId) => {
    setUserId(newUserId);
  };

  const updateDestination = (newDestination) => {
    setDestination(newDestination);
  };

  const updateParkingLots = (newParkingLots) => {
    setParkingLots(newParkingLots);
  };

  const updateListFromFirebase = (newListOfFavoriteLots) => {
    setListFromFirebase(newListOfFavoriteLots);
  };

  const updateCurrentLocation = (newCurrectLocation) => {
    setCurrentLocation(newCurrectLocation);
  };

  const updateNodes = (NewListOfNodes) => {
    setNodes(NewListOfNodes);
  };

  return (
    <ParkingLotsContext.Provider
      value={{
        userId,
        updateUserId,
        parkingLots,
        updateParkingLots,
        destination,
        updateDestination,
        listFromFirebase,
        updateListFromFirebase,
        currentLocation,
        updateCurrentLocation,
        Nodes,
        updateNodes,
      }}
    >
      {children}
    </ParkingLotsContext.Provider>
  );
};

export const useParkingLotsCon = () => {
  const context = useContext(ParkingLotsContext);
  if (!context) {
    throw new Error("useParkingLots must be used within a ParkingLotsProvider");
  }
  return context;
};
