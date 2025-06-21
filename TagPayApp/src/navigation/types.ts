export type RootStackParamList = {
  Intro: {url?: string} | undefined;
  Login: undefined;
  Main: undefined;
  AccountSetup: undefined;
  Password: undefined;
  NfcEntry: undefined;
  Biometric: {bank: string; account: string; amount: string};
  Processing: {bank: string; account: string; amount: string};
  Complete: {bank: string; account: string; amount: string};
  CardAdd: undefined;
  CardSetup: undefined;
};
