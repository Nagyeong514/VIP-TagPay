// /src/screens/nfc/BiometricScreen.tsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ReactNativeBiometrics from 'react-native-biometrics';

type RootStackParamList = {
  Processing: {
    bank: string;
    account: string;
    amount: string;
  };
  Password: {
    bank: string;
    account: string;
    amount: string;
  };
};

const rnBiometrics = new ReactNativeBiometrics();

const BiometricScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {bank, account, amount} = (route.params || {}) as {
    bank: string;
    account: string;
    amount: string;
  };

  const [biometryType, setBiometryType] = useState<null | string>(null);

  useEffect(() => {
    rnBiometrics.isSensorAvailable().then(result => {
      const {available, biometryType} = result;
      if (available && biometryType) {
        setBiometryType(biometryType);
      } else {
        Alert.alert('알림', '생체 인식을 사용할 수 없습니다.');
        navigation.navigate('Password', {bank, account, amount}); // 파라미터 전달
      }
    });
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: '본인 확인을 위해 생체 인증을 진행합니다',
      });

      if (success) {
        navigation.navigate('Processing', {bank, account, amount}); // ✅ 수정: Complete → Processing
      } else {
        Alert.alert(
          '인증 실패',
          '생체 인증에 실패하였습니다.\n비밀번호로 인증하시겠습니까?',
          [
            {text: '취소', style: 'cancel'},
            {
              text: '비밀번호 입력',
              onPress: () =>
                navigation.navigate('Password', {bank, account, amount}),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        '오류',
        '생체 인증 중 오류가 발생했습니다.\n비밀번호로 인증하시겠습니까?',
        [
          {text: '취소', style: 'cancel'},
          {
            text: '비밀번호 입력',
            onPress: () =>
              navigation.navigate('Password', {bank, account, amount}),
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.centerContainer}>
        <View style={styles.biometricContent}>
          <View style={styles.biometricIcon}>
            <Image
              source={require('../../assets/icons/bio.png')}
              style={{width: 150, height: 150, resizeMode: 'contain'}}
            />
          </View>
          <View style={styles.biometricText}>
            <Text style={styles.biometricTitle}>생체 인증</Text>
            <Text style={styles.biometricSubtitle}>
              결제를 확인하려면 {biometryType || 'Face ID'}를 사용하세요
            </Text>
          </View>
        </View>

        <View style={styles.biometricButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBiometricAuth}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {biometryType || 'Face ID'} 사용
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Password', {bank, account, amount})
            }
            activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>비밀번호로 인증</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BiometricScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  biometricContent: {
    alignItems: 'center',
    marginBottom: 100,
  },
  biometricIcon: {
    fontSize: 128,
    marginBottom: 32,
  },
  biometricText: {
    alignItems: 'center',
    gap: 8,
  },
  biometricTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  biometricSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  biometricButtons: {
    position: 'absolute',
    bottom: 60,
    left: 32,
    right: 32,
    gap: 16,
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    height: 56,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
});
