import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapPage from "./MapPage";
import UserProfile from "./UserProfile";
import UsersContent from "./UsersContent";
import { ParkingLotsProvider } from "./ParkingLotsContext";

const Tab = createBottomTabNavigator();

const HomePage = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        options={{ headerShown: false }}
        name="MapPage"
        component={MapPage}
      />
      <Tab.Screen name="UsersContent" component={UsersContent} />
      <Tab.Screen name="UserProfile" component={UserProfile} />
    </Tab.Navigator>
  );
};

export default HomePage;
