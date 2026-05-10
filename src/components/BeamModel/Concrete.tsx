import { useMemo } from 'react';
import * as THREE from 'three';
import { getConcreteMaterial } from '@/materials/rebarMaterial';

interface Props {
  width: number;   // mm (Z 方向)
  height: number;  // mm (Y 方向)
  length: number;  // mm (X 方向)
  transparent: boolean;
  scale?: number;
}

export function Concrete({ width, height, length, transparent, scale = 0.001 }: Props) {
  const { geometry, edges } = useMemo(() => {
    const geo = new THREE.BoxGeometry(length, height, width);
    // 移到原点为左端
    geo.translate(length / 2, 0, 0);
    const edgeGeo = new THREE.EdgesGeometry(geo, 1);
    return { geometry: geo, edges: edgeGeo };
  }, [width, height, length]);

  const mat = getConcreteMaterial(transparent);

  return (
    <group scale={[scale, scale, scale]}>
      <mesh geometry={geometry} material={mat} renderOrder={1} />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={0x6b7785} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}
