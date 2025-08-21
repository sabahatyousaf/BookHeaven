import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from '../styles/theme';

/* Shared Imports */
import Splash from '../screens/shared/Splash';
import OnBoarding from '../screens/shared/OnBoarding';

// Auth Imports
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';

// Dashboard Imports
import BottomNavigator from '../navigation/bottomNavigator/BottomNavigator';
import BookCategory from '../screens/dashBoard/bookCategoryScreens/BookCategory';
import BookDetail from '../screens/dashBoard/bookCategoryScreens/BookDetail';

// Profile Imports
import Account from '../screens/profile/profileScreens/subProfileScreens/Account';
import Favorites from '../screens/profile/profileScreens/subProfileScreens/Favorites';
import Library from '../screens/profile/profileScreens/subProfileScreens/Library';
import PrivacyPolicy from '../screens/profile/profileScreens/subProfileScreens/PrivacyPolicy';
import AppUsage from '../screens/profile/profileScreens/subProfileScreens/AppUsage';

// Order(Cart + CheckOut) Imports
import Orders from '../screens/profile/profileScreens/subProfileScreens/Orders';
import CheckOut from '../screens/checkout/CheckOut';
import Receipt from '../screens/receipt/Receipt';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        {/* Shared Routes */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="OnBoard">
          {props => (
            <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Auth Routes */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* Dashboard Routes */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Category_Books">
          {props => (
            <BookCategory {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Book_Detail">
          {props => (
            <BookDetail {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Profile Routes */}
        <Stack.Screen name="My_Account">
          {props => (
            <Account {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Favorites">
          {props => (
            <Favorites {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="My_Library">
          {props => (
            <Library {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="My_Orders">
          {props => <Orders {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Privacy_Policy">
          {props => (
            <PrivacyPolicy {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="App_Usage">
          {props => (
            <AppUsage {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Order Routes */}
        <Stack.Screen name="CheckOut">
          {props => (
            <CheckOut {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Receipt">
          {props => (
            <Receipt {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
