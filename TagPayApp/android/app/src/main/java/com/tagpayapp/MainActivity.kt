package com.tagpayapp

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  companion object {
    var latestNfcUrl: String? = null
  }

  override fun getMainComponentName(): String = "TagPayApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d("NFC_DEBUG", "🚀 onCreate called")
    handleNfcIntent(intent)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    Log.d("NFC_DEBUG", "🔥 onNewIntent called")
    intent?.let { handleNfcIntent(it) }
  }

  private fun handleNfcIntent(intent: Intent) {
    Log.d("NFC_DEBUG", "📥 intent.action = ${intent.action}")
    val data: Uri? = intent.data
    Log.d("NFC_DEBUG", "🔍 intent.data = $data")

    if (data != null) {
      val url = data.toString()
      latestNfcUrl = url
      Log.d("NFC_DEBUG", "🌐 URL from NFC = $url")

      val reactContext = (application as ReactApplication)
        .reactNativeHost
        .reactInstanceManager
        .currentReactContext

      if (reactContext != null) {
        val params = Arguments.createMap()
        params.putString("nfcUrl", url)
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("NFC_TAG_DETECTED", params)

        Log.d("NFC_DEBUG", "✅ JS 이벤트 전송 완료: NFC_TAG_DETECTED ($url)")
      } else {
        Log.e("NFC_DEBUG", "❌ ReactContext is null. JS로 이벤트 못 보냄")
      }
    } else {
      Log.e("NFC_DEBUG", "❌ intent.data is null — NFC URL 정보가 전달되지 않음")
    }
  }
}