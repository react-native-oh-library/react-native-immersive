import { NativeModules, DeviceEventEmitter, Platform } from 'react-native'
import RNImmersive from './NativeRNImmersive'

const unSupportedError = __DEV__
  ? () => { throw new Error('[react-native-immersive] should not be called on iOS') }
  : () => {}

let isListenerEnabled = false

let emitterSubscriptions = [];

const Immersive = {
  on: () => RNImmersive.setImmersive(true),
  off: () => RNImmersive.setImmersive(false),
  setImmersive: (isOn) => RNImmersive.setImmersive(isOn),
  getImmersive: async () => RNImmersive.getImmersive(), // do not always match actual display state
  addImmersiveListener: (listener) => {
    const subscription = DeviceEventEmitter.addListener('@@IMMERSIVE_STATE_CHANGED', listener)
    emitterSubscriptions.push(subscription)
    if (isListenerEnabled) return
    isListenerEnabled = true
    RNImmersive.addImmersiveListener()
  },
  removeImmersiveListener: (listener) => {
    const index = emitterSubscriptions.findIndex(sub => sub.listener === listener)
    if (index !== -1) {
      emitterSubscriptions[index].remove()
      emitterSubscriptions.splice(index, 1)
    }
    // 当所有监听器都移除后，停止原生轮询
    if (emitterSubscriptions.length === 0) {
      isListenerEnabled = false
      RNImmersive.removeImmersiveListener()
    }
  }
}
export { Immersive }
export default Immersive
