// ✅ IntroScreen.tsx - 로그인 토큰 또는 NFC 인식 여부로 분기
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  NativeModules,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: {fromNfc?: boolean; nfcUrl?: string} | undefined;
  Main: undefined;
  NfcEntry: {bank: string; account: string; amount: string};
};

const IntroScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkNfcAndToken();
    }, 2000); // ✅ 렌더링 후 2초 뒤 실행

    return () => clearTimeout(timeout);
  }, []);

  const checkNfcAndToken = async () => {
    try {
      const url = await NativeModules.NfcModule.getLatestNfcUrl();
      const token = await AsyncStorage.getItem('token');

      if (url) {
        console.log('✅ NFC URL:', url);
        const query = url.split('?')[1];
        const params = Object.fromEntries(
          query.split('&').map((s: string) => s.split('=')),
        );

        const bank = params.b || '';
        const account = params.a || '';
        const amount = params.m || '';

        if (token) {
          navigation.replace('NfcEntry', {bank, account, amount});
        } else {
          navigation.replace('Login', {
            fromNfc: true,
            nfcUrl: url,
          });
        }
      } else {
        if (token) navigation.replace('Main');
        else navigation.replace('Login');
      }
    } catch (e) {
      console.warn('Intro error:', e);
      const token = await AsyncStorage.getItem('token');
      if (token) navigation.replace('Main');
      else navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Tag Pay</Text>
        <Text style={styles.subtitle}>Tag. Tap. Done.</Text>
      </View>
    </SafeAreaView>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
});
