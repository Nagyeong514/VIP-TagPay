import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Complete: {
    bank: string;
    account: string;
    amount: string;
  };
};

const ProcessingScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {bank, account, amount} = (route.params || {}) as {
    bank: string;
    account: string;
    amount: string;
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();

    const timer = setTimeout(() => {
      navigation.navigate('Complete', {bank, account, amount});
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.centerContainer}>
        <View style={styles.rippleWrapper}>
          {/* ✅ 고정된 두 줄 */}
          <View style={styles.staticRipple} />
          <View style={[styles.staticRipple, styles.staticRipple2]} />

          {/* ✅ 움직이는 애니메이션 줄 */}
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{scale: pulseAnim}],
              },
            ]}
          />

          {/* 중앙 검정 버튼 */}
          <View style={styles.processingButton}>
            <Image
              source={require('../../assets/icons/wallet.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.processingText}>
          <Text style={styles.processingTitle}>결제 중...</Text>
          <Text style={styles.processingSubtitle}>잠시만 기다려 주세요...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProcessingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  // ✅ 고정된 파장 2줄
  staticRipple: {
    position: 'absolute',
    width: 220,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#d1d5db',
    zIndex: 0,
  },
  staticRipple2: {
    width: 200,
    height: 100,
    borderRadius: 50,
  },

  // ✅ 애니메이션 되는 ripple
  ripple: {
    position: 'absolute',
    width: 240,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#d1d5db',
    zIndex: 0,
  },

  processingButton: {
    width: 180,
    height: 80,
    backgroundColor: '#000000',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  iconImage: {
    width: 52,
    height: 52,
  },

  processingText: {
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  processingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});
