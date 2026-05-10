import type { BeamGeometry, BeamParams } from './types';
import { computeLae } from './anchorage';
import {
  buildStirrupPath,
  computeDensifyLength,
  computeDensifySpacing,
  computeStirrupHookStraight,
  distributeStirrups,
} from './stirrup';
import { buildLongitudinal } from './longitudinal';

export * from './types';
export { computeLae } from './anchorage';
export {
  computeDensifyLength,
  computeDensifySpacing,
  computeStirrupHookStraight,
} from './stirrup';

/** 主入口: 由参数构建梁的完整三维几何描述 */
export function buildBeam(params: BeamParams): BeamGeometry {
  const totalLength = params.span + params.supportLeft + params.supportRight;

  // 锚固长度按上下纵筋直径较大者取值
  const dMaxLong = Math.max(params.topDiameter, params.botDiameter);
  const lae = computeLae(dMaxLong, params.concreteGrade, params.rebarGrade, params.seismicLevel);

  const densifyLen = computeDensifyLength(params);
  const densifySpacing = params.stirrupSpacingDense || computeDensifySpacing(params);
  const normalSpacing = params.stirrupSpacingNormal;
  const hookStraight = computeStirrupHookStraight(params.stirrupDiameter);

  // 纵筋
  const longitudinals = [
    ...buildLongitudinal(params, lae, 'top'),
    ...buildLongitudinal(params, lae, 'bottom'),
  ];

  // 箍筋
  const xs = distributeStirrups(params, densifyLen, densifySpacing, normalSpacing);
  const stirrups = xs.flatMap((x) => {
    const outer = buildStirrupPath(x, params.width, params.height, params.stirrupDiameter, hookStraight, 'outer');
    if (params.stirrupLegs !== 4) return [outer];
    // 4 肢箍 = 大箍 + 内套小箍。
    // 内箍宽度: 让其两腿位于下部纵筋"内对"的位置 (botCount>=4 时取中间两根的间距;
    // 否则取大箍宽度的 1/3 作为简化值)
    const dStir = params.stirrupDiameter;
    const dBot = params.botDiameter;
    const zEdge = params.width / 2 - params.cover - dStir - dBot / 2;
    let innerLegSpacing: number;
    if (params.botCount >= 4) {
      const step = (2 * zEdge) / (params.botCount - 1);
      // 内对纵筋: index = floor((n-1)/2) 与 (n-1) - floor((n-1)/2)
      const lo = Math.floor((params.botCount - 1) / 2);
      const hi = params.botCount - 1 - lo;
      innerLegSpacing = (hi - lo) * step;
    } else {
      innerLegSpacing = (params.width - 2 * params.cover - 2 * dStir) / 3;
    }
    // 内箍外皮宽度 = 内对纵筋间距 + 纵筋直径 + 2 * 箍筋直径 (内箍包住纵筋)
    const innerOuterWidth = innerLegSpacing + dBot + 2 * dStir;
    const inner = buildStirrupPath(
      x,
      innerOuterWidth,
      params.height,
      params.stirrupDiameter,
      hookStraight,
      'inner',
    );
    return [outer, inner];
  });

  // 净距校核 (上部 max(1.5d, 30); 下部 max(d, 25))
  const warnings: string[] = [];
  const checkRow = (kind: 'longitudinal-top' | 'longitudinal-bottom') => {
    const row = longitudinals.filter((r) => r.kind === kind);
    if (row.length < 2) return;
    const sorted = [...row].sort((a, b) => a.points[0].z - b.points[0].z);
    const isTop = kind === 'longitudinal-top';
    const minClear = isTop
      ? Math.max(1.5 * sorted[0].diameter, 30)
      : Math.max(sorted[0].diameter, 25);
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1];
      const b = sorted[i];
      const center = b.points[0].z - a.points[0].z;
      const clear = center - (a.diameter + b.diameter) / 2;
      if (clear < minClear) {
        warnings.push(
          `${isTop ? '上部' : '下部'}纵筋净距 ${clear.toFixed(0)} mm < 规范 ${minClear} mm`,
        );
        a.warn = true;
        b.warn = true;
      }
    }
  };
  checkRow('longitudinal-top');
  checkRow('longitudinal-bottom');

  return {
    params,
    concrete: { width: params.width, height: params.height, length: totalLength },
    rebars: [...longitudinals, ...stirrups],
    derived: {
      lae,
      densifyLength: densifyLen,
      densifySpacing,
      normalSpacing,
      stirrupHookStraight: hookStraight,
      totalLength,
    },
    warnings,
  };
}
