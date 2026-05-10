import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
type OrbitControlsImpl = { target: THREE.Vector3; update: () => void };
import { useBeamStore } from '@/store/useBeamStore';

const PRESETS = {
  iso: { pos: [6, 4, 6], target: [0, 0, 0] },
  front: { pos: [0, 0, 10], target: [0, 0, 0] }, // 沿 -Z 方向看 (Z 轴正面)
  side: { pos: [10, 0, 0], target: [0, 0, 0] }, // 沿 -X 方向看 (梁端面)
  top: { pos: [0, 10, 0.001], target: [0, 0, 0] }, // 顶视
} as const;

/**
 * 相机控制器:
 *  - 根据 store.view.cameraMode 切换 PerspectiveCamera / OrthographicCamera
 *  - 监听 viewPresetTick 触发预设跳转, 每帧用 lerp 平滑过渡
 */
export function CameraRig() {
  const cameraMode = useBeamStore((s) => s.view.cameraMode);
  const viewPreset = useBeamStore((s) => s.view.viewPreset);
  const tick = useBeamStore((s) => s.view.viewPresetTick);

  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  // 目标位姿 (随预设变化, 每帧 lerp 趋近)
  const targetPos = useRef(new THREE.Vector3(...PRESETS.iso.pos));
  const targetLookAt = useRef(new THREE.Vector3(...PRESETS.iso.target));
  const animating = useRef(false);

  useEffect(() => {
    const p = PRESETS[viewPreset];
    targetPos.current.set(...(p.pos as [number, number, number]));
    targetLookAt.current.set(...(p.target as [number, number, number]));
    animating.current = true;
  }, [viewPreset, tick]);

  useFrame(({ camera }) => {
    if (!animating.current) return;
    const speed = 0.12;
    camera.position.lerp(targetPos.current, speed);
    if (controls) {
      controls.target.lerp(targetLookAt.current, speed);
      controls.update();
    } else {
      camera.lookAt(targetLookAt.current);
    }
    if (camera.position.distanceTo(targetPos.current) < 0.01) {
      animating.current = false;
    }
  });

  if (cameraMode === 'orthographic') {
    return (
      <OrthographicCamera
        makeDefault
        position={[6, 4, 6]}
        zoom={80}
        near={-50}
        far={200}
      />
    );
  }
  return (
    <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={45} near={0.05} far={200} />
  );
}
