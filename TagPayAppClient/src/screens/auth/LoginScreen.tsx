import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/api';

type RootStackParamList = {
  Main: undefined;
  SignUp: undefined;
  NfcEntry: {bank: string; account: string; amount: string};
};

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {fromNfc, nfcUrl} = (route.params || {}) as {
    fromNfc?: boolean;
    nfcUrl?: string;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('로그인 실패', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const res = await api.post('/api/auth/login', {
        email,
        password,
      });

      await AsyncStorage.setItem('token', res.data.token);
      Alert.alert('✅ 로그인 성공');

      if (fromNfc && nfcUrl) {
        const query = nfcUrl.split('?')[1];
        const params = Object.fromEntries(
          query.split('&').map((s: string) => s.split('=')),
        );
        const bank = params.b || '';
        const account = params.a || '';
        const amount = params.m || '';
        navigation.replace('NfcEntry', {bank, account, amount});
      } else {
        navigation.replace('Main');
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        '❌ 로그인 실패',
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          <View style={styles.headerSection}>
            <Text style={styles.screenTitle}>환영합니다!</Text>
            <Text style={styles.screenSubtitle}>계정에 로그인 하세요</Text>
          </View>

          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이메일</Text>
              <TextInput
                style={styles.textInput}
                placeholder="example@domain.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <TextInput
                style={styles.textInput}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, styles.formButton]}
              onPress={handleLogin}
              activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>로그인</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>
            계정이 없으신가요?{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('SignUp')}>
              회원가입
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  formContent: {
    flex: 1,
  },
  headerSection: {
    marginBottom: 32,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  formFields: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  formButton: {
    marginTop: 16,
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
  bottomSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 16,
    color: '#6b7280',
  },
  linkText: {
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
