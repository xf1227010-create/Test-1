import { Html, Line } from '@react-three/drei';
import type { BeamGeometry } from '@/pingfa';

interface Props {
  geom: BeamGeometry;
  scale: number;
}

/** 简易尺寸标注：梁长、截面 b×h、加密区长度 */
export function Dimensions({ geom, scale }: Props) {
  const { concrete, derived, params } = geom;
  const L = concrete.length;
  const H = concrete.height;
  const W = concrete.width;
  const s = scale;

  // 总长尺寸线 (在梁底下方 H 处)
  const yLine = (-H / 2 - 200) * s;
  const zLine = 0;

  return (
    <group>
      {/* 梁全长 */}
      <Line
        points={[
          [0, yLine, zLine],
          [L * s, yLine, zLine],
        ]}
        color="#94a3b8"
        lineWidth={1}
      />
      <Html position={[(L / 2) * s, yLine - 0.05, zLine]} center distanceFactor={8}>
        <div className="px-2 py-0.5 bg-slate-900/80 text-slate-100 text-xs rounded border border-slate-600 whitespace-nowrap">
          总长 {L} mm (净跨 {params.span})
        </div>
      </Html>

      {/* 截面 b×h */}
      <Html position={[L * s + 0.3, 0, 0]} center distanceFactor={8}>
        <div className="px-2 py-1 bg-slate-900/80 text-slate-100 text-xs rounded border border-slate-600">
          <div>截面 b×h = {params.width}×{params.height}</div>
          <div className="text-slate-400">保护层 c = {params.cover}</div>
        </div>
      </Html>

      {/* 加密区标识 */}
      {derived.densifyLength > 0 && (
        <>
          <Line
            points={[
              [params.supportLeft * s, (H / 2 + 100) * s, (W / 2 + 50) * s],
              [(params.supportLeft + derived.densifyLength) * s, (H / 2 + 100) * s, (W / 2 + 50) * s],
            ]}
            color="#f97316"
            lineWidth={2}
          />
          <Html
            position={[
              (params.supportLeft + derived.densifyLength / 2) * s,
              (H / 2 + 200) * s,
              (W / 2 + 50) * s,
            ]}
            center
            distanceFactor={8}
          >
            <div className="px-2 py-0.5 bg-orange-900/80 text-orange-100 text-xs rounded border border-orange-600 whitespace-nowrap">
              加密区 {derived.densifyLength} mm @ {derived.densifySpacing}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
