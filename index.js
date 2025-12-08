import { NativeModules, DeviceEventEmitter, Platform } from 'react-native'
//const { RNImmersive } = NativeModules
import RNImmersive from './NativeRNImmersive'

const unSupportedError = __DEV__
  ? () => { throw new Error('[react-native-immersive] should not be called on iOS') }
  : () => {}

let isListenerEnabled = false

let emitterSubscription=null;

const Immersive = {
  on: () => RNImmersive.setImmersive(true),
  off: () => RNImmersive.setImmersive(false),
  setImmersive: (isOn) => RNImmersive.setImmersive(isOn),
  getImmersive: async () => RNImmersive.getImmersive(), // do not always match actual display state
  addImmersiveListener: (listener) => {
  emitterSubscription=  DeviceEventEmitter.addListener('@@IMMERSIVE_STATE_CHANGED', listener)
    if (isListenerEnabled) return
    isListenerEnabled = true
    RNImmersive.addImmersiveListener()
  },
  removeImmersiveListener: (listener) => {
    if(emitterSubscription!=null){
      emitterSubscription.remove();
      console.log("emitterSubscription==remove");
    }
 //DeviceEventEmitter.removeListener('@@IMMERSIVE_STATE_CHANGED', listener)
  }
}
export { Immersive }
export default Immersive
