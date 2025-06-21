// /src/screens/nfc/CompleteScreen.tsx
import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../constants/api';

const CompleteScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute();
  const {bank, account, amount} = (route.params || {}) as {
    bank: string;
    account: string;
    amount: string;
  };

  const currentTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ✅ 결제 정보 저장 API 호출
  useEffect(() => {
    const savePayment = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        await instance.post(
          '/api/user/payment',
          {
            bank,
            account_number: account,
            amount: parseInt(amount),
          },
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        console.log('✅ 결제 내역 저장 완료');
      } catch (err) {
        console.error('❌ 결제 저장 실패:', err);
      }
    };

    savePayment();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.centerContainer}>
        <View style={styles.completeContent}>
          <View style={styles.checkmarkContainer}>
            <Image
              source={require('../../assets/icons/check.png')}
              style={styles.checkmarkImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.completeText}>
            <Text style={styles.completeTitle}>결제 완료</Text>
            <Text style={styles.completeSubtitle}>
              결제가 성공적으로 처리되었습니다
            </Text>
          </View>

          <View style={styles.receiptContainer}>
            <View style={styles.receiptItem}>
              <Text style={styles.receiptLabel}>은행</Text>
              <Text style={styles.receiptValue}>{bank}</Text>
            </View>
            <View style={styles.receiptItem}>
              <Text style={styles.receiptLabel}>계좌번호</Text>
              <Text style={styles.receiptValue}>{account}</Text>
            </View>
            <View style={styles.receiptItem}>
              <Text style={styles.receiptLabel}>금액</Text>
              <Text style={styles.receiptAmount}>
                {parseInt(amount).toLocaleString()}원
              </Text>
            </View>
            <View style={styles.receiptItem}>
              <Text style={styles.receiptLabel}>결제 시각</Text>
              <Text style={styles.receiptValue}>{currentTime}</Text>
            </View>
            <View style={styles.receiptItem}>
              <Text style={styles.receiptLabel}>결제 수단</Text>
              <Text style={styles.receiptValue}>NFC 인증</Text>
            </View>
          </View>
        </View>

        <View style={styles.completeButtonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CompleteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completeContent: {
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,

    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  completeText: {
    alignItems: 'center',
    marginBottom: 32,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  receiptContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 16,
    marginBottom: 32,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  receiptLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  receiptValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  completeButtonContainer: {
    paddingHorizontal: 32,
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
  // ✅ 이미지 스타일 추가
  checkmarkImage: {
    width: 100,
    height: 100,
  },
});
