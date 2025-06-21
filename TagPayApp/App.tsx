// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import IntroScreen from './src/screens/nfc/IntroScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import MainScreen from './src/screens/main/MainScreen';
import PasswordScreen from './src/screens/nfc/PasswordScreen';
import NfcEntryScreen from './src/screens/nfc/NfcEntryScreen';
import BiometricScreen from './src/screens/nfc/BiometricScreen';
import ProcessingScreen from './src/screens/nfc/ProcessingScreen';
import CompleteScreen from './src/screens/nfc/CompleteScreen';
import PasswordSetupScreen from './src/screens/auth/PasswordSetupScreen';
import MyPage from './src/screens/main/MyPage';
import AccountRegistrationScreen from './src/screens/register/CardSetupScreen';
import AccountListScreen from './src/screens/register/AccountListScreen';
import RecentPaymentsScreen from './src/screens/register/RecentPaymentsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Password" component={PasswordScreen} />
        <Stack.Screen name="NfcEntry" component={NfcEntryScreen} />
        <Stack.Screen name="Biometric" component={BiometricScreen} />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Complete" component={CompleteScreen} />
        <Stack.Screen name="AccountList" component={AccountListScreen} />
        <Stack.Screen name="RecentPayments" component={RecentPaymentsScreen} />
        <Stack.Screen name="MyPage" component={MyPage} />
        <Stack.Screen
          name="AccountRegistration"
          component={AccountRegistrationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
