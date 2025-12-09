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
import { AnyThreadTurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "./generated/ts"
import { common } from '@kit.AbilityKit';
import window from '@ohos.window';

export class RNImmersiveModule extends AnyThreadTurboModule implements TM.RNImmersive.Spec {
  private uiAbilityContext: common.UIAbilityContext | null = null;
  private currentWindow: any = null;
  private isListening: boolean = false;
  private pollingInterval: any = null;
  private lastImmersiveState: boolean | null = null;

  constructor(ctx: any) {
    super(ctx);
    this.uiAbilityContext = (ctx as any)?.uiAbilityContext || null;
    console.log('[RNImmersive] Module initialized, context available:', !!this.uiAbilityContext);
  }

  // =============================  TurboModule 接口 start =============================

  async setImmersive(on: boolean) {
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
        await win.setFullScreen(true);
        console.log('[RNImmersive] Immersive mode enabled');
      } else {
        // 关闭沉浸式：显示系统栏 + 退出全屏
        await win.setWindowSystemBarEnable(['status', 'navigation']);
        await win.setFullScreen(false);
        console.log('[RNImmersive] Immersive mode disabled');
      }
    } catch (error: any) {
      console.error('[RNImmersive] Error setting immersive:', JSON.stringify(error));
    }
  }

  async getImmersive(): Promise<{ isImmersiveOn: boolean }> {
    let promise: Promise<{ isImmersiveOn: boolean }> = new Promise(async (resolve, reject) => {
      try {
        const state = await this.getCurrentImmersiveState();
        console.log('[RNImmersive] Current immersive state:', state);
        resolve({ isImmersiveOn: state });
      } catch (error) {
        resolve({ isImmersiveOn: false });
      }
    });
    return promise;
  }

  async addImmersiveListener() {
    console.log("[RNImmersive] addImmersiveListener called");
    // 如果还没开始监听，开始监听
    if (!this.isListening) {
      await this.startListening();
    }
  }

  removeImmersiveListener() {
    console.log("[RNImmersive] removeImmersiveListener called");
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.isListening = false;
    }
  }

  // =============================  TurboModule 接口 end =============================

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
      // 2. 启动轮询机制，定期检查系统栏状态
      this.startPollingForSystemBarChanges();
      // 3. 初始化状态
      this.lastImmersiveState = await this.getCurrentImmersiveState();
    } catch (error) {
      console.error('[RNImmersive] Error starting listeners:', error);
    }
  }

  // 轮询系统栏变化
  private startPollingForSystemBarChanges(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    // 每 300ms 检查一次系统栏状态
    this.pollingInterval = setInterval(async () => {
      try {
        if (this.currentWindow) {
          await this.checkAndNotifyStateChange();
        }
      } catch (error) {
        console.error('[RNImmersive] Error 轮询:', error);
      }
    }, 300);
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
        this.ctx.rnInstance.emitDeviceEvent('@@IMMERSIVE_STATE_CHANGED', null);
      }
    } catch (error) {
      console.error('[RNImmersive] Error checking state change:', error);
    }
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
      console.error('[RNImmersive] getLastWindow failed:', error);
    }
  }

  private async getCurrentImmersiveState(): Promise<boolean> {
    try {
      const win = await this.getCurrentWindow();
      if (!win) {
        console.warn('[RNImmersive] Window not available');
        return false;
      }
      const isImmersive = await win.isImmersiveLayout();
      console.log('[RNImmersive] isImmersiveLayout result:', isImmersive);
      return isImmersive;
    } catch (error) {
      console.error('[RNImmersive] Error getting immersive state:', error);
      return false;
    }
  }

}