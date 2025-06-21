import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import api from '../../constants/api';

type RootStackParamList = {
  Main: undefined;
};

const PasswordSetupScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async () => {
    if (password.length < 4) return Alert.alert('4자리 이상 입력하세요.');
    if (password !== confirm)
      return Alert.alert('비밀번호가 일치하지 않습니다.');

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('로그인이 필요합니다.');
      await api.post(
        '/api/user/password',
        {password},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      Alert.alert('✅ 비밀번호 설정 완료');
      navigation.navigate('Main');
    } catch (err) {
      console.error(err);
      Alert.alert('❌ 저장 실패', '서버와 통신 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.inner}>
        <Text style={styles.title}>결제 비밀번호 설정</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호 입력"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>설정 완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PasswordSetupScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  inner: {padding: 24, marginTop: 100},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 32},
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontSize: 18, fontWeight: '600'},
});
