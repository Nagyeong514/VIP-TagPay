import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardTypeOptions,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import api from '../../constants/api'; // ✅ axios → api import

type RootStackParamList = {
  Login: undefined;
};

const SignUpScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    const {name, age, email, password, confirmPassword} = formData;

    if (!name || !age || !email || !password || !confirmPassword) {
      Alert.alert('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await api.post('/api/auth/register', {
        name,
        age: parseInt(age),
        email,
        password,
      });

      Alert.alert('회원가입 성공!');
      navigation.navigate('Login');
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        '회원가입 실패',
        err.response?.data?.message || '서버 오류가 발생했습니다.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.formContainer}>
        <View style={styles.headerWithBack}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerSection}>
            <Text style={styles.screenTitle}>회원가입</Text>
            <Text style={styles.screenSubtitle}>
              지금 Tag Pay에 가입하세요!
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollForm}
          showsVerticalScrollIndicator={false}>
          <View style={styles.formFields}>
            {[
              {label: '이름', key: 'name', placeholder: '이름을 입력하세요'},
              {
                label: '나이',
                key: 'age',
                placeholder: '나이를 입력하세요',
                keyboardType: 'numeric',
              },
              {
                label: '이메일',
                key: 'email',
                placeholder: 'example@domain.com',
                keyboardType: 'email-address',
              },
              {
                label: '비밀번호',
                key: 'password',
                placeholder: '비밀번호를 설정하세요',
                secure: true,
              },
              {
                label: '비밀번호 확인',
                key: 'confirmPassword',
                placeholder: '비밀번호를 다시 입력하세요',
                secure: true,
              },
            ].map((input, index) => (
              <View key={index} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{input.label}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={input.placeholder}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={input.keyboardType as KeyboardTypeOptions}
                  secureTextEntry={input.secure}
                  value={formData[input.key as keyof typeof formData]}
                  onChangeText={text => updateFormData(input.key, text)}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRegister}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>계정 생성</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
  formContainer: {flex: 1, paddingHorizontal: 24, paddingTop: 32},
  scrollForm: {flex: 1},
  headerWithBack: {marginBottom: 24},
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {fontSize: 24, color: '#000000'},
  headerSection: {marginBottom: 32},
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  screenSubtitle: {fontSize: 16, color: '#6b7280'},
  formFields: {gap: 24},
  inputGroup: {gap: 8},
  inputLabel: {fontSize: 16, fontWeight: '500', color: '#000000'},
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
  bottomButtonContainer: {paddingVertical: 24},
  primaryButton: {
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {fontSize: 18, fontWeight: '600', color: '#ffffff'},
});
