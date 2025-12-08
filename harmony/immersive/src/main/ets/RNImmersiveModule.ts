/**
 * MIT License
 *
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// import Logger from './Logger';
import { AnyThreadTurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "./generated/ts"

import { common, UIAbility } from '@kit.AbilityKit';

import { BusinessError } from '@kit.BasicServicesKit';
import { hilog } from '@kit.PerformanceAnalysisKit';


import window from '@ohos.window';



export class RNImmersiveModule extends AnyThreadTurboModule implements TM.RNImmersive.Spec{

  private uiAbilityContext: common.UIAbilityContext | null = null;

  private currentWindow: any = null;
  private isListening: boolean = false;

  private pollingInterval: any = null;
  private lastImmersiveState: boolean | null = null;

  // 构造函数接收上下文
  constructor(ctx: any) {
    super(ctx);
    // ctx 中包含了 UIAbilityContext
    this.uiAbilityContext = (ctx as any)?.uiAbilityContext || null;
    console.log('[RNImmersive] Module initialized, context available:', !!this.uiAbilityContext);
  }


  private async getCurrentWindow(): Promise<any | null> {
    if (!this.uiAbilityContext) {
      console.error('[RNImmersive] Context is not available');
      return null;
    }

    try {
      // 方法1：尝试直接使用 window.getLastWindow (API 9+)
      // 注意：这里使用 any 类型绕过类型检查
      const win = await (window as any).getLastWindow(this.uiAbilityContext);
      console.log('[RNImmersive] Successfully got window via window.getLastWindow');
      return win;
    } catch (error) {
      console.error('[RNImmersive] Method 1 failed:', error);

      // 方法2：尝试从 context 的属性中查找窗口管理器
      try {
        // 在 HarmonyOS 中，windowManager 可能在不同的属性中
        const winMgr = (this.uiAbilityContext as any).windowManager ||
        (this.uiAbilityContext as any)._windowManager ||
        (this.uiAbilityContext as any).manager;

        if (winMgr) {
          const win = await winMgr.getLastWindow();
          console.log('[RNImmersive] Successfully got window via alternative method');
          return win;
        }
      } catch (error2) {
        console.error('[RNImmersive] Method 2 failed:', error2);
      }

      return null;
    }
  }



  // 修改 getCurrentImmersiveState 方法，添加调试信息
  // 使用正确的方法获取沉浸式状态
  private async getCurrentImmersiveState(): Promise<boolean> {
    try {
      const win = await this.getCurrentWindow();
      if (!win) {
        console.warn('[RNImmersive] Window not available');
        return false;
      }

      console.log('[RNImmersive] Getting immersive state using available methods...');

      // 方法1：直接使用 isImmersiveLayout 方法
      if (typeof win.isImmersiveLayout === 'function') {
        try {
          const isImmersive = await win.isImmersiveLayout();
          console.log('[RNImmersive] isImmersiveLayout result:', isImmersive);
          return isImmersive;
        } catch (error) {
          console.warn('[RNImmersive] isImmersiveLayout failed:', error);
        }
      }

      // 方法2：使用 getImmersiveModeEnabledState
      if (typeof win.getImmersiveModeEnabledState === 'function') {
        try {
          const state = await win.getImmersiveModeEnabledState();
          console.log('[RNImmersive] getImmersiveModeEnabledState result:', state);
          // 根据返回值判断，可能需要调整
          return state === true || state === 1;
        } catch (error) {
          console.warn('[RNImmersive] getImmersiveModeEnabledState failed:', error);
        }
      }

      // 方法3：使用 getWindowProperties 并检查属性
      if (typeof win.getWindowProperties === 'function') {
        try {
          const properties = await win.getWindowProperties();
          console.log('[RNImmersive] Window properties:', properties);

          // 检查属性中是否有沉浸式相关的信息
          if (properties && typeof properties === 'object') {
            // 尝试不同的属性名
            const possibleKeys = [
              'isImmersive', 'immersive', 'fullScreen', 'isFullScreen',
              'systemBarEnabled', 'systemBarVisible', 'layoutFullScreen'
            ];

            for (const key of possibleKeys) {
              if (key in properties) {
                const value = properties[key];
                console.log(`[RNImmersive] Found property ${key}:`, value);

                if (key === 'systemBarEnabled' || key === 'systemBarVisible') {
                  // 系统栏启用 = 非沉浸式
                  return value === false || value === 0 || value === 'false';
                } else {
                  // 其他属性，直接返回布尔值
                  return !!value;
                }
              }
            }
          }
        } catch (error) {
          console.warn('[RNImmersive] getWindowProperties failed:', error);
        }
      }

      // 方法4：组合检查全屏和系统栏状态
      try {
        // 检查全屏状态
        let isFullScreen = false;

        // 尝试使用 getWindowProperties 获取全屏状态
        if (typeof win.getWindowProperties === 'function') {
          const props = await win.getWindowProperties();
          isFullScreen = props?.layoutFullScreen || props?.isFullScreen || false;
        }

        // 检查系统栏状态
        let isSystemBarHidden = false;

        // 尝试使用 getWindowSystemBarProperties
        if (typeof win.getWindowSystemBarProperties === 'function') {
          const barProps = await win.getWindowSystemBarProperties();
          console.log('[RNImmersive] System bar properties:', barProps);

          // 判断系统栏是否隐藏
          if (barProps && typeof barProps === 'object') {
            // 检查是否有 enabled 或 visible 属性
            isSystemBarHidden = !barProps.enabled || !barProps.visible || false;
          }
        }

        console.log(`[RNImmersive] Combined check - fullScreen: ${isFullScreen}, systemBarHidden: ${isSystemBarHidden}`);

        // 沉浸式 = 全屏 + 系统栏隐藏
        return isFullScreen && isSystemBarHidden;

      } catch (error) {
        console.warn('[RNImmersive] Combined check failed:', error);
      }

      // 所有方法都失败了，返回默认值
      console.warn('[RNImmersive] All methods failed, returning default false');
      return false;

    } catch (error) {
      console.error('[RNImmersive] Error getting immersive state:', error);
      return false;
    }
  }

  async setImmersive(on: boolean) {
    console.log("setImmersive0000000000000000000000000==" + on);
    // 1. 获取当前窗口
    const win = await this.getCurrentWindow();
    if (!win) {
      console.error('[RNImmersive] Cannot get window, operation failed');
      return;
    }

    // 2. 设置沉浸式状态
    try {
      if (on) {
        // 开启沉浸式：隐藏系统栏 + 全屏
        await win.setWindowSystemBarEnable([]);
        //await win.setWindowLayoutFullScreen(true);
        await win.setFullScreen(true);

        console.log('[RNImmersive] Immersive mode enabled');
      } else {
        // 关闭沉浸式：显示系统栏 + 退出全屏

        await win.setWindowSystemBarEnable(['status', 'navigation']);
        //await win.setWindowLayoutFullScreen(false);
        await win.setFullScreen(false);
        console.log('[RNImmersive] Immersive mode disabled');
      }
    } catch (error: any) {
      console.error('[RNImmersive] Error setting immersive:', JSON.stringify(error));
    }
  }


  async  getImmersive():Promise<{isImmersiveOn: boolean}> {
    let promise: Promise<{isImmersiveOn: boolean}> = new Promise(async (resolve, reject) => {


      try {
        const state = await this.getCurrentImmersiveState();
        console.log('[RNImmersive] Current immersive state:', state);

        resolve({isImmersiveOn:state});

      } catch (error) {
        console.error('[RNImmersive] Error in getImmersive:', error);
        resolve({ isImmersiveOn: false }); // 注意：这里用 resolve 而不是 reject
      }

      console.log("jk------------------> getImmersive 已调用 2");
    });
    console.log("jk------------------> getImmersive 已调用 1");




    return promise;
  }

  async getImmersive00(): Promise<{ isImmersive: boolean }>{
    console.log("[RNImmersive] getImmersive() called00");
    // 显式创建并返回 Promise
    return new Promise(async (resolve, reject) => {
      try {
        const state = await this.getCurrentImmersiveState();
        console.log('[RNImmersive] Current immersive state:', state);

        resolve({
          isImmersive: state
        });

      } catch (error) {
        console.error('[RNImmersive] Error in getImmersive:', error);
        resolve({ isImmersive: false }); // 注意：这里用 resolve 而不是 reject
      }
    });
  }


  async addImmersiveListener() {
    console.log("[RNImmersive] addImmersiveListener called");

    // 保存回调函数

    // 如果还没开始监听，开始监听
    if (!this.isListening) {
      await this.startListening();
    }

    return Promise.resolve();
  }




  // 开始监听
  private async startListening(): Promise<void> {
    try {
      const win = await this.getCurrentWindow();
      if (!win) {
        console.error('[RNImmersive] Cannot get window for listening');
        return;
      }

      this.currentWindow = win;
      this.isListening = true;

      // 1. 监听窗口大小变化（这个是支持的）
      win.on('windowSizeChange', async () => {
        console.log('[RNImmersive] windowSizeChange detected');
        await this.checkAndNotifyStateChange();
      });
      console.log('[RNImmersive] Registered windowSizeChange listener');

      // 2. 启动轮询机制，定期检查系统栏状态
      this.startPollingForSystemBarChanges();

      // 3. 初始化状态
      this.lastImmersiveState = await this.getCurrentImmersiveState();

      console.log('[RNImmersive] Started listening to immersive changes');

    } catch (error) {
      console.error('[RNImmersive] Error starting listeners:', error);
    }
  }

  // 获取沉浸式状态
  // private async getCurrentImmersiveState(): Promise<boolean> {
  //   try {
  //     const win = await this.getCurrentWindow();
  //     if (!win) {
  //       return false;
  //     }
  //
  //     // 1. 获取全屏状态
  //     const isFullScreen = await new Promise<boolean>((resolve) => {
  //       win.isWindowLayoutFullScreen((err: BusinessError, value: boolean) => {
  //         if (err?.code) {
  //           resolve(false);
  //         } else {
  //           resolve(value);
  //         }
  //       });
  //     });
  //
  //     // 2. 获取系统栏状态
  //     const sysBarState = await new Promise<any>((resolve) => {
  //       win.getWindowSystemBarStatus((err: BusinessError, value: any) => {
  //         if (err?.code) {
  //           resolve({ isEnable: [true, true] });
  //         } else {
  //           resolve(value);
  //         }
  //       });
  //     });
  //
  //     // 3. 判断是否为沉浸式状态
  //     const isImmersive = isFullScreen &&
  //       sysBarState?.isEnable &&
  //       sysBarState.isEnable.length === 0;
  //
  //     return isImmersive;
  //
  //   } catch (error) {
  //     console.error('[RNImmersive] Error getting immersive state:', error);
  //     return false;
  //   }
  // }

  // 轮询系统栏变化
  private startPollingForSystemBarChanges(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // 每 300ms 检查一次系统栏状态
    this.pollingInterval = setInterval(async () => {
      try {
        if (this.currentWindow ) {
          await this.checkAndNotifyStateChange();
        }
      } catch (error) {
        // 忽略轮询错误
      }
    }, 300);

    console.log('[RNImmersive] Started polling for system bar changes');
  }

  // 检查状态变化并通知
  private async checkAndNotifyStateChange(): Promise<void> {
    try {
      const currentState = await this.getCurrentImmersiveState();

      // 如果状态发生变化
      if (this.lastImmersiveState !== currentState) {
        console.log('[RNImmersive] Immersive state changed:', {
          from: this.lastImmersiveState,
          to: currentState
        });

        this.lastImmersiveState = currentState;
        //await this.notifyListeners();

        this.ctx.rnInstance.emitDeviceEvent('@@IMMERSIVE_STATE_CHANGED',{data:"change"});
      }
    } catch (error) {
      console.error('[RNImmersive] Error checking state change:', error);
    }
  }


}

