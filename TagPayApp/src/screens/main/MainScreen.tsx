// src/screens/main/MainScreen.tsx
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import moment from 'moment';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/api';

import 'moment/locale/ko'; // ✅ 추가

moment.locale('ko');

type RootStackParamList = {
  AccountRegistration: undefined;
  AccountList: undefined;
  Processing: undefined;
  MyPage: undefined;
  RecentPayments: undefined;
};

interface PaymentItem {
  bank: string;
  amount: string;
  account_number: string;
  paid_at: string;
}

const MainScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState('home');
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  const [mainAccount, setMainAccount] = useState<{
    bank: string;
    account_number: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) return;

          // 결제 내역 불러오기
          const res = await api.get('/api/user/payments', {
            headers: {Authorization: `Bearer ${token}`},
          });
          setPayments(res.data);

          // ✅ 계좌 정보 불러오기
          const accRes = await api.get('/api/user/accounts', {
            headers: {Authorization: `Bearer ${token}`},
          });
          if (accRes.data.length > 0) {
            setMainAccount(accRes.data[0]); // 가장 최근 계좌를 대표로
          }
        } catch (err) {
          console.error('❌ 데이터 불러오기 실패:', err);
        }
      };

      fetchData();
    }, []),
  );

  const tabs = [
    {id: 'home', icon: require('../../assets/icons/home.png'), label: 'Home'},
    {
      id: 'payment',
      icon: require('../../assets/icons/wallet22.png'),
      label: 'Payment',
    },
    {id: 'cards', icon: require('../../assets/icons/log.png'), label: 'Logs'},
    {
      id: 'profile',
      icon: require('../../assets/icons/set.png'),
      label: 'My Page',
    },
  ];

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'payment') {
      navigation.navigate('AccountList');
    } else if (tabId === 'profile') {
      navigation.navigate('MyPage');
    } else if (tabId === 'cards') {
      navigation.navigate('RecentPayments'); // ✅ 최근 결제 내역 페이지로 이동
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.mainContainer}>
        <View style={styles.mainHeader}>
          <Text style={styles.mainHeaderTitle}>Tag Pay</Text>
        </View>

        <ScrollView
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}>
          {/* 카드 */}
          <View style={styles.cardSection}>
            <View style={styles.cardContainer}>
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>대표 계좌</Text>
                  <Text style={styles.cardNumber}>
                    •••• •••• ••••{' '}
                    {mainAccount?.account_number.slice(-4) || '----'}
                  </Text>
                  <Text style={styles.cardBank}>
                    {mainAccount?.bank || '은행 이름'}
                  </Text>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardHolder}>내 계정</Text>
                  <Text style={styles.cardIcon}>
                    <Image
                      source={require('../../assets/logo/hana.png')}
                      style={{width: 50, height: 50, resizeMode: 'contain'}}
                    />
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation.navigate('AccountRegistration')}
            activeOpacity={0.7}>
            <Text style={styles.manageButtonText}>계좌 추가</Text>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>

          {/* 결제 내역 */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>최근 결제 내역</Text>
            <View style={styles.transactionsList}>
              {payments.map((item, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionStore}>{item.bank}</Text>
                    <Text style={styles.transactionDate}>
                      {moment(item.paid_at).calendar()}
                    </Text>
                  </View>
                  <Text style={styles.transactionAmount}>
                    ₩{Number(item.amount).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={styles.navTab}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}>
              <Image source={tab.icon} style={styles.navIconImage} />

              <Text
                style={[
                  styles.navLabel,
                  activeTab === tab.id
                    ? styles.navLabelActive
                    : styles.navLabelInactive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mainHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mainHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  cardSection: {
    marginBottom: 24,
  },
  cardContainer: {
    height: 192,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardInfo: {
    gap: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  cardBank: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHolder: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardIcon: {
    fontSize: 32,
  },
  manageButton: {
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  manageButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 16,
    color: '#6b7280',
  },
  transactionsSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionInfo: {
    gap: 4,
  },
  transactionStore: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  bottomNav: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navTab: {
    alignItems: 'center',
    gap: 4,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 12,
  },
  navLabelActive: {
    color: '#000000',
    fontWeight: '500',
  },
  navLabelInactive: {
    color: '#9ca3af',
  },
  navIconImage: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
});
