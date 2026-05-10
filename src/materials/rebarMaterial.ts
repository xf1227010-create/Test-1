import * as THREE from 'three';
import { generateRebarNormalMap, generateRebarRoughnessMap } from './rebarNormalMap';
import { CLIP_PLANES } from './clipping';

let _normalMap: THREE.CanvasTexture | null = null;
let _roughMap: THREE.CanvasTexture | null = null;

function getNormalMap() {
  if (!_normalMap) _normalMap = generateRebarNormalMap();
  return _normalMap;
}
function getRoughMap() {
  if (!_roughMap) _roughMap = generateRebarRoughnessMap();
  return _roughMap;
}

/**
 * 创建钢筋 PBR 材质。
 * @param diameter 钢筋直径 (mm)，用于动态调整法线贴图 UV 重复
 * @param length 钢筋估算长度 (mm)，用于沿轴向重复
 */
export function createRebarMaterial(diameter: number, length: number): THREE.MeshStandardMaterial {
  const normal = getNormalMap().clone();
  normal.needsUpdate = true;
  // 螺距 ~= 0.7 * diameter (HRB 钢筋经验值)，每米肋数 ≈ 1000 / pitch
  const pitch = 0.7 * diameter;
  const repeatV = Math.max(2, length / (4 * pitch)); // 一个贴图周期含 4 圈横肋
  // 圆周方向 1 圈 = 1 张贴图
  normal.repeat.set(1, repeatV);

  const rough = getRoughMap().clone();
  rough.needsUpdate = true;
  rough.repeat.set(2, repeatV);

  return new THREE.MeshStandardMaterial({
    color: 0x6e7480,
    metalness: 0.85,
    roughness: 0.5,
    normalMap: normal,
    normalScale: new THREE.Vector2(1.4, 1.4),
    roughnessMap: rough,
    clippingPlanes: CLIP_PLANES,
    clipShadows: true,
  });
}

let _concreteMat: THREE.MeshStandardMaterial | null = null;
export function getConcreteMaterial(transparent = true): THREE.MeshStandardMaterial {
  if (!_concreteMat) {
    _concreteMat = new THREE.MeshStandardMaterial({
      color: 0xc8c4b8,
      metalness: 0.0,
      roughness: 0.95,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      clippingPlanes: CLIP_PLANES,
      clipShadows: true,
      side: THREE.DoubleSide, // 剖切后能看到内部背面
    });
  }
  _concreteMat.opacity = transparent ? 0.18 : 1.0;
  _concreteMat.depthWrite = !transparent;
  _concreteMat.needsUpdate = true;
  return _concreteMat;
}
