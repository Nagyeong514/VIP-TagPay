import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Processing: {
    bank: string;
    account: string;
    amount: string;
  };
};

const PasswordScreen = () => {
  const [input, setInput] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {bank, account, amount} = (route.params || {}) as {
    bank: string;
    account: string;
    amount: string;
  };

  const handleInput = (value: string) => {
    if (input.length < 6) {
      setInput(prev => prev + value);
    }
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    if (input === '123456') {
      navigation.navigate('Processing', {bank, account, amount}); // ✅ 수정 완료
    } else {
      Alert.alert('비밀번호 오류', '비밀번호가 일치하지 않습니다.');
      setInput('');
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[...Array(6)].map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              {backgroundColor: idx < input.length ? '#000' : '#e5e7eb'},
            ]}
          />
        ))}
      </View>
    );
  };

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['지움', '0', '확인'],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.centerBox}>
        <Text style={styles.title}>비밀번호 입력</Text>
        {renderDots()}

        <View style={styles.keypad}>
          {keypad.map((row, rowIndex) => (
            <View style={styles.keypadRow} key={rowIndex}>
              {row.map(key => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => {
                    if (key === '지움') {
                      handleDelete();
                    } else if (key === '확인') {
                      handleConfirm();
                    } else {
                      handleInput(key);
                    }
                  }}>
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  keypad: {
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  key: {
    flex: 1,
    height: 60,
    marginHorizontal: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  keyText: {
    fontSize: 20,
    color: '#000000',
  },
});
