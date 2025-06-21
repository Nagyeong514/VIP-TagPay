// src/screens/main/RecentPaymentsScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/api';
import moment from 'moment';

interface PaymentItem {
  bank: string;
  amount: string;
  account_number: string;
  paid_at: string;
}

const RecentPaymentsScreen = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      try {
        const res = await api.get('/api/user/payments', {
          headers: {Authorization: `Bearer ${token}`},
        });
        setPayments(res.data);
      } catch (err) {
        console.error('💥 Error fetching payments:', err);
      }
    };

    fetchPayments();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>최근 결제 내역</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {payments.map((item, idx) => (
          <View key={idx} style={styles.paymentBox}>
            <Text style={styles.bank}>{item.bank}</Text>
            <Text style={styles.amount}>
              {Number(item.amount).toLocaleString()}원
            </Text>
            <Text style={styles.account}>계좌: {item.account_number}</Text>
            <Text style={styles.date}>
              {moment(item.paid_at).format('YYYY-MM-DD HH:mm')}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecentPaymentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  paymentBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  bank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  account: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
