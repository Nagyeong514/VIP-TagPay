#설치모듈 
npm install --save react-native-nfc-manager

#Android 쓴다면 다음 권한 추가 
android/app/src/main/AndroidManifest.xml애
->  <uses-permission android:name="android.permission.NFC" /> 추가
그리고 <application> 태그 내부에
-> <uses-feature android:name="android.hardware.nfc" android:required="true" />

