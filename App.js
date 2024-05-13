import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import { store } from "./store";
import CurLocation from "./components/CurLocation";
import SearchBar from "./components/SearchBar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import EachParkingLotDetails from "./components/EachParkingLotDetails";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { ParkingLotsProvider } from "./components/ParkingLotsContext";

const firebaseConfig = {
  apiKey: "AIzaSyBg9_Kb_OC9NHjURUHoMJ2XlKnSkUh-MSg",
  authDomain: "parkandgo-420607.firebaseapp.com",
  projectId: "parkandgo-420607",
  storageBucket: "parkandgo-420607.appspot.com",
  messagingSenderId: "960979219928",
  appId: "1:960979219928:web:525cbe601685102529eead",
  measurementId: "G-53727Z1SNX",
  databaseURL: "https://parkandgo-420607-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firebaseDB = getDatabase(app);
export { auth, firebaseDB };

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ParkingLotsProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            options={{ headerShown: false }}
            name="LoginPage"
            component={LoginPage}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="Home"
            component={HomePage}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="CurLocation"
            component={CurLocation}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="EachParkingLotDetails"
            component={EachParkingLotDetails}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ParkingLotsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
