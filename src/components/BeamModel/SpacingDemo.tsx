import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { BeamGeometry } from '@/pingfa';

interface Props {
  geom: BeamGeometry;
  scale: number;
}

/** 在加密区与非加密区之间循环移动游标，演示间距 */
export function SpacingDemo({ geom, scale }: Props) {
  const ref = useRef<THREE.Group>(null!);
  const { params, derived } = geom;
  const yTop = (params.height / 2 + 80) * scale;
  const totalLen = derived.totalLength * scale;

  // 取两段：左加密区中心、跨中
  const denseCenterX = (params.supportLeft + derived.densifyLength / 2) * scale;
  const midCenterX = (derived.totalLength / 2) * scale;

  useFrame(({ clock }) => {
    const t = (Math.sin(clock.elapsedTime * 0.6) + 1) / 2; // 0~1
    if (ref.current) ref.current.position.x = THREE.MathUtils.lerp(denseCenterX, midCenterX, t);
  });

  return (
    <group>
      {/* 顶部参考线 */}
      <Line
        points={[
          [0, yTop, 0],
          [totalLen, yTop, 0],
        ]}
        color="#1e293b"
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.03}
      />
      <group ref={ref}>
        <Html center distanceFactor={6}>
          <div className="px-2 py-1 bg-blue-900/90 text-blue-50 text-xs rounded border border-blue-500 shadow-lg whitespace-nowrap">
            <div className="font-bold">间距演示</div>
            <div>加密区: {derived.densifySpacing} mm</div>
            <div>非加密: {derived.normalSpacing} mm</div>
          </div>
        </Html>
      </group>
    </group>
  );
}
