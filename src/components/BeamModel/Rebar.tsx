import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { RebarPath } from '@/pingfa';
import { approximatePathLength, buildCurveFromPath } from '@/utils/rebarGeometry';
import { createRebarMaterial } from '@/materials/rebarMaterial';
import { getRebarLowMaterial } from '@/materials/rebarMaterialLow';

interface Props {
  path: RebarPath;
  /** 渲染缩放: mm → 米 */
  scale?: number;
  tubularSegments?: number;
  radialSegments?: number;
  /** 远景 LOD 切换距离 (世界坐标，米)。默认 6m */
  lodDistance?: number;
}

/**
 * 钢筋渲染：使用 THREE.LOD
 *  - Level 0 (近): TubeGeometry + PBR(MeshStandardMaterial) + 程序化螺纹法线贴图
 *  - Level 1 (远): 低分段 TubeGeometry + MeshLambertMaterial(共享单例)
 * 距离按 LOD 节点的世界坐标到相机的距离计算 (R3F 内部每帧 update)。
 */
export function Rebar({
  path,
  scale = 0.001,
  tubularSegments,
  radialSegments,
  lodDistance = 6,
}: Props) {
  const lod = useMemo(() => {
    const curve = buildCurveFromPath(path);
    const length = approximatePathLength(path);
    const radius = path.diameter / 2;

    // 分段策略
    // 箍筋: 周长 ~1.8m 中有 5~7 个圆角, 每个圆弧只占总长 ~2~3% ,
    //       按 TubeGeometry 沿弧长均匀分段的特性, 必须把整体分段调到很高
    //       才能让每个圆弧拿到 >=12 段. 这里用 length/6, 上限 800.
    // 纵筋: 几乎全是直线 + 锚固弯钩, length/30 已足够.
    const isStirrup = path.kind === 'stirrup';
    const defaultSegs = isStirrup
      ? Math.max(220, Math.min(800, Math.round(length / 6)))
      : Math.max(40, Math.min(400, Math.round(length / 28)));
    const segsHigh = tubularSegments ?? defaultSegs;
    // 管壁圆周分段: 箍筋直径小、近距离观察时 16 段会显棱角, 升至 20.
    const defaultRadial = isStirrup ? 20 : 16;
    const radialFinal = radialSegments ?? defaultRadial;
    const geoHigh = new THREE.TubeGeometry(
      curve as unknown as THREE.Curve<THREE.Vector3>,
      segsHigh,
      radius,
      radialFinal,
      false,
    );
    const matHigh = createRebarMaterial(path.diameter, length);
    if (path.warn) {
      // 净距不足: 红色发光
      matHigh.color = new THREE.Color(0xef4444);
      matHigh.emissive = new THREE.Color(0x7f1d1d);
      matHigh.emissiveIntensity = 0.5;
    }
    const meshHigh = new THREE.Mesh(geoHigh, matHigh);
    meshHigh.castShadow = true;
    meshHigh.receiveShadow = true;

    // 低精度 (远景)
    const segsLow = Math.max(12, Math.round(segsHigh / 4));
    const geoLow = new THREE.TubeGeometry(
      curve as unknown as THREE.Curve<THREE.Vector3>,
      segsLow,
      radius,
      6,
      false,
    );
    const meshLow = new THREE.Mesh(geoLow, getRebarLowMaterial());
    // 远景不投阴影、不接收阴影 (再省一笔)
    meshLow.castShadow = false;
    meshLow.receiveShadow = false;

    const node = new THREE.LOD();
    // 距离阈值受父级 scale 影响：父 group 缩放 = scale，但 LOD 内部
    // 用世界距离比较 — 子 mesh 的 scale 不影响阈值，只影响外观。我们直接给世界距离阈值。
    node.addLevel(meshHigh, 0);
    node.addLevel(meshLow, lodDistance);
    return node;
  }, [path, tubularSegments, radialSegments, lodDistance]);

  // 卸载时释放 GPU 资源
  useEffect(() => {
    return () => {
      lod.levels.forEach((lvl) => {
        const m = lvl.object as THREE.Mesh;
        m.geometry?.dispose();
        // 共享低模材质不 dispose；仅 dispose 高模 (按直径长度生成的副本)
        if (m.material === (lvl === lod.levels[0] ? m.material : null)) {
          // no-op
        }
      });
      // 高模材质单独 dispose
      const high = lod.levels[0]?.object as THREE.Mesh | undefined;
      if (high && high.material instanceof THREE.MeshStandardMaterial) {
        const mat = high.material;
        mat.normalMap?.dispose();
        mat.roughnessMap?.dispose();
        mat.dispose();
      }
    };
  }, [lod]);

  return <primitive object={lod} scale={[scale, scale, scale]} />;
}
