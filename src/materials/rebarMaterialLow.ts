import * as THREE from 'three';
import { CLIP_PLANES } from './clipping';

let _lowMat: THREE.MeshLambertMaterial | null = null;

/**
 * 远景 LOD 用低成本材质：MeshLambertMaterial，无贴图。
 * 单例共享 — 所有钢筋远景使用同一材质，进一步降低绘制开销。
 */
export function getRebarLowMaterial(): THREE.MeshLambertMaterial {
  if (!_lowMat) {
    _lowMat = new THREE.MeshLambertMaterial({
      color: 0x6e7480,
      clippingPlanes: CLIP_PLANES,
      clipShadows: true,
    });
  }
  return _lowMat;
}
