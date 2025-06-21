import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, NativeModules, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Password: {bank: string; account: string; amount: string};
};

export default function IntroScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    console.log('📡 IntroScreen mounted');

    let retryCount = 0;
    const maxRetries = 10;

    const interval = setInterval(async () => {
      if (bank || retryCount >= maxRetries) {
        clearInterval(interval);
        return;
      }

      try {
        const url = await NativeModules.NfcModule.getLatestNfcUrl();
        if (url) {
          console.log('✅ getLatestNfcUrl:', url);
          clearInterval(interval); // ✅ 먼저 멈추기

          const query = url.split('?')[1];
          const params = Object.fromEntries(
            query.split('&').map((part: string) => {
              const [key, value] = part.split('=');
              return [key, decodeURIComponent(value)];
            }),
          );

          const b = params.b || '';
          const a = params.a || '';
          const m = params.m || '';

          setBank(b);
          setAccount(a);
          setAmount(m);

          // ✅ 1초 후 자동 이동
          setTimeout(() => {
            navigation.replace('Password', {
              bank: b,
              account: a,
              amount: m,
            });
          }, 1000);
        }
      } catch (e: any) {
        console.warn('⏳ NFC URL fetch 재시도:', e?.message || e);
      }

      retryCount += 1;
    }, 1000); // 1초 간격 재시도

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 TagPay에 오신 것을 환영합니다!</Text>
      {bank ? (
        <View>
          <Text style={styles.text}>🏦 은행: {bank}</Text>
          <Text style={styles.text}>💳 계좌: {account}</Text>
          <Text style={styles.text}>💰 금액: {amount}원</Text>
        </View>
      ) : (
        <Text style={styles.text}>📲 NFC 태그를 가까이 해보세요</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#0ff',
    fontSize: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
});
