import React from "react";
import { NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import Alerts from "./src/screens/Alerts";

const Stack = createStackNavigator()
function App(){
    return <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name={'Alerts'} component={Alerts} />
        </Stack.Navigator>
    </NavigationContainer>
}

export default  App