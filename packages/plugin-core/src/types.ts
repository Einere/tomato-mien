import type { ComponentType } from "react";

/** 플러그인이 구현하는 인터페이스 */
export interface TomatoPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  activate(ctx: PluginContext): PluginContributions;
  deactivate?(): void;
}

/** 코어 → 플러그인: 플러그인이 사용할 수 있는 코어 API */
export interface PluginContext {
  notifications: {
    show(title: string, body: string): Promise<void>;
  };
  audio: {
    playAlarm(): Promise<void>;
  };
}

/** 플러그인 → 코어: 플러그인이 등록하는 확장 */
export interface PluginContributions {
  views?: ViewContribution[];
  navItems?: NavItemContribution[];
}

export interface ViewContribution {
  id: string;
  component: ComponentType;
}

export interface NavItemContribution {
  viewId: string;
  label: string;
  icon: ComponentType;
  order?: number;
}
