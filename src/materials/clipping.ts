// 三向剖切平面 — 全局单例，所有材质共享同一组 Plane 引用，
// 通过修改 plane.constant 实时更新，不需重建材质。
import * as THREE from 'three';

// 法向约定:
//  X: normal = (-1, 0, 0) → 保留 x ≤ constant
//  Y: normal = (0, -1, 0) → 保留 y ≤ constant
//  Z: normal = (0, 0, -1) → 保留 z ≤ constant
// constant 默认设为很大正值 (1e6)，等效"不剖切"
export const clipPlaneX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1e6);
export const clipPlaneY = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6);
export const clipPlaneZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e6);

/** 应用到所有材质的 clippingPlanes (相同引用) */
export const CLIP_PLANES: THREE.Plane[] = [clipPlaneX, clipPlaneY, clipPlaneZ];

/** 取消某轴剖切 = constant 设为极大值 */
export const CLIP_DISABLED = 1e6;

export interface ClipState {
  xEnabled: boolean;
  xValue: number; // mm, 世界坐标 (居中后)
  yEnabled: boolean;
  yValue: number;
  zEnabled: boolean;
  zValue: number;
}

/** 把 store 中的 mm 数值同步到 plane.constant (m) */
export function applyClipState(state: ClipState, sceneScale = 0.001): void {
  clipPlaneX.constant = state.xEnabled ? state.xValue * sceneScale : CLIP_DISABLED;
  clipPlaneY.constant = state.yEnabled ? state.yValue * sceneScale : CLIP_DISABLED;
  clipPlaneZ.constant = state.zEnabled ? state.zValue * sceneScale : CLIP_DISABLED;
}
