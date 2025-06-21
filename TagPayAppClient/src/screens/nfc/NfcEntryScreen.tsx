// ✅ NfcEntryScreen.tsx - UI 개선 (loading 상태만 변경)
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/api';

type RootStackParamList = {
  Biometric: {
    bank: string;
    account: string;
    amount: string;
  };
};

const NfcEntryScreen = () => {
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [detected, setDetected] = useState(false);
  const [myBank, setMyBank] = useState('');
  const [myAccount, setMyAccount] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const interval = setInterval(async () => {
      if (detected || retryCount >= maxRetries) {
        clearInterval(interval);
        return;
      }

      try {
        const url = await NativeModules.NfcModule.getLatestNfcUrl();
        if (url) {
          console.log('✅ NFC URL:', url);
          clearInterval(interval);
          const query = url.split('?')[1];
          const params = Object.fromEntries(
            query.split('&').map((part: string) => {
              const [key, value] = part.split('=');
              return [key, decodeURIComponent(value)];
            }),
          );

          const bankParam = params.bank || '';
          const accountParam = params.account || '';
          const amountParam = params.amount || '';

          setBank(bankParam);
          setAccount(accountParam);
          setAmount(amountParam);
          setDetected(true);
        }
      } catch (e: any) {
        console.warn('NFC 재시도:', e?.message || e);
      }

      retryCount += 1;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMyAccount = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const res = await api.get('/api/user/accounts', {
          headers: {Authorization: `Bearer ${token}`},
        });
        if (res.data.length > 0) {
          setMyBank(res.data[0].bank);
          setMyAccount(res.data[0].account_number);
        }
      } catch (err) {
        console.error('❌ 내 계좌 불러오기 실패:', err);
      }
    };

    fetchMyAccount();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        {detected ? (
          <>
            <Text style={styles.bankText}>{bank}</Text>
            <Text style={styles.amountText}>
              {Number(amount).toLocaleString()} 원
            </Text>
            <Text style={styles.originalPrice}> </Text>

            <View style={styles.infoBox}>
              <View style={styles.row}>
                <Text style={styles.label}>입금 계좌</Text>
                <Text style={styles.value}>
                  {bank} | {account}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>출금 계좌</Text>
                <Text style={styles.value}>
                  {myBank} | {myAccount}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.payButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Biometric', {bank, account, amount})
              }>
              <Text style={styles.payButtonText}>결제하기</Text>
            </TouchableOpacity>

            <Text style={styles.consentText}>
              구매 내용에 동의하면 결제해주세요.
            </Text>
          </>
        ) : (
          <View style={styles.processingContainer}>
            <View style={styles.rippleWrapper}>
              <View style={styles.staticRipple} />
              <View style={[styles.staticRipple, styles.staticRipple2]} />
              <Animated.View
                style={[
                  styles.ripple,
                  {
                    transform: [{scale: pulseAnim}],
                  },
                ]}
              />
              <View style={styles.processingButton}>
                <Image
                  source={require('../../assets/icons/NFC.png')}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View style={styles.processingText}>
              <Text style={styles.processingTitle}>
                결제 정보를 가져오는 중...
              </Text>
              <Text style={styles.processingSubtitle}>
                NFC 태그를 확인하고 있어요
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default NfcEntryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: '#d1d5db',
    textDecorationLine: 'line-through',
    marginBottom: 32,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 70,
    marginBottom: 24,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  payButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    height: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  consentText: {
    fontSize: 12,
    color: '#6b7280',
  },

  // ✅ loading 상태용 스타일 추가
  processingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  staticRipple: {
    position: 'absolute',
    width: 220,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#d1d5db',
    zIndex: 0,
  },
  staticRipple2: {
    width: 200,
    height: 100,
    borderRadius: 50,
  },
  ripple: {
    position: 'absolute',
    width: 240,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#d1d5db',
    zIndex: 0,
  },
  processingButton: {
    width: 180,
    height: 80,
    backgroundColor: '#000000',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconImage: {
    width: 52,
    height: 52,
  },
  processingText: {
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  processingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});
