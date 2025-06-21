// src/screens/MyPage.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import api from '../../constants/api';

type RootStackParamList = {
  Login: undefined;
};

interface UserInfo {
  name: string;
  email: string;
  age?: number;
  created_at: string;
}

const MyPage = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<UserInfo | null>(null);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert('👋 로그아웃 되었습니다.');
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await api.get('/api/user/profile', {
          headers: {Authorization: `Bearer ${token}`},
        });
        setUser(res.data);
      } catch (err) {
        console.error('❌ 유저 정보 불러오기 실패:', err);
      }
    };

    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Page</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Image
            source={require('../../assets/icons/profile.png')}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user?.name || '이름 없음'}</Text>
          <Text style={styles.userEmail}>{user?.email || '이메일 없음'}</Text>
          <Text style={styles.userJoin}>
            가입일: {user?.created_at?.slice(0, 10) || '---'}
          </Text>
        </View>

        {/* 향후 메뉴 리스트 추가 가능 */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
    marginTop: 180,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  userJoin: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 170,
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    width: '100%',
    paddingTop: 24,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});
