// src/screens/AccountRegistrationScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/api';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface Bank {
  id: string;
  name: string;
  emoji: string;
}

const banks: Bank[] = [
  {id: '1', name: 'KB국민은행', emoji: '🏦'},
  {id: '2', name: '신한은행', emoji: '🏛️'},
  {id: '3', name: '우리은행', emoji: '🏪'},
  {id: '4', name: '하나은행', emoji: '🏢'},
  {id: '5', name: '신협중앙회', emoji: '🏦'},
  {id: '6', name: '농협은행', emoji: '🌾'},
  {id: '7', name: '기업은행', emoji: '🏭'},
  {id: '8', name: '수협은행', emoji: '🐟'},
  {id: '9', name: '새마을금고', emoji: '🏘️'},
  {id: '10', name: '아이엠뱅크', emoji: '🤝'},
  {id: '11', name: '우체국', emoji: '📮'},
  {id: '12', name: '카카오뱅크', emoji: '💛'},
  {id: '13', name: '토스뱅크', emoji: '💙'},
  {id: '14', name: '부산은행', emoji: '📱'},
  {id: '15', name: '케이뱅크', emoji: '🔵'},
  {id: '16', name: '산업은행', emoji: '⚙️'},
  {id: '17', name: '수출입은행', emoji: '🌍'},
  {id: '18', name: '중소기업은행', emoji: '🏪'},
  {id: '19', name: '지역농협', emoji: '🌱'},
  {id: '20', name: '산림조합', emoji: '🌲'},
  {id: '21', name: '상호저축은행', emoji: '💰'},
  {id: '22', name: '외환은행', emoji: '💱'},
];

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

type Step = 'bankSelection' | 'accountInput' | 'passwordInput' | 'success';
type RootStackParamList = {
  Main: undefined;
  // 필요하다면 다른 화면도 여기에 추가
};

const AccountRegistrationScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('bankSelection');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [searchText, setSearchText] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setCurrentStep('accountInput');
  };

  const handleNumberPress = (num: string) => {
    if (num === 'delete') {
      setAccountNumber(prev => prev.slice(0, -1));
    } else {
      setAccountNumber(prev => prev + num);
    }
  };
  const handlePinPress = async (num: string) => {
    if (num === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) return;

          await api.post(
            '/api/user/accounts',
            {
              bank: selectedBank?.name,
              account_number: accountNumber,
              pin: newPin,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setTimeout(() => {
            setCurrentStep('success');
          }, 500);
        } catch (error) {
          console.error('계좌 등록 실패:', error);
        }
      }
    }
  };

  const renderKeypad = (onPress: (key: string) => void) => {
    const keypadLayout = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['지움', '0', '확인'],
    ];

    const getKeyValue = (key: string) => {
      if (key === '지움') return 'delete';
      if (key === '확인') return 'confirm';
      return key;
    };

    return (
      <View style={styles.prettyKeypadContainer}>
        {keypadLayout.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.keypadRow}>
            {row.map(key => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => onPress(getKeyValue(key))}>
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderBankSelection = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.title}>다른금융계좌 등록</Text>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="은행검색"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <ScrollView style={styles.bankList} showsVerticalScrollIndicator={false}>
        <View style={styles.bankGrid}>
          {filteredBanks.map(bank => (
            <TouchableOpacity
              key={bank.id}
              style={styles.bankItem}
              onPress={() => handleBankSelect(bank)}>
              <View style={styles.bankLogo}>
                {bankLogos[bank.name] ? (
                  <Image
                    source={bankLogos[bank.name]}
                    style={{width: 28, height: 28, resizeMode: 'contain'}}
                  />
                ) : (
                  <Text style={styles.bankEmoji}>{bank.emoji}</Text>
                )}
              </View>
              <Text style={styles.bankName}>{bank.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderAccountInput = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('bankSelection')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.selectedBankCard}>
        <View style={styles.selectedBankInfo}>
          <View style={styles.selectedBankLogo}>
            {selectedBank && bankLogos[selectedBank.name] ? (
              <Image
                source={bankLogos[selectedBank.name]}
                style={{width: 36, height: 36, resizeMode: 'contain'}}
              />
            ) : (
              <Text style={styles.selectedBankEmoji}>
                {selectedBank?.emoji}
              </Text>
            )}
          </View>
          <Text style={styles.selectedBankName}>{selectedBank?.name}</Text>
        </View>
      </View>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>등록할 계좌번호 입력</Text>
        <View style={styles.accountNumberDisplay}>
          <Text style={styles.accountNumberText}>
            {accountNumber || '계좌번호를 입력해주세요'}
          </Text>
        </View>
      </View>
      <View style={styles.keypadContainer}>
        {renderKeypad(handleNumberPress)}
      </View>
      <View style={styles.bottomButton}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            accountNumber.length >= 10
              ? styles.nextButtonActive
              : styles.nextButtonDisabled,
          ]}
          disabled={accountNumber.length < 10}
          onPress={() => setCurrentStep('passwordInput')}>
          <Text
            style={[
              styles.nextButtonText,
              accountNumber.length >= 10
                ? styles.nextButtonTextActive
                : styles.nextButtonTextDisabled,
            ]}>
            다음
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderPasswordInput = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('accountInput')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.pinSection}>
        <Text style={styles.pinTitle}>간편비밀번호 4자리를 입력해주세요</Text>
        <View style={styles.pinDots}>
          {[0, 1, 2, 3].map(index => (
            <View
              key={index}
              style={[
                styles.pinDot,
                index < pin.length ? styles.pinDotFilled : styles.pinDotEmpty,
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.keypadContainer}>{renderKeypad(handlePinPress)}</View>
    </SafeAreaView>
  );
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const renderSuccess = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Image
            source={require('../../assets/icons/check.png')}
            style={{width: 80, height: 80, resizeMode: 'contain'}}
          />
        </View>
        <Text style={styles.successText}>계좌가 등록되었습니다!</Text>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            setCurrentStep('bankSelection');
            setSelectedBank(null);
            setAccountNumber('');
            setPin('');
            setSearchText('');
            navigation.navigate('Main'); // ✅ 메인으로 이동
          }}>
          <Text style={styles.completeButtonText}>완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  switch (currentStep) {
    case 'bankSelection':
      return renderBankSelection();
    case 'accountInput':
      return renderAccountInput();
    case 'passwordInput':
      return renderPasswordInput();
    case 'success':
      return renderSuccess();
    default:
      return renderBankSelection();
  }
};

const {width} = Dimensions.get('window');

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
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    position: 'absolute',
    right: 20,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    fontSize: 24,
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  bankList: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  bankItem: {
    width: (width - 40) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 5,
    marginVertical: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankEmoji: {
    fontSize: 20,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  selectedBankCard: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },
  selectedBankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedBankLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedBankEmoji: {
    fontSize: 24,
  },
  selectedBankName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  accountNumberDisplay: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    minHeight: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  accountNumberText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  keypadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyKey: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  bottomButton: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#007AFF',
  },
  nextButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextActive: {
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#adb5bd',
  },
  pinSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  pinDotEmpty: {
    backgroundColor: '#e9ecef',
  },
  pinDotFilled: {
    backgroundColor: '#007AFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 30,
  },
  successEmoji: {
    fontSize: 80,
  },
  successText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    minWidth: 120,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  prettyKeypadContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '90%',
  },
  key: {
    flex: 1,
    height: 80,
    marginHorizontal: 5,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  keyText: {
    fontSize: 22,
    color: '#000',
    fontWeight: '500',
  },
});

export default AccountRegistrationScreen;
