import { useMemo } from 'react';
import { useBeamStore } from '@/store/useBeamStore';
import { buildBeam } from '@/pingfa';
import { Concrete } from './Concrete';
import { Rebar } from './Rebar';
import { Dimensions } from './Dimensions';
import { SpacingDemo } from './SpacingDemo';

export function BeamModel() {
  const params = useBeamStore((s) => s.params);
  const view = useBeamStore((s) => s.view);

  const geom = useMemo(() => buildBeam(params), [params]);

  // 居中：让梁中心在原点
  const xOffset = -geom.derived.totalLength / 2;
  const scale = 0.001;

  // 爆炸视图: 混凝土向下偏移, 上部纵筋向上, 下部纵筋向下, 箍筋两侧分开
  const ex = view.exploded;
  const concreteDy = -ex * geom.concrete.height * 1.5 * scale;
  const topDy = ex * geom.concrete.height * 0.6 * scale;
  const botDy = -ex * geom.concrete.height * 0.6 * scale;
  const stirrupDz = ex * geom.concrete.width * 1.2 * scale;

  // 给箍筋按 z 中心正负方向拆开 (实际箍筋形心都在 z=0,
  // 这里按 id 末位奇偶简化为左右两组, 视觉上"展开"即可)
  const stirrupSign = (id: string) => (id.charCodeAt(id.length - 1) % 2 === 0 ? 1 : -1);

  return (
    <group position={[xOffset * scale, 0, 0]}>
      <group position={[0, concreteDy, 0]}>
        <Concrete
          width={geom.concrete.width}
          height={geom.concrete.height}
          length={geom.concrete.length}
          transparent={view.concreteTransparent}
          scale={scale}
        />
      </group>

      {view.showLongitudinal &&
        geom.rebars
          .filter((r) => r.kind !== 'stirrup')
          .map((r) => (
            <group key={r.id} position={[0, r.kind === 'longitudinal-top' ? topDy : botDy, 0]}>
              <Rebar path={r} scale={scale} />
            </group>
          ))}

      {view.showStirrups &&
        geom.rebars
          .filter((r) => r.kind === 'stirrup')
          .map((r) => (
            <group key={r.id} position={[0, 0, stirrupSign(r.id) * stirrupDz]}>
              <Rebar path={r} scale={scale} radialSegments={12} />
            </group>
          ))}

      {view.showDimensions && <Dimensions geom={geom} scale={scale} />}
      {view.showSpacingDemo && <SpacingDemo geom={geom} scale={scale} />}
    </group>
  );
}
