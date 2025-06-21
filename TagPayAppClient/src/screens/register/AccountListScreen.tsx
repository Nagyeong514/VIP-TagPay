// /src/screens/register/AccountListScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/api';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import moment from 'moment';

type RootStackParamList = {
  AccountRegistration: undefined;
  Main: undefined;
};

interface Account {
  bank: string;
  account_number: string;
  created_at: string;
}

const bankLogos: {[key: string]: any} = {
  KB국민은행: require('../../assets/logo/kb.png'),
  신한은행: require('../../assets/logo/shinhan.png'),
  우리은행: require('../../assets/logo/uri.png'),
  하나은행: require('../../assets/logo/hana.png'),
  농협은행: require('../../assets/logo/nh.png'),
  기업은행: require('../../assets/logo/ibk.png'),
  카카오뱅크: require('../../assets/logo/kakao.png'),
  토스뱅크: require('../../assets/logo/toss.png'),
  케이뱅크: require('../../assets/logo/K.png'),
  우체국: require('../../assets/logo/post.png'),
  산업은행: require('../../assets/logo/san.png'),
  새마을금고: require('../../assets/logo/new.png'),
  부산은행: require('../../assets/logo/busan.png'),
  수협은행: require('../../assets/logo/sh.png'),
  신협중앙회: require('../../assets/logo/shinhyup.png'),
  아이엠뱅크: require('../../assets/logo/im.png'),
};

const AccountListScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const res = await api.get('/api/user/accounts', {
          headers: {Authorization: `Bearer ${token}`},
        });
        setAccounts(res.data);
      } catch (error) {
        console.error('❌ 계좌 목록 불러오기 실패:', error);
      }
    };

    fetchAccounts();
  }, []);

  const renderItem = ({item}: {item: Account}) => (
    <View style={styles.card}>
      <View style={styles.logoBox}>
        {bankLogos[item.bank] ? (
          <Image
            source={bankLogos[item.bank]}
            style={{width: 32, height: 32, resizeMode: 'contain'}}
          />
        ) : (
          <Text style={{fontSize: 24}}>🏦</Text>
        )}
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.bank}>{item.bank}</Text>
        <Text style={styles.account}>•••• {item.account_number.slice(-4)}</Text>
        <Text style={styles.date}>
          등록일: {moment(item.created_at).format('YYYY-MM-DD')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>내 계좌 목록</Text>
        <View style={{width: 24}} />
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item, index) => `${item.account_number}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{paddingHorizontal: 20, paddingTop: 10}}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AccountRegistration')}>
          <Text style={styles.addButtonText}>+ 계좌 추가하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AccountListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: {
    fontSize: 20,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    elevation: 2,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoBox: {
    flex: 1,
  },
  bank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  account: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
