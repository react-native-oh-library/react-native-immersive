> Template version: v0.4.0

<p align="center">
  <h1 align="center"> <code>react-native-immersive</code> </h1>
</p>




This project is based on [react-native-immersive](https://github.com/mockingbot/react-native-immersive)。

This third-party library has been migrated to Gitcode and is now available for direct download from npm, the new package name is: `@react-native-ohos/react-native-immersive`, The version correspondence details are as follows:

|Name| Version | Release Information | Supported RN Version |Supported Autolink|Compile API Version|Community Baseline Version|npm Address|
|-------|-------|-----| ---------- |---------- |---------- |---------- |---------- |
|@react-native-ohos/react-native-immersive| ~2.2.0 | [Github Releases](https://github.com/react-native-oh-library/react-native-immersive/releases) | 0.82.*    |Yes|API12+|2.0.0 |[Npm Address](https://www.npmjs.com/package/@react-native-ohos/react-native-immersive)|
|@react-native-ohos/react-native-immersive| ~2.1.0 | [ Github Releases](https://github.com/react-native-oh-library/react-native-immersive/releases) | 0.72.* / 0.77.* | No|API12+| 2.0.0 |[Npm Address](https://www.npmjs.com/package/@react-natve-ohos/react-native-immersive)|

## 1. Installation and Usage



<!-- tabs:start -->

#### **npm**

```bash
npm install @react-native-ohos/react-native-immersive
```

#### **yarn**

```bash
yarn add @react-native-ohos/react-native-immersive
```

<!-- tabs:end -->

The following code shows the basic use scenario of the repository:

> [!WARNING] The name of the imported repository remains unchanged.

```js
import React, { Component } from 'react'
import { AppRegistry, StyleSheet, Text, View, Button, TextInput, Alert, Modal } from 'react-native'
import { Immersive } from 'react-native-immersive'

class testReactNative extends Component {
  constructor (props) {
    super(props)
    
    Immersive.getImmersive().then((immersiveState) => {
        console.log('init [getImmersiveState]', immersiveState)
        this.setState({ immersiveState,isImmersive: immersiveState.isImmersiveOn })
        if(immersiveState.isImmersiveOn){
          Immersive.on()
        }
      }).catch((err) => {
        console.error('[getImmersiveState] error', err)
   })

    this.setImmersiveOn = () => {
      let startTime = Date.now();
      Immersive.on()
      let endTime = Date.now();
      console.log("react-native-immersive on time:", endTime - startTime, "ms");
      this.setState({ isImmersive: true })
    }
    this.setImmersiveOff = () => {
      let startTime = Date.now();
      Immersive.off()
      let endTime = Date.now();
      console.log("react-native-immersive off time:", endTime - startTime, "ms");
      this.setState({ isImmersive: false })
    }
    this.setImmersiveTrue = () => {
      let startTime = Date.now();
      Immersive.setImmersive(true)
      let endTime = Date.now();
      console.log("react-native-immersive setImmersive time:", endTime - startTime, "ms");
      this.setState({ isImmersive: true })
    }
    this.setImmersiveFalse = () => {
      Immersive.setImmersive(false)
      this.setState({ isImmersive: false })
    }
    this.addImmersiveListener = () => {
      if(!this.state.isAddListener){
        console.log("Immersive---------> addImmersiveListener",this.restoreImmersive);
        let startTime = Date.now();
        Immersive.addImmersiveListener(this.restoreImmersive)
        let endTime = Date.now();
        console.log("react-native-immersive addImmersiveListener time:", endTime - startTime, "ms");
        this.setState({ isAddListener: true })
      }
    }
    this.removeImmersiveListener = () => {
      if(this.state.isAddListener){
        console.log("Immersive---------> removeImmersiveListener",this.restoreImmersive);
        let startTime = Date.now();
        Immersive.removeImmersiveListener(this.restoreImmersive)
        let endTime = Date.now();
        console.log("react-native-immersive removeImmersiveListener time:", endTime - startTime, "ms");
        this.setState({ isAddListener: false })
      }
    }

  
    this.getImmersiveState = () => {
      let startTime = Date.now();
      Immersive.getImmersive().then((immersiveState) => {
        let endTime = Date.now();
        console.log("react-native-immersive getImmersive time:", endTime - startTime, "ms");
        console.log('[getImmersiveState]', immersiveState)
        this.setState({ immersiveState })
      }).catch((err) => {
        console.error('[getImmersiveState] error', err)
      })
    }

    this.restoreImmersive = () => {
      Alert.alert("Callback","The registered listener callback has been invoked")
    }

    this.state = {
      isAddListener: false,
      isImmersive: false,
      isRestoreImmersive: true,
      immersiveState: null
    }
  }

  render () {
    const { isImmersive, immersiveState } = this.state
    return (
      <View style={{margin: 16}}>
            <Button onPress={this.addImmersiveListener} title="addImmersiveListener" />
            <View style={{ marginTop: 10, marginBottom: 10 }}>
                <Button style={{marginTop: 10, marginBottom: 10}} onPress={this.removeImmersiveListener} title="removeImmersiveListener" />
            </View>
            <Button onPress={isImmersive ? this.setImmersiveOff : this.setImmersiveOn} title="on/off" />
            <Text style={styles.text}>isImmersive: {JSON.stringify(isImmersive)}</Text>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <Button onPress={isImmersive ? this.setImmersiveFalse : this.setImmersiveTrue} title="setImmersive" />
            <Text style={styles.text}>isImmersive: {JSON.stringify(isImmersive)}</Text>
            </View>
            <Button onPress={this.getImmersiveState} title="getImmersive" />
            <Text style={styles.text}>immersiveState: {JSON.stringify(immersiveState)}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  containerTest: { alignItems: 'stretch', justifyContent: 'center', flex: 1 },
  text: { textAlign: 'center', fontSize: 14 }
})

export default testReactNative;
AppRegistry.registerComponent('testReactNative', () => testReactNative)
```

## 2. Link

|                                      | Is supported autolink  | Supported RN Version |
|--------------------------------------|-----------------------|----------------------|
| ~2.2.0                               |  Yes              |  0.82     |
| ~2.1.0                               |  No                   |  0.72/0.77                |

Using AutoLink need to be configured according to this document, Autolink Framework Guide Documentation: https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

If the version you use supports Autolink and the project has been connected to Autolink, skip the ManualLink configuration.

<details>
  <summary>ManualLink: this step is a guide to manually configure native dependencies.</summary>

First, use DevEco Studio to open the HarmonyOS project `harmony` in the project directory.

### 2.1. Overrides RN SDK

```json
{
  ...
  "overrides": {
    "@rnoh/react-native-openharmony" : "./react_native_openharmony"
  }
}
```

### 2.2. Introducing Native Code

Open `entry/oh-package.json5` file and add the following dependencies:

```json
"dependencies": {
   ...
    "@rnoh/react-native-openharmony": "file:../react_native_openharmony",
    "@react-native-ohos/react-native-immersive": "file:../../node_modules/@react-native-ohos/react-native-immersive/harmony/immersive.har",
  }
```

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Method 2: Directly link to the source code.

> [!TIP] For details, see [Directly Linking Source Code](./link-source-code.md).

### 2.3. Configuring CMakeLists and Introducing RNCVideoPackage

Open `entry/src/main/cpp/CMakeLists.txt` and add the following code:

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-immersive/src/main/cpp" ./rnoh_immersive)

# RNOH_BEGIN: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_immersive)
# RNOH_END: manual_package_linking_2
```

Open `entry/src/main/cpp/PackageProvider.cpp` and add the following code:

```diff
#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
#include "SamplePackage.h"
+ #include "RNImmersivePackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<RNOHGeneratedPackage>(ctx),
      std::make_shared<SamplePackage>(ctx),
+     std::make_shared<RNImmersivePackage>(ctx)
    };
}
```

### 2.4. Introducing RNCVideoPackage to ArkTS

Open the `entry/src/main/ets/RNPackagesFactory.ts` file and add the following code:

```diff
  ...
+ import { RNImmersivePackage } from '@react-native-ohos/react-native-immersive/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new SamplePackage(ctx),
+   new RNImmersivePackage(ctx)
  ];
}
```
</details>

### 2.5. Running

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Then build and run the code.

## 3. Constraints

### 3.1. Compatibility

To use this repository, you need to use the correct React-Native and RNOH versions. In addition, you need to use DevEco Studio and the ROM on your phone.

Verified in the following versions.

1. RNOH: 0.72.79; SDK: HarmonyOS 5.1.1 Release SDK; IDE: DevEco Studio 5.1.1 Release; ROM: 5.0.1.120;
2. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
3. RNOH: 0.82.7;  SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1.260; ROM: 6.0.0.130 SP15;

### 3.2. API requirements

> [!TIP] All versions of the current third-party libraries have implemented version isolation, supporting compilation in `API12+` projects and execution on `API12+` ROMs.

> [!TIP] The following features depend on specific API versions. Compiling the project with an API version lower than specified or running the ROM with an API version lower than specified may result in limited functionality.

1. All versions introduced [isImmersiveLayout](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkts-apis-window-window#isimmersivelayout20), Implemented the functionality to determine whether the current window is immersive. This API requires compilation in a project that supports `API12+` and must run on a ROM that supports `API20+` to take effect.


## 4. Static Methods

> [!tip] The **Platform** column indicates the platform where the properties are supported in the original third-party library.

> [!tip] If the value of **HarmonyOS Support** is **yes**, it means that the HarmonyOS platform supports this property; **no** means the opposite; **partially** means some capabilities of this property are supported. The usage method is the same on different platforms and the effect is the same as that of Android.

| Name                      | Description             | Type     | Required | Platform | HarmonyOS Support |
| ------------------------- | ----------------------- | -------- | -------- | -------- | ----------------- |
| `on()`                    | Set to full screen      | function | No       | Android  | yes               |
| `off()`                   | Turn off full screen    | function | No       | Android  | yes               |
| `setImmersive()`          | Set to full-screen mode | function | No       | Android  | yes               |
| `getImmersive()`          | Get full-screen status  | function | No       | Android  | yes               |
| `addImmersiveListener()`  | Add listening           | function | No       | Android  | yes               |
| removeImmersiveListener() | Cancel monitoring       | function | No       | Android  | yes               |

## 5. Known Issues

## 6. Others

## 7. License

This project is licensed under  [The MIT License (MIT)](https://github.com/mockingbot/react-native-immersive/blob/master/LICENSE) .