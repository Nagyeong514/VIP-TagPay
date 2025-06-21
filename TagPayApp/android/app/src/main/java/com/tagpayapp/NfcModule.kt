package com.tagpayapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class NfcModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "NfcModule"

  @ReactMethod
  fun getLatestNfcUrl(promise: Promise) {
    val url = MainActivity.latestNfcUrl
    if (url != null) {
      promise.resolve(url)
    } else {
      promise.reject("NO_URL", "NFC URL이 아직 없음")
    }
  }
}