import { create } from 'zustand';
import type { BeamParams } from '@/pingfa';

interface ViewState {
  concreteTransparent: boolean;
  showStirrups: boolean;
  showLongitudinal: boolean;
  showDimensions: boolean;
  showSpacingDemo: boolean;
  // 三向剖切 (mm, 在世界坐标 / 居中后梁的本地坐标)
  clipXEnabled: boolean;
  clipX: number;
  clipYEnabled: boolean;
  clipY: number;
  clipZEnabled: boolean;
  clipZ: number;
  exploded: number;
  cameraMode: 'perspective' | 'orthographic';
  /** 触发预设跳转 (一次性, 应用后由 Controller 自行清除) */
  viewPresetTick: number;
  viewPreset: 'iso' | 'front' | 'side' | 'top';
  showWarnings: boolean;
}

interface BeamStore {
  params: BeamParams;
  view: ViewState;
  setParam: <K extends keyof BeamParams>(key: K, value: BeamParams[K]) => void;
  setParams: (patch: Partial<BeamParams>) => void;
  setView: (patch: Partial<ViewState>) => void;
  reset: () => void;
}

export const DEFAULT_PARAMS: BeamParams = {
  span: 6000,
  width: 300,
  height: 600,
  cover: 25,
  supportLeft: 400,
  supportRight: 400,
  concreteGrade: 'C30',
  rebarGrade: 'HRB400',
  seismicLevel: 2,
  topDiameter: 25,
  topCount: 2,
  botDiameter: 25,
  botCount: 3,
  stirrupDiameter: 8,
  stirrupSpacingDense: 100,
  stirrupSpacingNormal: 200,
  stirrupLegs: 2,
};

const DEFAULT_VIEW: ViewState = {
  concreteTransparent: true,
  showStirrups: true,
  showLongitudinal: true,
  showDimensions: true,
  showSpacingDemo: false,
  clipXEnabled: false,
  clipX: 0,
  clipYEnabled: false,
  clipY: 0,
  clipZEnabled: false,
  clipZ: 0,
  exploded: 0,
  cameraMode: 'perspective',
  viewPresetTick: 0,
  viewPreset: 'iso',
  showWarnings: true,
};

export const useBeamStore = create<BeamStore>((set) => ({
  params: { ...DEFAULT_PARAMS },
  view: { ...DEFAULT_VIEW },
  setParam: (key, value) => set((s) => ({ params: { ...s.params, [key]: value } })),
  setParams: (patch) => set((s) => ({ params: { ...s.params, ...patch } })),
  setView: (patch) => set((s) => ({ view: { ...s.view, ...patch } })),
  reset: () => set({ params: { ...DEFAULT_PARAMS }, view: { ...DEFAULT_VIEW } }),
}));
